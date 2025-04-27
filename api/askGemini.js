// api/askGemini.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const { prompt } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ error: "API Key no configurada." });
    }
    if (!prompt) {
      return res.status(400).json({ error: "Prompt vacío." });
    }

    // 👇 CAMBIO AQUÍ: Modelo actualizado
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

    const systemPrompt = `
Eres un representante de ventas y visitador médico experto de Sanofi.

Dado el siguiente texto: "${prompt}"

Clasifica y responde con la siguiente estructura (en lenguaje sencillo y profesional):

1. Clasificación: (Escribe Insight, Feedback o Ninguno).
2. Explicación breve: (Por qué es Insight, Feedback o Ninguno).
3. Acciones o Recomendaciones:
    - Si es Insight: Propón 3 acciones concretas que Sanofi podría tomar.
    - Si es Feedback: Da 1 recomendación para aprovecharlo.
    - Si es Ninguno: Explica brevemente por qué no es relevante.

Solo responde el contenido, sin títulos adicionales, sin numeración extra, sin explicaciones redundantes.
Formato claro, ordenado, directo.
`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt }
          ]
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({ error: "Respuesta de Gemini vacía." });
    }

    res.status(200).json({ result: generatedText });

  } catch (error) {
    console.error("❌ Error en askGemini:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error procesando el análisis",
      message: error.message,
      details: error.response?.data || error.stack,
    });
  }
}