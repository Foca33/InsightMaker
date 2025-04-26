import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Falta el texto de entrada" });
  }

  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    const client = await auth.getClient();
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = "us-central1";
    const modelId = "gemini-1.0-pro"; // modelo público de Google
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;

    const token = await auth.getAccessToken();

    const predictPayload = {
      instances: [
        {
          content: `Clasifica este texto como Insight, Feedback o Ninguno. Explica tu clasificación: ${input}`,
        },
      ],
      parameters: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(predictPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error en Vertex AI:", data);
      return res.status(500).json({ error: data.error?.message || "Error desconocido en Vertex AI" });
    }

    const prediction = data.predictions?.[0]?.content;

    if (!prediction) {
      console.error("Respuesta de Vertex AI vacía:", data);
      return res.status(500).json({ error: "No se recibió contenido del modelo" });
    }

    res.status(200).json({ content: prediction });
  } catch (error) {
    console.error("Error general en askGemini:", error);
    res.status(500).json({ error: error.message || "Error desconocido" });
  }
}