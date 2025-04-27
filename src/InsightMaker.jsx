// src/InsightMaker.jsx
import { useState } from "react";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

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
      setResponse(data.result || "No se pudo procesar la respuesta.");
    } catch (error) {
      console.error(error);
      setResponse("Error procesando el análisis.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 sm:p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-2xl">

        {/* Título */}
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">
          Insight Maker
        </h1>

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
          <div className="p-6 border border-purple-200 rounded-lg bg-purple-50">
            <h3 className="text-xl font-bold text-purple-700 mb-4 text-center">Resultado del análisis:</h3>
            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-base leading-relaxed">
              {response}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}