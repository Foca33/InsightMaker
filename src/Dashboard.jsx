// src/Dashboard.jsx

import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

export default function Dashboard() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const q = query(collection(db, "consultas"), orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConsultas(data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Clasificación", "Descubrimiento", "Motivación", "Relevancia para el producto"];
    const rows = filteredConsultas.map(consulta => [
      new Date(consulta.fecha.seconds * 1000).toLocaleString(),
      consulta.clasificacion,
      consulta.descubrimiento,
      consulta.motivacion,
      consulta.relevancia
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(v => `"${v}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "consultas_insightmaker.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteConsulta = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro que deseas eliminar esta consulta?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "consultas", id));
      fetchData();
      triggerNotification("Consulta eliminada exitosamente ✅");
    } catch (error) {
      console.error("Error eliminando consulta:", error);
    }
  };

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const filteredConsultas = consultas.filter(consulta => {
    if (filter !== "todos" && consulta.clasificacion.toLowerCase() !== filter) {
      return false;
    }
    if (search.trim() !== "") {
      const searchTerm = search.toLowerCase();
      return (
        consulta.descubrimiento.toLowerCase().includes(searchTerm) ||
        consulta.motivacion.toLowerCase().includes(searchTerm) ||
        consulta.relevancia.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Insights</h1>

      {notification && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {notification}
        </div>
      )}

      {loading ? (
        <p>Cargando datos...</p>
      ) : consultas.length === 0 ? (
        <p>No se han registrado consultas todavía.</p>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <div>
                <label className="mr-2 font-semibold">Filtrar por:</label>
                <select
                  className="border p-2 rounded"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="insight">Insights</option>
                  <option value="feedback">Feedbacks</option>
                  <option value="ninguno">Ninguno</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Buscar palabra clave..."
                className="border p-2 rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Fecha</th>
                  <th className="px-4 py-2 border">Clasificación</th>
                  <th className="px-4 py-2 border">Descubrimiento</th>
                  <th className="px-4 py-2 border">Motivación</th>
                  <th className="px-4 py-2 border">Relevancia</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultas.map((consulta) => (
                  <tr key={consulta.id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{new Date(consulta.fecha.seconds * 1000).toLocaleString()}</td>
                    <td className="border px-4 py-2 capitalize">{consulta.clasificacion}</td>
                    <td className="border px-4 py-2">{consulta.descubrimiento}</td>
                    <td className="border px-4 py-2">{consulta.motivacion}</td>
                    <td className="border px-4 py-2">{consulta.relevancia}</td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => deleteConsulta(consulta.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}