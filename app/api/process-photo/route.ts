import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ningún archivo' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta configurar GEMINI_API_KEY en Vercel' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const promptText = `
Analiza detenidamente la fotografía de este plato de comida.
Identifica los ingredientes visibles y realiza un cálculo nutricional preciso.

Responde ÚNICAMENTE un objeto JSON plano con la siguiente estructura (sin markdown ni bloques \`\`\`json):
{
  "dish_name": "Nombre detallado del plato",
  "calories": 400,
  "proteins_g": 25,
  "fats_g": 12,
  "carbs_g": 45,
  "fiber_g": 5
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error Gemini API:', errText);
      return NextResponse.json({ error: `Error ${response.status} en la API de Gemini` }, { status: response.status });
    }

    const result = await response.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      dish_name: parsed.dish_name || 'Plato analizado',
      calories: Number(parsed.calories) || 350,
      proteins_g: Number(parsed.proteins_g) || 20,
      fats_g: Number(parsed.fats_g) || 10,
      carbs_g: Number(parsed.carbs_g) || 40,
      fiber_g: Number(parsed.fiber_g) || 4,
      image_url: `data:${mimeType};base64,${base64Image}`
    });

  } catch (error: any) {
    console.error('Error process-photo:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la foto' }, { status: 500 });
  }
}
