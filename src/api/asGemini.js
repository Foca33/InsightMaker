import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { input } = req.body;

  if (!input) {
    res.status(400).json({ error: "Falta el texto de entrada" });
    return;
  }

  try {
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/cloud-platform",
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }
    });

    const client = await auth.getClient();
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.0-pro:predict`;

    const token = await auth.getAccessToken();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        instances: [{ content: `Clasifica este texto como Insight, Feedback o Ninguno. Explica tu clasificación: ${input}` }],
        parameters: { temperature: 0.2, maxOutputTokens: 512 }
      })
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ content: data.predictions[0].content });
    } else {
      console.error("Error al consultar Vertex AI:", data);
      res.status(500).json({ error: data.error });
    }
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: error.message });
  }
}