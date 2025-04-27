// src/pages/api/analyzeInsight.js
import axios from "axios";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { input } = req.body;

  const modelName = 'gemini-1.5-pro-latest';
  const apiVersion = 'v1beta';
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

  const primedPrompt = `
Eres un experto en análisis de información de visitas médicas para fuerzas de ventas farmacéuticas.

Clasifica el texto como Insight, Feedback o Ninguno. Justifica tu clasificación y, si es Insight, sugiere 3 soluciones prácticas.

Formato:

✅ Clasificación: [Insight / Feedback / Ninguno]

📝 Explicación:
- Descubrimiento o Motivación: [respuesta]
- Relevancia: [respuesta]

💡 Recomendaciones (si es Insight):
- 1. [Idea 1]
- 2. [Idea 2]
- 3. [Idea 3]

Texto:

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
      headers: { 'Content-Type': 'application/json' }
    });

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar respuesta.";

    // Guardar en Firebase
    await addDoc(collection(db, "insights"), {
      input,
      result,
      timestamp: new Date()
    });

    res.status(200).json({ result });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error procesando el análisis",
      message: error.message,
      details: error.response?.data?.error || error.message
    });
  }
}