import { useState } from "react";
import InsightMaker from "./InsightMaker";
import Dashboard from "./Dashboard";

function App() {
  const [view, setView] = useState("insight");

  return (
    <div className="p-4">
      <div className="flex gap-4 justify-center mb-8">
        <button
          className={`px-4 py-2 rounded ${view === "insight" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
          onClick={() => setView("insight")}
        >
          Capturar Insight
        </button>
        <button
          className={`px-4 py-2 rounded ${view === "dashboard" ? "bg-green-500 text-white" : "bg-gray-300"}`}
          onClick={() => setView("dashboard")}
        >
          Ver Dashboard
        </button>
      </div>

      {view === "insight" ? <InsightMaker /> : <Dashboard />}
    </div>
  );
}

export default App;