// src/pages/api/analyzeInsight.js
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

  // PROMPT PREMIUM
  const primedPrompt = `
Eres un experto en análisis de información de visitas médicas para fuerzas de ventas farmacéuticas.

Quiero que realices dos tareas sobre el siguiente texto:

**1. Clasificación:**  
Clasifica el texto estrictamente en una de las siguientes categorías:
- **Insight**: Un descubrimiento relevante, profundo o novedoso que ayuda a mejorar la estrategia o comprender mejor al cliente o mercado.
- **Feedback**: Un comentario, preferencia o instrucción operativa que no constituye un descubrimiento nuevo, sino una observación o respuesta.
- **Ninguno**: Si el texto no representa ni un insight ni un feedback, o no tiene valor estratégico ni operativo.

**2. Justificación:**  
Explica de forma clara y estructurada el motivo de tu clasificación, incluyendo:
- **Descubrimiento (si es Insight):** ¿Qué se descubrió?
- **Motivación (si es Feedback):** ¿Qué acción o preferencia expresa el médico?
- **Relevancia:** ¿Por qué es importante esta información para el equipo de ventas?

**Formato de tu respuesta:**

✅ Clasificación: [Insight / Feedback / Ninguno]

📝 Explicación:
- Descubrimiento o Motivación: [respuesta]
- Relevancia: [respuesta]

Texto a analizar:

"${input}"
`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: primedPrompt }
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