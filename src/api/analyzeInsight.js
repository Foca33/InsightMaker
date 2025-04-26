import axios from "axios";

export default async function handler(req, res) {
  try {
    const { input } = req.body;

    if (!input || input.trim() === "") {
      return res.status(400).json({ error: "No input provided" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

    const prompt = `
Clasifica este texto como Insight, Feedback o Ninguno. 
Explica tu clasificación en detalle.
Texto: "${input}".
Dame también: 
- El tipo ("Insight", "Feedback" o "Ninguno")
- Un descubrimiento (si es Insight)
- Una motivación (si es Insight)
- Una relevancia para la estrategia comercial (si es Insight).
Si no es Insight, deja esos campos vacíos.
`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ result: resultText || "No se pudo generar respuesta." });
  } catch (error) {
    console.error('Error en analyzeInsight:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error en análisis de Insight',
      message: error.message,
      details: error.response?.data || error.stack,
    });
  }
}