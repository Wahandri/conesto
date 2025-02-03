import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API Key de OpenAI
});

export async function POST(request) {
  try {
    const { ingredients, difficulty, appliances, timestamp } = await request.json();
    console.log("📌 Ingredientes recibidos:", ingredients);
    console.log("📌 Dificultad:", difficulty);
    console.log("📌 Electrodomésticos:", appliances);
    console.log("📌 API Key usada:", process.env.OPENAI_API_KEY ? "Cargada correctamente" : "NO CARGADA");

    if (!ingredients || ingredients.length === 0) {
      console.error("❌ Error: No se enviaron ingredientes.");
      return NextResponse.json({ error: "Debes proporcionar ingredientes." }, { status: 400 });
    }

    // Generar variabilidad con un número aleatorio
    const randomFactor = Math.random();

    // Modificar el prompt para forzar una nueva receta si se genera otra
    const prompt = `
      Eres un chef profesional y vas a crear una receta para usuarios en casa.
      **Genera una receta DIFERENTE cada vez que se te pida, incluso con los mismos ingredientes.**
      Usa SOLO estos ingredientes: ${ingredients.join(', ')}.
      La dificultad de la receta debe ser "${difficulty}".
      Electrodomésticos disponibles: ${appliances.join(", ") || "ninguno"}.

      ### Instrucciones:
      1. **Formato de respuesta:** SOLO JSON válido, sin texto adicional.
      2. **No repitas recetas anteriores.** Usa combinaciones diferentes de los ingredientes.
      3. **Dale un giro creativo a la receta, incluyendo un estilo de cocina diferente (ej. italiana, asiática, etc.).**
      4. **Usa técnicas variadas:** hornear, freír, marinar, saltear, etc.

      ### Estructura esperada:
      {
        "title": "Nombre de la receta",
        "ingredients": ["ingrediente1", "ingrediente2"],
        "steps": ["paso 1", "paso 2"],
        "tips": "Consejo opcional"
      }

      **Este es un intento único (${randomFactor})**, así que asegúrate de que la receta sea completamente nueva.
      `;

    console.log("📌 Enviando prompt a OpenAI...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, 
      temperature: 1.2, // 🔥 Mayor aleatoriedad en la generación de recetas
    });

    const recipe = response.choices[0].message.content;
    console.log("📌 Receta generada:", recipe);

    return NextResponse.json(JSON.parse(recipe));
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Error al generar la receta." }, { status: 500 });
  }
}
