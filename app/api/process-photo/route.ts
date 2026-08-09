import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta GEMINI_API_KEY' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ninguna imagen' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Analiza la foto de esta comida e identifica el plato. Devuelve ÚNICAMENTE un objeto JSON estricto sin bloques de código markdown:
{
  "dish_name": "Nombre del plato",
  "calories": number,
  "proteins_g": number,
  "fats_g": number,
  "carbs_g": number,
  "fiber_g": number,
  "sodium_mg": number,
  "fat_warning": boolean
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type || 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text().trim().replace(/```json|```/g, '');
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error procesando imagen:', error);
    return NextResponse.json({ error: 'Error al analizar la foto', details: error.message }, { status: 500 });
  }
}
