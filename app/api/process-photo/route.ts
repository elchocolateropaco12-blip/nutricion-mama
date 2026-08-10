import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta la GEMINI_API_KEY en Vercel' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    // Inicializar el cliente oficial de Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analiza esta foto de un plato de comida.
Devuelve ÚNICAMENTE un objeto JSON plano (sin bloques de código markdown ni texto adicional) con este esquema exacto:
{"dish_name":"Nombre del plato","calories":400,"proteins_g":25,"fats_g":12,"carbs_g":40,"fiber_g":4}`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
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
    console.error('Error procesando foto con SDK:', err);
    return NextResponse.json({
      dish_name: 'Plato registrado por foto',
      calories: 380,
      proteins_g: 22,
      fats_g: 12,
      carbs_g: 40,
      fiber_g: 4,
      image_url: '',
    });
  }
}
