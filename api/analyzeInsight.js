import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY no configurada.");
    return res.status(500).json({ error: 'API Key no configurada en servidor' });
  }

  const userPrompt = req.body.input || "No se recibió input.";
  const modelName = 'gemini-1.5-pro-latest';
  const apiVersion = 'v1beta';

  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

  const prompt = `
Eres un experto analista de insights para fuerza de ventas médicas. 
Cuando recibas un texto, debes clasificarlo SOLO en una de estas 3 categorías:

✅ Clasificación: Insight
✅ Clasificación: Feedback
✅ Clasificación: Ninguno

Y luego, debes explicar:

- Descubrimiento o Motivación:
- Relevancia:

Si es un Insight, da 3 recomendaciones de solución.

Responde SIEMPRE en este formato exacto:

✅ Clasificación: (Insight / Feedback / Ninguno)
- Descubrimiento o Motivación: ...
- Relevancia: ...
- 1. Recomendación uno
- 2. Recomendación dos
- 3. Recomendación tres

Texto a analizar:
"""${userPrompt}"""
`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ],
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // EXTRAEMOS el texto generado de forma segura
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No se pudo extraer texto de la respuesta.");
    }

    res.status(200).json({ result: generatedText });

  } catch (error) {
    console.error("Error en analyzeInsight:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error procesando el análisis",
      message: error.message,
      details: error.response?.data || error.stack,
    });
  }
}