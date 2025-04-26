import axios from "axios";

export default async function handler(req, res) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: "¿Qué es la inteligencia artificial?" }]
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      }
    });

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ result: generatedText || "No se pudo generar respuesta." });
  } catch (error) {
    console.error('Error en testGeminiKey:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error en prueba de API Key',
      message: error.message,
      details: error.response?.data || error.stack,
    });
  }
}