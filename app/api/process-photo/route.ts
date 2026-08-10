import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ninguna imagen' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta configurar GEMINI_API_KEY en Vercel' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const promptText = `
Analiza la imagen de este plato de comida. Identifica el nombre del plato, sus ingredientes visibles y calcula sus valores nutricionales aproximados.
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
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: {
            type: 'OBJECT',
            properties: {
              dish_name: { type: 'STRING', description: 'Nombre descriptivo e identificativo del plato' },
              calories: { type: 'NUMBER', description: 'Calorías totales estimadas' },
              proteins_g: { type: 'NUMBER', description: 'Gramos de proteína' },
              fats_g: { type: 'NUMBER', description: 'Gramos de grasa' },
              carbs_g: { type: 'NUMBER', description: 'Gramos de carbohidratos' },
              fiber_g: { type: 'NUMBER', description: 'Gramos de fibra' },
            },
            required: ['dish_name', 'calories', 'proteins_g', 'fats_g', 'carbs_g', 'fiber_g'],
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Error en Gemini:', errText);
      return NextResponse.json({ error: `Error ${geminiRes.status} de la API de Gemini` }, { status: geminiRes.status });
    }

    const data = await geminiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText);

    return NextResponse.json({
      dish_name: parsed.dish_name || 'Plato analizado por foto',
      calories: Math.round(Number(parsed.calories)) || 350,
      proteins_g: Math.round(Number(parsed.proteins_g)) || 20,
      fats_g: Math.round(Number(parsed.fats_g)) || 10,
      carbs_g: Math.round(Number(parsed.carbs_g)) || 40,
      fiber_g: Math.round(Number(parsed.fiber_g)) || 4,
      image_url: imageUrl,
    });

  } catch (error: any) {
    console.error('Error process-photo:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la imagen' }, { status: 500 });
  }
}
