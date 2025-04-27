// src/api/askGemini.js
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

    const model = "gemini-1.5-pro-latest";
    const apiVersion = "v1beta";
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{
            text: `
Eres una IA experta en análisis de insights médicos de Sanofi. Tu tarea es:

1. **Clasificación:** ¿Es Insight, Feedback o Ninguno?
2. **Descubrimiento o Motivación:** ¿Qué problema, necesidad o motivación subyacente revela el texto?
3. **Relevancia:** ¿Por qué es importante para Sanofi o el negocio?
4. **Si es Insight:** Proponer 3 recomendaciones de acción para aprovecharlo.

Análisis del texto: """${prompt}"""
            `
          }]
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(500).json({ error: "Respuesta de Gemini vacía." });
    }

    res.status(200).json({ result: aiResponse });

  } catch (error) {
    console.error("❌ Error en askGemini:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error procesando el análisis",
      message: error.message,
      details: error.response?.data || error.stack,
    });
  }
}