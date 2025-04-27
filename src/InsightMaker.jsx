// InsightMaker.jsx

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // Animación
import { db } from "@/firebase"; // Tu conexión a Firebase
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  const [insightCount, setInsightCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [ningunoCount, setNingunoCount] = useState(0);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/analyzeInsight", { input });
      const analysis = res.data.result;

      if (!analysis) {
        throw new Error("Sin respuesta del análisis.");
      }

      setResponse(parseAnalysis(analysis));

      await addDoc(collection(db, "insights"), {
        input,
        analysis,
        timestamp: new Date(),
      });

      if (analysis.includes("Clasificación: Insight")) {
        setInsightCount((prev) => prev + 1);
      } else if (analysis.includes("Clasificación: Feedback")) {
        setFeedbackCount((prev) => prev + 1);
      } else {
        setNingunoCount((prev) => prev + 1);
      }

    } catch (error) {
      console.error(error);
      setResponse({ error: "Error procesando el análisis.", details: error.message });
    }
    setLoading(false);
  };

  const handleLoadDashboard = async () => {
    setShowDashboard(!showDashboard);
    if (!showDashboard) {
      const querySnapshot = await getDocs(collection(db, "insights"));
      const docs = querySnapshot.docs.map((doc) => doc.data());
      setDashboardData(docs);
    }
  };

  const parseAnalysis = (text) => {
    const lines = text.split('\n').filter(Boolean);
    const data = {
      classification: '',
      discovery: '',
      relevance: '',
      recommendations: [],
    };

    lines.forEach(line => {
      if (line.includes('Clasificación:')) {
        data.classification = line.replace('✅ Clasificación:', '').trim();
      } else if (line.includes('Descubrimiento') || line.includes('Motivación')) {
        data.discovery = line.split(':').slice(1).join(':').trim();
      } else if (line.includes('Relevancia')) {
        data.relevance = line.split(':').slice(1).join(':').trim();
      } else if (line.match(/^\d+\./)) {
        data.recommendations.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    });

    return data;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 sm:p-10">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-2xl">

        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">Insight Maker</h1>

        {/* Dashboard Summary */}
        <div className="flex justify-around mb-8 text-center">
          <div className="bg-purple-100 p-4 rounded-lg w-24">
            <div className="text-3xl">🧠</div>
            <div className="text-purple-700 text-xl">{insightCount}</div>
            <div className="text-gray-500 text-sm">Insights</div>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg w-24">
            <div className="text-3xl">💬</div>
            <div className="text-blue-700 text-xl">{feedbackCount}</div>
            <div className="text-gray-500 text-sm">Feedbacks</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg w-24">
            <div className="text-3xl">❓</div>
            <div className="text-gray-700 text-xl">{ningunoCount}</div>
            <div className="text-gray-500 text-sm">Ninguno</div>
          </div>
        </div>

        {/* Input area */}
        <textarea
          className="border-2 border-purple-300 w-full h-32 rounded-md p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          placeholder="Escribe aquí tu insight o feedback de la visita médica..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>

        <button
          className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-all mb-8"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analizando..." : "Enviar"}
        </button>

        <button
          onClick={handleLoadDashboard}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-md font-semibold mb-6"
        >
          {showDashboard ? "Ocultar Dashboard" : "Ver Dashboard"}
        </button>

        {/* Dashboard */}
        {showDashboard && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4 text-purple-700">📚 Insights Guardados</h2>
            {dashboardData.length === 0 ? (
              <p className="text-gray-500 text-center">No hay insights aún.</p>
            ) : (
              dashboardData.map((item, idx) => (
                <div key={idx} className="p-4 mb-4 border rounded-md bg-white shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{new Date(item.timestamp.seconds * 1000).toLocaleString()}</p>
                  <p className="text-gray-700">{item.input}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Resultado */}
        {response && !response.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4"
          >
            <div className="p-4 rounded-lg shadow bg-purple-50">
              <h3 className="text-lg font-bold text-purple-700 mb-2">✅ Clasificación</h3>
              <p className="text-gray-700">{response.classification}</p>
            </div>

            <div className="p-4 rounded-lg shadow bg-blue-50">
              <h3 className="text-lg font-bold text-blue-700 mb-2">🔎 Descubrimiento o Motivación</h3>
              <p className="text-gray-700">{response.discovery}</p>
            </div>

            <div className="p-4 rounded-lg shadow bg-green-50">
              <h3 className="text-lg font-bold text-green-700 mb-2">🏥 Relevancia</h3>
              <p className="text-gray-700">{response.relevance}</p>
            </div>

            {response.recommendations.length > 0 && (
              <div className="p-4 rounded-lg shadow bg-yellow-50">
                <h3 className="text-lg font-bold text-yellow-700 mb-2">💡 Recomendaciones</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {response.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Error */}
        {response?.error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            ❌ {response.error}
          </div>
        )}
      </div>
    </div>
  );
}