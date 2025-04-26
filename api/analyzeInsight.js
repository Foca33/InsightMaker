import axios from "axios";

export default async function handler(req, res) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const { input } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: input }
          ]
        }
      ]
    };

    const headers = {
      "Content-Type": "application/json"
    };

    const response = await axios.post(url, payload, { headers });

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ result: generatedText || "No se pudo generar respuesta." });

  } catch (error) {
    console.error('Error en analyzeInsight:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error procesando el análisis',
      message: error.message,
      details: error.response?.data || error.stack,
    });
  }
}