import { PredictionServiceClient } from "@google-cloud/aiplatform";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Falta el texto de entrada" });
  }

  try {
    const client = new PredictionServiceClient({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    const endpoint = `projects/${process.env.GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.0-pro`;

    const [response] = await client.predict({
      endpoint,
      instances: [
        {
          content: `Clasifica este texto como Insight, Feedback o Ninguno. Explica tu clasificación: ${input}`,
        },
      ],
      parameters: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    });

    const prediction = response.predictions?.[0]?.content || "No se recibió respuesta.";

    res.status(200).json({ content: prediction });
  } catch (error) {
    console.error("Error en Vertex AI Predict:", error);
    res.status(500).json({ error: error.message || "Error desconocido en Vertex AI" });
  }
}