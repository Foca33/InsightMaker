// src/InsightMaker.jsx

import { useState } from "react";
import axios from "axios";

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return; // No dejar enviar vacío
    setLoading(true);
    try {
      const API_KEY = "AIzaSyA9FQNSLLs3P2D8LsKgnJ00MA1uiaRRPi4";

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
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

      console.log("Simulando guardar en base de datos:", {
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
    <div className="p-4 sm:p-8 max-w-md sm:max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Insight Maker</h1>

      <textarea
        className="border p-3 w-full h-32 mb-4 resize-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Escribe aquí tu insight de la visita médica..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>

      <button
        className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-all"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Analizando..." : "Enviar"}
      </button>

      {response && (
        <div className="mt-8 p-4 border rounded bg-gray-100">
          <h2 className="font-semibold mb-2 text-lg">Resultado:</h2>
          <p className="whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
}