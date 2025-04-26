import axios from "axios";

export default async function handler(req, res) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const { input } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

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

    const response = await axios.post(url, payload);

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