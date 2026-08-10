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
Analiza detenidamente esta fotografía de un plato de comida.
Identifica los ingredientes visibles y calcula de forma realista los valores nutricionales totales del plato.

Responde ÚNICAMENTE en formato JSON plano estricto con esta estructura exacta, sin texto previo ni posterior, sin bloques markdown:
{
  "dish_name": "Nombre exacto del plato identificado",
  "calories": 450,
  "proteins_g": 30,
  "fats_g": 15,
  "carbs_g": 45,
  "fiber_g": 5
}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Error API Gemini:', errText);
      return NextResponse.json({ error: `Error en la API de Gemini: ${geminiRes.status}` }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleanJsonStr);

    return NextResponse.json({
      dish_name: parsedJson.dish_name || 'Plato analizado',
      calories: Number(parsedJson.calories) || 300,
      proteins_g: Number(parsedJson.proteins_g) || 15,
      fats_g: Number(parsedJson.fats_g) || 10,
      carbs_g: Number(parsedJson.carbs_g) || 30,
      fiber_g: Number(parsedJson.fiber_g) || 3,
      image_url: `data:${mimeType};base64,${base64Image}`
    });

  } catch (error: any) {
    console.error('Error interno:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la foto' }, { status: 500 });
  }
}
