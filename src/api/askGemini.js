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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `
Eres una IA experta en análisis de insights médicos de Sanofi. 
Tu tarea es:
1. Clasificar: Insight, Feedback o Ninguno.
2. Explicar el descubrimiento o motivación detrás.
3. Explicar la relevancia para el negocio de Sanofi.
4. Si es Insight: proponer 3 recomendaciones de acción prácticas.

Texto para analizar: """${prompt}"""
            ` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        topP: 1,
        topK: 40
      }
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