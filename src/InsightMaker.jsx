import { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../firebase"; // Asegúrate que el import esté correcto
import { addDoc, collection } from "firebase/firestore";
import { motion } from "framer-motion";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insightCount, setInsightCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [ningunoCount, setNingunoCount] = useState(0);
  const [dashboardData, setDashboardData] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    console.log("🚀 InsightMaker App - Versión: V:1");
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Clasifica el siguiente texto como Insight, Feedback o Ninguno. Luego explica claramente: 
- ¿Cuál es el descubrimiento o motivación principal?
- ¿Por qué es relevante?
- Si es un insight, proporciona 3 recomendaciones de acción.

Texto: ${input}`
              }
            ]
          }
        ]
      };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" }
      });

      const result = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!result) {
        throw new Error("No se pudo procesar la respuesta del modelo.");
      }

      setResponse(result);

      // Clasificación automática simple
      const lower = result.toLowerCase();
      if (lower.includes("insight")) setInsightCount((prev) => prev + 1);
      else if (lower.includes("feedback")) setFeedbackCount((prev) => prev + 1);
      else setNingunoCount((prev) => prev + 1);

      // Guardar en Firestore
      await addDoc(collection(db, "insights"), {
        input,
        analysis: result,
        timestamp: new Date(),
      });

      setInput("");

    } catch (error) {
      console.error(error);
      setError("Error procesando el análisis.");
    }

    setLoading(false);
  };

  const handleToggleDashboard = async () => {
    try {
      const querySnapshot = await db.collection("insights").get();
      const data = querySnapshot.docs.map((doc) => doc.data());
      setDashboardData(data);
      setShowDashboard(!showDashboard);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6 sm:p-10 relative">

      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-2xl">

        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-purple-700">
          Insight Maker
        </h1>

        {/* Dashboard button */}
        <div className="flex justify-end mb-4">
          <button
            className="text-purple-600 underline hover:text-purple-800 text-sm"
            onClick={handleToggleDashboard}
          >
            {showDashboard ? "Ocultar Dashboard" : "Ver Dashboard"}
          </button>
        </div>

        {/* Counters */}
        <div className="flex justify-around mb-8">
          <div className="bg-purple-100 p-4 rounded-xl text-center w-24 shadow">
            <div className="text-2xl">🧠</div>
            <div className="font-bold">{insightCount}</div>
            <div className="text-xs text-gray-600">Insights</div>
          </div>
          <div className="bg-blue-100 p-4 rounded-xl text-center w-24 shadow">
            <div className="text-2xl">💬</div>
            <div className="font-bold">{feedbackCount}</div>
            <div className="text-xs text-gray-600">Feedbacks</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-xl text-center w-24 shadow">
            <div className="text-2xl">❓</div>
            <div className="font-bold">{ningunoCount}</div>
            <div className="text-xs text-gray-600">Ninguno</div>
          </div>
        </div>

        {/* Input */}
        <textarea
          className="w-full border-2 border-purple-300 rounded-lg p-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 mb-6"
          placeholder="Escribe aquí tu insight o feedback de la visita médica..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Submit button */}
        <button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analizando..." : "Enviar"}
        </button>

        {/* Result */}
        {response && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-purple-50 p-6 mt-8 rounded-xl shadow-md space-y-4"
          >
            <h2 className="text-xl font-bold text-purple-700">Resultado del análisis:</h2>
            <pre className="whitespace-pre-wrap text-gray-700">{response}</pre>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded mt-4">
            ❌ {error}
          </div>
        )}

        {/* Dashboard view */}
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-gray-50 rounded-lg shadow-inner"
          >
            <h3 className="font-bold text-purple-700 mb-4 text-lg">Dashboard Insights:</h3>
            {dashboardData.length === 0 ? (
              <p className="text-gray-500">No hay datos aún.</p>
            ) : (
              dashboardData.map((item, index) => (
                <div key={index} className="mb-4 p-3 border-b border-gray-200">
                  <p className="font-semibold text-gray-700">📝 {item.input}</p>
                  <p className="text-sm text-gray-500 mt-2">{item.analysis}</p>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Versión Badge */}
      <div className="fixed bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full opacity-70 shadow-md">
        V:1
      </div>

    </div>
  );
}