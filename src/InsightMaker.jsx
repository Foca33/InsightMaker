import { useState, Fragment } from "react";
import { db } from "./firebase";
import { addDoc, collection } from "firebase/firestore";
import axios from "axios";

// Nuevo componente para formatear la respuesta
function FormattedResponse({ text }) {
  const sections = text.split(/\n\n/).filter((section) => section.trim() !== "");

  const icons = [
    "🏷️", // Clasificación
    "🧠", // Descubrimiento / Motivación
    "🎯", // Relevancia para Sanofi
    "🚀", // Acciones específicas
    "🔎", // Análisis general
  ];

  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <div
          key={index}
          className="p-6 rounded-2xl bg-white/50 backdrop-blur-md border border-purple-200 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">{icons[index] || "📝"}</div>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed text-md">
              {section
                .replace("## ", "")
                .replace("**1. Clasificación:**", "**Clasificación:**")
                .replace("**2. Descubrimiento/Motivación:**", "**Descubrimiento / Motivación:**")
                .replace("**3. Relevancia para Sanofi:**", "**Relevancia para Sanofi:**")
                .replace("**4. Acciones Específicas (Si es un Insight):**", "**Acciones Específicas:**")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InsightMaker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post("/api/askGemini", { prompt: input });
      const result = res.data.result;
      setResponse(result);

      await addDoc(collection(db, "análisis"), {
        texto: input,
        resultado: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("❌ Error en análisis:", error.response?.data || error.message);
      setResponse("❌ Error procesando el análisis. Ver consola para detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 sm:p-10 relative">
      <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-purple-200">

        {/* Título principal */}
        <h1 className="text-4xl font-extrabold text-center mb-8 text-purple-700">
          Insight Maker 🚀
        </h1>

        {/* Área de texto */}
        <textarea
          className="w-full h-36 p-4 rounded-xl border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 placeholder-gray-400 resize-none mb-6"
          placeholder="Describe el insight o feedback del médico..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl shadow-lg transition-all mb-10"
        >
          {loading ? "Analizando..." : "Analizar Insight"}
        </button>

        {/* Resultado */}
        {response && (
          <div>
            <h2 className="text-2xl font-semibold text-purple-700 mb-6 text-center">Resultado del análisis</h2>
            <FormattedResponse text={response} />
          </div>
        )}
      </div>

      {/* Versión */}
      <div className="absolute bottom-4 right-6 text-xs text-gray-400">
        V:2
      </div>
    </div>
  );
}