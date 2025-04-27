// src/InsightMaker.jsx
import { useState } from "react";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(0);
  const [feedbacks, setFeedbacks] = useState(0);
  const [ningunos, setNingunos] = useState(0);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyzeInsight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      setResponse(data.result || "No se pudo procesar el análisis.");

      if (data.result.includes("✅ Clasificación: Insight")) {
        setInsights(prev => prev + 1);
      } else if (data.result.includes("✅ Clasificación: Feedback")) {
        setFeedbacks(prev => prev + 1);
      } else {
        setNingunos(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
      setResponse("Error procesando el análisis.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 sm:p-10">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-2xl">

        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">
          Insight Maker
        </h1>

        {/* Contadores */}
        <div className="flex justify-around text-center mb-8">
          <div className="w-24 p-4 bg-purple-100 rounded-lg">
            🧠
            <div className="text-2xl">{insights}</div>
            <div className="text-sm">Insights</div>
          </div>
          <div className="w-24 p-4 bg-blue-100 rounded-lg">
            💬
            <div className="text-2xl">{feedbacks}</div>
            <div className="text-sm">Feedbacks</div>
          </div>
          <div className="w-24 p-4 bg-gray-100 rounded-lg">
            ❓
            <div className="text-2xl">{ningunos}</div>
            <div className="text-sm">Ninguno</div>
          </div>
        </div>

        {/* Input */}
        <textarea
          className="border-2 border-purple-300 w-full h-32 rounded-md p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          placeholder="Escribe aquí tu insight o feedback..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Botón */}
        <button
          className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-all mb-8"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analizando..." : "Enviar"}
        </button>

        {/* Resultado */}
        {response && (
          <div className="p-6 border border-purple-300 rounded-lg bg-purple-50 space-y-4">
            <h3 className="text-2xl font-bold text-purple-700 text-center">Resultado del análisis:</h3>
            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-base leading-relaxed">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}