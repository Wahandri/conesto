import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function POST(request) {
  try {
    const { ingredients, difficulty, mealType, diet, portions, appliances, regeneratePart } = await request.json();
    console.log("📌 Ingredientes recibidos:", ingredients);
    console.log("📌 Filtros -> Dificultad:", difficulty, "| Tipo de comida:", mealType, "| Dieta:", diet, "| Porciones:", portions);
    console.log("📌 Electrodomésticos:", appliances);
    console.log("📌 Regenerar parte:", regeneratePart);

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: "Debes proporcionar ingredientes." }, { status: 400 });
    }

    // Factor aleatorio para asegurar variabilidad en las respuestas
    const randomFactor = Math.random();

    // Construcción del prompt según la opción seleccionada
    let prompt = `
      Eres un chef profesional. Debes generar una receta en base a los siguientes parámetros:
      - Ingredientes disponibles: ${ingredients.join(', ')}
      - Dificultad: ${difficulty}
      - Tipo de comida: ${mealType}
      - Dieta: ${diet}
      - Porciones: ${portions}
      - Electrodomésticos disponibles: ${appliances.join(', ') || "ninguno"}

      ### Instrucciones:
      1. Formato de salida: SOLO JSON válido, sin texto adicional.
      2. Si regenerarPart es "ingredientes", cambia solo los ingredientes pero mantén los pasos y el título.
      3. Si regenerarPart es "pasos", cambia solo los pasos pero mantén los ingredientes y el título.
      4. Usa combinaciones creativas para evitar recetas repetidas.
      
      ### Estructura esperada:
      {
        "title": "Nombre de la receta",
        "ingredients": ["ingrediente1", "ingrediente2"],
        "steps": ["paso 1", "paso 2"],
        "tips": "Consejo opcional"
      }

      ### Los ingredientes estaran acompañados de las cantidades necesarias.
      ### Los steps deben ser claros y detallados, tiempos de cocción.
      
      Genera una receta completamente nueva basada en estos parámetros. Este intento (${randomFactor}) debe ser diferente.
    `;

    console.log("📌 Enviando prompt a OpenAI...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, 
      temperature: 1.2, 
    });

    const recipe = response.choices[0].message.content;
    console.log("📌 Receta generada:", recipe);

    return NextResponse.json(JSON.parse(recipe));
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Error al generar la receta." }, { status: 500 });
  }
}
