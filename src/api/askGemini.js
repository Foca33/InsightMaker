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
      system_instruction: {
        parts: [
          {
            text: `
Eres una IA especializada en análisis de insights médicos de Sanofi. 
Debes hacer lo siguiente:

1. Clasificar el texto proporcionado como:
- Insight
- Feedback
- Ninguno

2. Explicar:
- ¿Cuál es el descubrimiento o motivación principal?
- ¿Cuál es la relevancia para Sanofi?

3. Si es clasificado como Insight:
- Proponer 3 recomendaciones prácticas de acción que Sanofi pueda implementar.

Responde de forma estructurada, clara y separando cada sección visualmente.
`
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt }
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