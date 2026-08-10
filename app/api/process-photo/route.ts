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
Analiza la imagen de este plato de comida. Identifica ingredientes y calcula valores nutricionales aproximados.

Responde ÚNICAMENTE en formato JSON plano sin bloques de código ni markdown:
{
  "dish_name": "Nombre descriptivo del plato",
  "calories": 400,
  "proteins_g": 25,
  "fats_g": 12,
  "carbs_g": 45,
  "fiber_g": 5
}
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(endpoint, {
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
    });

    if (!geminiRes.ok) {
      const errorData = await geminiRes.text();
      return NextResponse.json({ error: `Error ${geminiRes.status} en Gemini: ${errorData}` }, { status: geminiRes.status });
    }

    const successData = await geminiRes.json();
    const rawText = successData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      dish_name: parsed.dish_name || 'Plato analizado',
      calories: Number(parsed.calories) || 350,
      proteins_g: Number(parsed.proteins_g) || 20,
      fats_g: Number(parsed.fats_g) || 10,
      carbs_g: Number(parsed.carbs_g) || 40,
      fiber_g: Number(parsed.fiber_g) || 4,
      image_url: `data:${mimeType};base64,${base64Image}`,
    });

  } catch (error: any) {
    console.error('Error process-photo:', error);
    return NextResponse.json({ error: error.message || 'Error interno al procesar la imagen' }, { status: 500 });
  }
}
