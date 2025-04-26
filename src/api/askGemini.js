import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Falta el texto de entrada" });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Clasifica este texto como Insight, Feedback o Ninguno. Explica tu clasificación: ${input}`,
            },
          ],
        },
      ],
    };

    const response = await axios.post(url, payload);

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ prediction: generatedText || "No se pudo generar respuesta." });
  } catch (error) {
    console.error('Error al llamar a Gemini API:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error al generar la predicción',
      message: error.message,
      details: error.response?.data || error.stack,
    });
  }
}