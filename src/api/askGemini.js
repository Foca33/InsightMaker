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
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const client = new PredictionServiceClient({
      credentials: serviceAccount,
      projectId: serviceAccount.project_id,
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });

    const projectId = serviceAccount.project_id;
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
      topP: 0.8,
      topK: 40,
    };

    const request = {
      endpoint: endpoint,
      instances: [instance],
      parameters: parameters,
    };

    const [response] = await client.predict(request);

    const predictions = response.predictions;
    const firstPrediction = predictions?.[0]?.structValue?.fields;
    const candidates = firstPrediction?.candidates?.listValue?.values;
    const firstCandidateContent = candidates?.[0]?.structValue?.fields?.content?.structValue?.fields;
    const parts = firstCandidateContent?.parts?.listValue?.values;
    const generatedText = parts?.[0]?.structValue?.fields?.text?.stringValue;

    res.status(200).json({ prediction: generatedText || "No se pudo generar texto." });
  } catch (error) {
    console.error('Error during Vertex AI prediction:', error);
    res.status(500).json({
      error: 'Failed to get prediction',
      message: error.message,
      details: error.details || error.stack,
    });
  }
}