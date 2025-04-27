// src/InsightMaker.jsx
import { useState } from "react";
import axios from "axios";
import { db } from "./firebase"; // 🔥 Import corregido
import { collection, addDoc } from "firebase/firestore";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [insightCount, setInsightCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [ningunoCount, setNingunoCount] = useState(0);

  const [showDashboard, setShowDashboard] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await axios.post("/api/askGemini", { prompt: input });

      const aiResponse = res.data?.result;

      if (!aiResponse) {
        setResponse("❌ Error procesando el análisis.");
      } else {
        setResponse(aiResponse);

        // Guardar en Firestore
        await addDoc(collection(db, "insights"), {
          texto: input,
          respuesta: aiResponse,
          timestamp: new Date()
        });

        // Actualizar contadores
        const lower = aiResponse.toLowerCase();
        if (lower.includes("clasificación: insight")) {
          setInsightCount((prev) => prev + 1);
        } else if (lower.includes("clasificación: feedback")) {
          setFeedbackCount((prev) => prev + 1);
        } else {
          setNingunoCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error(error);
      setResponse("❌ Error procesando el análisis.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 sm:p-10 relative">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl relative">

        {/* Versión en la esquina */}
        <div className="absolute top-2 right-4 text-xs text-gray-400 select-none">V:1</div>

        {/* Título */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-purple-700 animate-pulse">
          Insight Maker
        </h1>

        {/* Contadores */}
        <div className="flex justify-around mb-6">
          <div className="text-center">
            <div className="text-2xl">🧠</div>
            <div className="text-purple-700 font-semibold">{insightCount}</div>
            <div className="text-gray-500 text-sm">Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">💬</div>
            <div className="text-blue-600 font-semibold">{feedbackCount}</div>
            <div className="text-gray-500 text-sm">Feedbacks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">❓</div>
            <div className="text-gray-600 font-semibold">{ningunoCount}</div>
            <div className="text-gray-500 text-sm">Ninguno</div>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          className="border-2 border-purple-200 w-full h-32 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          placeholder="Escribe aquí el insight o feedback de la visita médica..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Botón Enviar */}
        <button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md transition-all mb-6"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analizando..." : "Enviar"}
        </button>

        {/* Resultado */}
        {response && (
          <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-purple-700 mb-2">Resultado del análisis:</h2>
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {response}
            </div>
          </div>
        )}

        {/* Botón para mostrar Dashboard */}
        <button
          className="mt-6 w-full border border-purple-500 text-purple-700 py-2 rounded-md hover:bg-purple-50 transition-all"
          onClick={() => setShowDashboard(!showDashboard)}
        >
          {showDashboard ? "🔽 Ocultar Dashboard" : "📊 Ver Dashboard"}
        </button>

        {/* Placeholder para Dashboard */}
        {showDashboard && (
          <div className="mt-6 text-center text-gray-400 italic">
            (El dashboard se mostrará aquí en próximas versiones.)
          </div>
        )}
      </div>
    </div>
  );
}