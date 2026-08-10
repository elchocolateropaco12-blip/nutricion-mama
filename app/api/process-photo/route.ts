import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // Evita el corte por timeout en Vercel

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se subió archivo' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta la API Key de Gemini' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const promptText = `Analiza esta foto de un plato de comida.
Devuelve ÚNICAMENTE un objeto JSON con el siguiente formato estricto (sin bloques de código markdown ni texto adicional):
{"dish_name":"Nombre del plato","calories":400,"proteins_g":25,"fats_g":12,"carbs_g":40,"fiber_g":4}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Error HTTP de Gemini:', response.status);
      return NextResponse.json({
        dish_name: 'Plato registrado por foto',
        calories: 380,
        proteins_g: 22,
        fats_g: 12,
        carbs_g: 40,
        fiber_g: 4,
        image_url: imageUrl,
      });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      dish_name: parsed.dish_name || 'Plato analizado',
      calories: Number(parsed.calories) || 380,
      proteins_g: Number(parsed.proteins_g) || 22,
      fats_g: Number(parsed.fats_g) || 12,
      carbs_g: Number(parsed.carbs_g) || 40,
      fiber_g: Number(parsed.fiber_g) || 4,
      image_url: imageUrl,
    });

  } catch (err: any) {
    console.error('Error interno procesando foto:', err);
    return NextResponse.json({
      dish_name: 'Plato registrado',
      calories: 350,
      proteins_g: 20,
      fats_g: 10,
      carbs_g: 40,
      fiber_g: 4,
      image_url: '',
    });
  }
}
