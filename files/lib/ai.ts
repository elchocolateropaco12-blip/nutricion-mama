/**
 * Capa de IA. Todo el contacto con el proveedor pasa por aquí, así cambiar
 * de Gemini a GPT-4o (o a Claude) es tocar un solo archivo.
 *
 * Modelo por defecto: Gemini Flash vía REST.
 *
 * ⚠️ LOS MODELOS CADUCAN. `gemini-2.5-flash` se apaga el 16 de octubre de 2026.
 * Estables de la familia 3 a fecha de agosto de 2026: gemini-3.6-flash,
 * gemini-3.5-flash, gemini-3.5-flash-lite, gemini-3.1-flash-lite.
 *
 * El ID va en GEMINI_MODEL a propósito: cambiarlo es tocar una variable en
 * Vercel y volver a desplegar, sin tocar código. Mira las fechas de retirada
 * en https://ai.google.dev/gemini-api/docs/deprecations
 */

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

async function callGemini(opts: {
  system: string;
  parts: GeminiPart[];
  schema: Record<string, unknown>;
  temperature?: number;
}): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta GEMINI_API_KEY en el entorno.");

  const res = await fetch(`${GEMINI_ENDPOINT}/${MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: opts.parts }],
      generationConfig: {
        temperature: opts.temperature ?? 0.2,
        responseMimeType: "application/json",
        responseSchema: opts.schema,
      },
    }),
    // La foto puede tardar. Sin esto Vercel corta a los 10 s en el plan gratis.
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini respondió ${res.status}: ${detail.slice(0, 400)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini devolvió una respuesta vacía.");

  return JSON.parse(text.replace(/^```json\s*|\s*```$/g, "").trim());
}

// ─────────────────────────────────────────── 1. Análisis de foto

const PHOTO_SYSTEM = `Eres un analista nutricional que estima los macronutrientes de un plato a partir de una foto.

La persona de la foto está en tratamiento de quimioterapia y tiene colelitiasis (piedras en la vesícula), así que la grasa total es el dato crítico.

REGLAS:
- Estima las cantidades por la referencia visual del plato, cubiertos o mano. Si no puedes, asume una ración doméstica española estándar.
- Sé conservador con la grasa: ante la duda, estima al alza. Es más seguro avisar de más que de menos.
- Fíjate en indicios de fritura, rebozado, salsas cremosas, mantequilla, embutido o queso curado: suben la grasa mucho.
- dish_name: en español, minúsculas salvo nombres propios, máximo 6 palabras, describiendo lo que se ve.
- Si la foto no es comida o no se distingue nada, devuelve confidence "baja", dish_name "no identificado" y todos los valores a 0.
- Nunca inventes precisión: estos números son estimaciones.`;

const PHOTO_SCHEMA = {
  type: "OBJECT",
  properties: {
    dish_name: { type: "STRING" },
    calories: { type: "NUMBER" },
    proteins_g: { type: "NUMBER" },
    fats_g: { type: "NUMBER" },
    saturated_fats_g: { type: "NUMBER" },
    carbs_g: { type: "NUMBER" },
    fiber_g: { type: "NUMBER" },
    sodium_mg: { type: "NUMBER" },
    added_sugars_g: { type: "NUMBER" },
    confidence: { type: "STRING", enum: ["alta", "media", "baja"] },
    notes: { type: "STRING" },
  },
  required: [
    "dish_name",
    "calories",
    "proteins_g",
    "fats_g",
    "saturated_fats_g",
    "carbs_g",
    "fiber_g",
    "sodium_mg",
    "added_sugars_g",
    "confidence",
  ],
};

export interface PhotoAnalysis {
  dish_name: string;
  calories: number;
  proteins_g: number;
  fats_g: number;
  saturated_fats_g: number;
  carbs_g: number;
  fiber_g: number;
  sodium_mg: number;
  added_sugars_g: number;
  confidence: "alta" | "media" | "baja";
  notes?: string;
}

export async function analyzeMealPhoto(
  base64: string,
  mimeType: string,
  slot: string
): Promise<PhotoAnalysis> {
  return (await callGemini({
    system: PHOTO_SYSTEM,
    parts: [
      { inline_data: { mime_type: mimeType, data: base64 } },
      { text: `Esta foto corresponde a la ${slot}. Analiza el plato.` },
    ],
    schema: PHOTO_SCHEMA,
    temperature: 0.1,
  })) as PhotoAnalysis;
}

// ─────────────────────────────────────────── 2. Agente "Rodrigo"

/**
 * El tono importa más que la nota. Un día de quimio con poco apetito no es
 * un fallo de ella, y el prompt lo dice explícitamente para que el modelo
 * no la riña cuando peor se encuentre.
 */
const RODRIGO_SYSTEM = `Eres Rodrigo, el hijo de la usuaria. Analizas la nutrición diaria de tu madre con un tono filial, cariñoso, claro y alentador.

SU SITUACIÓN:
Está en tratamiento de linfoma no Hodgkin (R-CHOP / R-DHAP) con corticoides. Tiene colelitiasis y mucositis. Hay días de fatiga, náuseas y boca dolorida en los que comer cuesta mucho.

SUS METAS MÉDICAS DIARIAS:
- Calorías: 1500-1650 kcal
- Proteína: 85-100 g
- Fibra: 20-25 g
- Grasa: máximo 15 g por comida, para proteger la vesícula

CÓMO PUNTUAR (1 a 10):
- Puntúa el día comparando los totales con las metas.
- Comer poco en un día malo NO es un suspenso. Si ha registrado las cuatro comidas aunque los números se queden cortos, el suelo es un 6: hacer el esfuerzo cuenta.
- Reserva las notas bajas para días en los que se pueda mejorar algo concreto y realista.
- Un 10 es un día redondo, no un día perfecto.

CÓMO ESCRIBIR EL FEEDBACK (3-4 frases):
- Habla de tú, como un hijo, no como un médico ni como una app.
- Empieza por lo que ha salido bien. Siempre hay algo.
- Da la nota y UNA recomendación concreta para mañana, no una lista.
- Si algún plato ha pasado de 15 g de grasa, menciónalo con suavidad y explica el porqué (la vesícula), sin dramatizar.
- Nada de emojis, ni de "¡genial!", ni de lenguaje de coach. Cercano y tranquilo.
- Nunca digas que estás orgulloso de sus números. Di que te alegra verla comer.`;

const SUMMARY_SCHEMA = {
  type: "OBJECT",
  properties: {
    score: { type: "NUMBER" },
    totals: {
      type: "OBJECT",
      properties: {
        calories: { type: "NUMBER" },
        proteins_g: { type: "NUMBER" },
        fats_g: { type: "NUMBER" },
        fiber_g: { type: "NUMBER" },
      },
      required: ["calories", "proteins_g", "fats_g", "fiber_g"],
    },
    rodrigo_feedback: { type: "STRING" },
  },
  required: ["score", "totals", "rodrigo_feedback"],
};

export interface RodrigoSummary {
  score: number;
  totals: {
    calories: number;
    proteins_g: number;
    fats_g: number;
    fiber_g: number;
  };
  rodrigo_feedback: string;
}

export async function generateRodrigoSummary(payload: {
  date: string;
  meals: Array<{
    slot: string;
    dish_name: string;
    calories: number;
    proteins_g: number;
    fats_g: number;
    fiber_g: number;
    fat_warning: boolean;
  }>;
  totals: RodrigoSummary["totals"];
}): Promise<RodrigoSummary> {
  return (await callGemini({
    system: RODRIGO_SYSTEM,
    parts: [
      {
        text:
          `Día: ${payload.date}\n\n` +
          `Comidas registradas:\n` +
          payload.meals
            .map(
              (m) =>
                `- ${m.slot}: ${m.dish_name} — ${m.calories} kcal, ` +
                `${m.proteins_g} g proteína, ${m.fats_g} g grasa, ` +
                `${m.fiber_g} g fibra${m.fat_warning ? "  ⚠ pasa de 15 g de grasa" : ""}`
            )
            .join("\n") +
          `\n\nTotales del día: ${payload.totals.calories} kcal, ` +
          `${payload.totals.proteins_g} g proteína, ${payload.totals.fats_g} g grasa, ` +
          `${payload.totals.fiber_g} g fibra.\n\n` +
          `Devuelve el JSON con la nota y tu valoración. En "totals" copia exactamente los totales que te he dado.`,
      },
    ],
    schema: SUMMARY_SCHEMA,
    temperature: 0.6,
  })) as RodrigoSummary;
}
