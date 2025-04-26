import { PredictionServiceClient } from "@google-cloud/aiplatform";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Falta el texto de entrada" });
  }

  try {
    const keyFile = path.join(process.cwd(), "src", "credentials", "service-account.json");

    const client = new PredictionServiceClient({
      keyFile,
      projectId: process.env.GOOGLE_PROJECT_ID,
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });

    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = 'us-central1';
    const publisher = 'google';
    const model = 'gemini-1.0-pro';

    const endpoint = `projects/${projectId}/locations/${location}/publishers/${publisher}/models/${model}`;

    const instance = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Clasifica este texto como Insight, Feedback o Ninguno. Explica tu clasificación: ${input}`,
            },
          ],
        },
      ],
    };

    const parameters = {
      temperature: 0.2,
      maxOutputTokens: 512,
      topK: 1,
      topP: 0.8,
    };

    const [response] = await client.predict({
      endpoint,
      instances: [instance],
      parameters,
    });

    const prediction = response.predictions?.[0]?.structValue?.fields?.candidates?.listValue?.values?.[0]?.structValue?.fields?.content?.structValue?.fields?.parts?.listValue?.values?.[0]?.structValue?.fields?.text?.stringValue;

    res.status(200).json({ prediction: prediction || response.predictions });
  } catch (error) {
    console.error('Error during Vertex AI prediction:', error);
    res.status(500).json({
      error: 'Failed to get prediction',
      message: error.message,
      details: error.details || error.stack,
    });
  }
}