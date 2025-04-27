// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchInsights = async () => {
      const querySnapshot = await getDocs(collection(db, "insights"));
      const data = querySnapshot.docs.map(doc => doc.data());
      setInsights(data);
    };
    fetchInsights();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">📋 Dashboard</h1>
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div key={index} className="p-6 border border-purple-200 rounded-lg bg-purple-50">
              <p className="text-gray-600 mb-4">🕐 {new Date(insight.timestamp.seconds * 1000).toLocaleString()}</p>
              <p className="font-semibold text-purple-700 mb-2">Input:</p>
              <p className="mb-4">{insight.input}</p>
              <p className="font-semibold text-purple-700 mb-2">Resultado:</p>
              <pre className="whitespace-pre-wrap">{insight.result}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}