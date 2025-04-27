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

    // 🔥 Volvemos a usar gemini-pro en v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const systemPrompt = `
Eres una IA de Sanofi. Analiza la siguiente declaración:

"${prompt}"

1. Clasifícala como Insight, Feedback o Ninguno.
2. Explica el descubrimiento o motivación detrás de la declaración.
3. Justifica la relevancia para Sanofi.
4. Si es un Insight, propone 3 acciones específicas que Sanofi podría implementar.

Entrega tu respuesta organizada, clara y profesional.
Usa viñetas, títulos y separación visual entre secciones.
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