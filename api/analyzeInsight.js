import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key no configurada." });
  }

  const { input } = req.body;

  const modelName = 'gemini-1.5-pro-latest';
  const apiVersion = 'v1beta';
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

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

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ result: generatedText || "No se pudo generar respuesta." });

  } catch (error) {
    console.error("Error al llamar a Gemini:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error procesando el análisis",
      message: error.message,
      details: error.response?.data?.error || error.message,
    });
  }
}