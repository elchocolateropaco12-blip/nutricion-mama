import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta GEMINI_API_KEY' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split('T')[0];

    const { data: entries, error } = await supabase
      .from('meal_entries')
      .select('*')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    if (error) throw error;

    const totals = (entries || []).reduce(
      (acc, item) => ({
        calories: acc.calories + Number(item.calories || 0),
        proteins_g: acc.proteins_g + Number(item.proteins_g || 0),
        fats_g: acc.fats_g + Number(item.fats_g || 0),
        fiber_g: acc.fiber_g + Number(item.fiber_g || 0),
      }),
      { calories: 0, proteins_g: 0, fats_g: 0, fiber_g: 0 }
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Eres Rodrigo, el hijo de la usuaria. Analizas la nutrición de tu madre con tono cariñoso, claro y cercano.
Totales consumidos hoy:
- Calorías: ${totals.calories} (Meta: 1500-1650)
- Proteínas: ${totals.proteins_g}g (Meta: 85-100g)
- Grasas: ${totals.fats_g}g (Meta: 40-50g, <14g por comida)
- Fibra: ${totals.fiber_g}g (Meta: 20-25g)

Comidas registradas: ${entries?.length || 0}/4.
Regla: Si ha registrado 4 comidas, la nota mínima es 6/10.

Devuelve un JSON estricto sin markdown:
{
  "score": number,
  "rodrigo_feedback": "string (3 frases cortas, filiales y motivadoras)"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/```json|```/g, '');
    const aiResponse = JSON.parse(responseText);

    return NextResponse.json({
      score: aiResponse.score,
      totals,
      feedback: aiResponse.rodrigo_feedback,
    });
  } catch (error: any) {
    console.error('Error en daily-summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
