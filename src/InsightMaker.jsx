// src/InsightMaker.jsx

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const API_KEY = "AIzaSyA9FQNSLLs3P2D8LsKgnJ00MA1uiaRRPi4";

      const fetchGeminiResponse = async (prompt) => {
        const res = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          }
        );
        return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta válida de la IA.";
      };

      let aiResponse = await fetchGeminiResponse(`Eres un experto en ventas farmacéuticas de Sanofi. Clasifica el siguiente texto escrito por un representante médico después de visitar a un doctor. Indica si se trata de un Insight, un Feedback o Ninguno. Responde obligatoriamente usando este formato exacto:

Clasificación Principal: (Insight, Feedback o Ninguno)
Explicación breve: (máximo 3 líneas)
Descubrimiento: (explicación breve)
Motivación: (explicación breve)
Relevancia para el producto: (explicación breve)

Texto: ${input}`);

      const parsed = parseResponse(aiResponse);

      await addDoc(collection(db, "consultas"), {
        textoOriginal: input,
        clasificacion: parsed.mainType,
        explicacion: parsed.explanation,
        descubrimiento: parsed.descubrimiento,
        motivacion: parsed.motivacion,
        relevancia: parsed.relevancia,
        fecha: new Date()
      });

      setResponse(aiResponse);

      if (parsed.mainType.includes("insight")) {
        setInsightCount(prev => prev + 1);
      } else if (parsed.mainType.includes("feedback")) {
        setFeedbackCount(prev => prev + 1);
      }

    } catch (error) {
      console.error(error);
      setResponse("Error procesando la solicitud: " + (error.response?.data?.error?.message || error.message));
    }
    setLoading(false);
  };

  const parseResponse = (text) => {
    const cleanLine = (line) => line.split(":")[1]?.trim() || "";
    const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

    let mainType = "";
    let explanation = "";
    let descubrimiento = "";
    let motivacion = "";
    let relevancia = "";

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.startsWith("clasificación principal")) {
        mainType = cleanLine(line).toLowerCase();
      } else if (lower.startsWith("explicación breve")) {
        explanation = cleanLine(line);
      } else if (lower.startsWith("descubrimiento")) {
        descubrimiento = cleanLine(line);
      } else if (lower.startsWith("motivación")) {
        motivacion = cleanLine(line);
      } else if (lower.startsWith("relevancia para el producto")) {
        relevancia = cleanLine(line);
      }
    });

    return { mainType, explanation, descubrimiento, motivacion, relevancia };
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Insight Maker</h1>
      <p className="text-gray-600 mb-6">Captura insights reales que potencien tu estrategia de ventas.</p>

      <div className="flex gap-4 mb-6">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Insights: {insightCount}</div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Feedbacks: {feedbackCount}</div>
      </div>

      <textarea
        className="border p-2 w-full h-32 mb-4"
        placeholder="Escribe aquí el resumen de tu visita médica..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Analizando..." : "Enviar"}
      </button>

      {response && (
        <motion.div
          className="mt-6 p-4 border rounded bg-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-semibold mb-2">Resultado:</h2>
          <p className="whitespace-pre-line">{response}</p>
        </motion.div>
      )}
    </div>
  );
}