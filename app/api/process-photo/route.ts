import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mealType = formData.get('meal_type') as string || 'comida';

    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado imagen' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta la API Key de Gemini' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const promptText = `
Analiza la siguiente imagen de comida para una persona de 52 años en tratamiento oncológico.
Identifica el plato y calcula sus valores nutricionales aproximados.

Responde ÚNICAMENTE en formato JSON plano con este esquema exacto, sin bloques de código ni markdown:
{
  "dish_name": "Nombre descriptivo del plato",
  "calories": 350,
  "proteins_g": 25,
  "fats_g": 10,
  "carbs_g": 40,
  "fiber_g": 4
}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
      console.error('Error en Gemini:', errText);
      return NextResponse.json({
        dish_name: 'Plato personalizado',
        calories: 350,
        proteins_g: 20,
        fats_g: 10,
        carbs_g: 40,
        fiber_g: 4,
        image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop&q=80'
      });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let parsedJson: any = {};
    try {
      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleanJsonStr);
    } catch {
      parsedJson = {
        dish_name: 'Plato analizado por foto',
        calories: 350,
        proteins_g: 20,
        fats_g: 10,
        carbs_g: 40,
        fiber_g: 4
      };
    }

    return NextResponse.json({
      dish_name: parsedJson.dish_name || 'Plato analizado',
      calories: Number(parsedJson.calories) || 350,
      proteins_g: Number(parsedJson.proteins_g) || 20,
      fats_g: Number(parsedJson.fats_g) || 10,
      carbs_g: Number(parsedJson.carbs_g) || 40,
      fiber_g: Number(parsedJson.fiber_g) || 4,
      image_url: `data:${mimeType};base64,${base64Image}`
    });

  } catch (error: any) {
    console.error('Error en process-photo:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
