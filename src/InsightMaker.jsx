import { useState } from "react";
import axios from "axios";
import { db } from "./firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const [insightCount, setInsightCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [ningunoCount, setNingunoCount] = useState(0);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/askGemini", { prompt: input });
      const resultText = res.data.result;

      const lines = resultText.split("\n").filter(line => line.trim() !== "");
      let clasificacion = "";
      let explicacion = "";
      let acciones = [];

      lines.forEach((line, index) => {
        const lower = line.toLowerCase();
        if (lower.includes("insight")) {
          clasificacion = "Insight";
          setInsightCount(prev => prev + 1);
        } else if (lower.includes("feedback")) {
          clasificacion = "Feedback";
          setFeedbackCount(prev => prev + 1);
        } else if (lower.includes("ninguno")) {
          clasificacion = "Ninguno";
          setNingunoCount(prev => prev + 1);
        } else if (index === 1) {
          explicacion = line;
        } else {
          acciones.push(line);
        }
      });

      const result = {
        clasificacion,
        explicacion,
        acciones,
      };

      setResponse(result);

      await addDoc(collection(db, "insights"), {
        input,
        ...result,
        timestamp: Timestamp.now(),
      });

    } catch (error) {
      console.error("❌ Error en axios.post('/api/askGemini'):", error);
      setResponse({ error: "Error procesando el análisis." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 sm:p-10">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-2xl relative">

        {/* Versión */}
        <div className="absolute top-2 right-4 text-xs text-gray-400">V:3</div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">
          Insight Maker
        </h1>

        {/* Contadores */}
        <div className="flex justify-around mb-8 text-center text-lg font-medium">
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

        {/* Input */}
        <textarea
          className="border-2 border-purple-200 w-full h-32 rounded-md p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          placeholder="Escribe aquí el insight o feedback..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>

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
          <div className="space-y-6">
            {response.error ? (
              <div className="p-4 border border-red-400 text-red-700 bg-red-100 rounded-lg">
                ❌ {response.error}
              </div>
            ) : (
              <>
                <div className="p-6 rounded-lg shadow-md bg-purple-50">
                  <h2 className="text-xl font-bold text-purple-700 mb-2">Clasificación</h2>
                  <p className="text-gray-700 text-lg">{response.clasificacion}</p>
                </div>
                <div className="p-6 rounded-lg shadow-md bg-blue-50">
                  <h2 className="text-xl font-bold text-blue-700 mb-2">Explicación</h2>
                  <p className="text-gray-700">{response.explicacion}</p>
                </div>
                <div className="p-6 rounded-lg shadow-md bg-green-50">
                  <h2 className="text-xl font-bold text-green-700 mb-2">
                    {response.clasificacion === "Feedback" ? "Recomendación" : "Acciones"}
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {response.acciones.map((accion, idx) => (
                      <li key={idx}>{accion}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}