import { useState } from "react";
import axios from "axios";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [insightCount, setInsightCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [ningunoCount, setNingunoCount] = useState(0);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const API_KEY = "AIzaSyDoqvEZWjtcRkGnD4HDDhAoVYX_nVtaJ5g";

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Clasifica este texto como Insight, Feedback o Ninguno. Explica tu clasificación: ${input}`
                }
              ]
            }
          ]
        }
      );

      const aiResponse = res.data.candidates[0].content.parts[0].text;
      setResponse(aiResponse);

      // Actualizar contadores basado en la respuesta
      const lowerResponse = aiResponse.toLowerCase();
      if (lowerResponse.includes("insight")) {
        setInsightCount(prev => prev + 1);
      } else if (lowerResponse.includes("feedback")) {
        setFeedbackCount(prev => prev + 1);
      } else {
        setNingunoCount(prev => prev + 1);
      }

      console.log("Guardando:", {
        texto: input,
        respuesta: aiResponse,
        timestamp: new Date()
      });

    } catch (error) {
      console.error(error);
      setResponse("Error procesando la solicitud: " + (error.response?.data?.error?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 sm:p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-2xl">

        {/* Título principal */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-purple-700">
          Insight Maker
        </h1>

        {/* Dashboard contadores */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">📊 Resultados acumulados</h2>
          <div className="flex justify-around text-center text-lg font-medium">
            <div className="bg-purple-100 p-4 rounded-lg w-24">
              <div className="text-2xl">🧠</div>
              <div className="text-purple-700">{insightCount}</div>
              <div className="text-gray-500 text-sm">Insights</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg w-24">
              <div className="text-2xl">💬</div>
              <div className="text-blue-700">{feedbackCount}</div>
              <div className="text-gray-500 text-sm">Feedbacks</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg w-24">
              <div className="text-2xl">❓</div>
              <div className="text-gray-700">{ningunoCount}</div>
              <div className="text-gray-500 text-sm">Ninguno</div>
            </div>
          </div>
        </div>

        {/* Input usuario */}
        <textarea
          className="border-2 border-purple-200 w-full h-32 rounded-md p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          placeholder="Escribe aquí el insight o feedback de la visita médica..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>

        {/* Botón enviar */}
        <button
          className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-all mb-8"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analizando..." : "Enviar"}
        </button>

        {/* Resultado */}
        {response && (
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Resultado del análisis:</h3>
            <p className="whitespace-pre-line text-gray-700">{response}</p>
          </div>
        )}

      </div>
    </div>
  );
}