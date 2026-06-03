import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Keuangan from "./pages/Keuangan";
import Stok from "./pages/Stok";
import Laporan from "./pages/Laporan";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import Supplier from "./pages/Supplier";
import ProdukSupplier from "./pages/ProdukSupplier";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/keuangan" element={<Keuangan />} />
      <Route path="/stok" element={<Stok />} />
      <Route path="/laporan" element={<Laporan />} />
      <Route path="/chatbot" element={<AIAssistant />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/supplier" element={<Supplier />} />
      <Route path="/supplier/:id/produk" element={<ProdukSupplier />} />
    </Routes>
  );
}

export default App;
