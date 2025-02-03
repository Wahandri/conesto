import { NextResponse } from 'next/server';

const fetchHuggingFaceResponse = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    console.log(`📌 Intento ${i + 1} de ${retries}...`);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct", // 🔥 Modelo mejorado
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const data = await response.json();

    if (data.error && data.error.includes("currently loading")) {
      console.log(`⏳ Modelo aún cargando... Esperando 30 segundos antes de reintentar.`);
      await new Promise((resolve) => setTimeout(resolve, 30000)); // Espera 30 segundos
    } else {
      return data;
    }
  }
  throw new Error("El modelo no terminó de cargar a tiempo.");
};

export async function POST(request) {
  try {
    const { ingredients } = await request.json();
    console.log("📌 Ingredientes recibidos:", ingredients);

    if (!ingredients || ingredients.length === 0) {
      console.error("❌ Error: No se enviaron ingredientes.");
      return NextResponse.json({ error: "Debes proporcionar ingredientes." }, { status: 400 });
    }

    console.log("📌 API Key usada:", process.env.HUGGINGFACE_API_KEY ? "Cargada correctamente" : "NO CARGADA");

    // 🔥 MEJORAMOS EL PROMPT PARA OBLIGAR A LA IA A DEVOLVER JSON PURO
    const prompt = `
    Eres un asistente de cocina experto. Genera una receta en **formato JSON puro** usando SOLO estos ingredientes: ${ingredients.join(', ')}.

    🔹 **Reglas:**
    1. **NO EXPLIQUES nada.**
    2. **No devuelvas texto adicional, solo el JSON.**
    3. **NO uses etiquetas HTML, código o explicaciones.**

    🔹 **Formato esperado:**
    {
      "title": "Nombre de la receta",
      "ingredients": ["ingrediente1", "ingrediente2"],
      "steps": ["paso 1", "paso 2"],
      "tips": "Consejos opcionales"
    }

    🔹 **Ejemplo correcto:**
    {
      "title": "Pollo al limón",
      "ingredients": ["pollo", "limón", "arroz"],
      "steps": ["Exprime el limón", "Cocina el arroz", "Sirve el pollo"],
      "tips": "Puedes añadir pimienta negra"
    }

    ⚠️ **Tu respuesta debe ser SOLO el JSON.** Sin comentarios, sin formato adicional.
    `;

    console.log("📌 Enviando prompt a Hugging Face...");

    const data = await fetchHuggingFaceResponse(prompt);
    console.log("📌 Respuesta de Hugging Face:", data);

    if (!data || !data.length || !data[0].generated_text) {
      throw new Error("No se recibió una respuesta válida de Hugging Face.");
    }

    const textResponse = data[0].generated_text.trim();
    console.log("📌 Texto recibido del modelo:", textResponse);

    // 🔹 Intentar extraer JSON usando regex
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No se encontró JSON en la respuesta.");
      return NextResponse.json({ error: "La IA no generó un JSON válido." }, { status: 500 });
    }

    let recipe;
    try {
      recipe = JSON.parse(jsonMatch[0]); // 🔥 Extrae solo el JSON
    } catch (parseError) {
      console.error("❌ Error al parsear JSON:", parseError);
      return NextResponse.json({ error: "Error al interpretar la respuesta de la IA." }, { status: 500 });
    }

    // Asegurar que el objeto tiene las propiedades necesarias
    const formattedRecipe = {
      title: recipe.title || "Receta generada",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      tips: recipe.tips || "",
    };

    console.log("📌 Receta formateada:", formattedRecipe);

    return NextResponse.json(formattedRecipe);
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Error al generar la receta." }, { status: 500 });
  }
}
