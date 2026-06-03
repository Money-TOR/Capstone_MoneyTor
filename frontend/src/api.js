const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const getToken = () => localStorage.getItem('token');
const setToken = (t) => localStorage.setItem('token', t);
const removeToken = () => localStorage.removeItem('token');

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'x-api-key': API_KEY
});

export const registerSeller = async (formData) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY }, body: JSON.stringify(formData) });
  return res.json();
};
export const loginSeller = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY }, body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (data.success) setToken(data.data.token);
  return data;
};
export const getProfil = async () => { const res = await fetch(`${BASE_URL}/api/auth/profil`, { headers: authHeaders() }); return res.json(); };
export const updateProfil = async (data) => { const res = await fetch(`${BASE_URL}/api/auth/profil`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const logout = () => { removeToken(); window.location.href = '/login'; };
export const isLoggedIn = () => !!getToken();
export const getLabaRugi = async () => { const res = await fetch(`${BASE_URL}/api/transactions/laba-rugi`, { headers: authHeaders() }); return res.json(); };
export const getTrenBulanan = async () => { const res = await fetch(`${BASE_URL}/api/transactions/monthly`, { headers: authHeaders() }); return res.json(); };
export const getTransaksi = async () => { const res = await fetch(`${BASE_URL}/api/transactions`, { headers: authHeaders() }); return res.json(); };
export const tambahTransaksi = async (data) => { const res = await fetch(`${BASE_URL}/api/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const editTransaksi = async (id, data) => { const res = await fetch(`${BASE_URL}/api/transactions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const hapusTransaksi = async (id) => { const res = await fetch(`${BASE_URL}/api/transactions/${id}`, { method: 'DELETE', headers: authHeaders() }); return res.json(); };
export const getProduk = async () => { const res = await fetch(`${BASE_URL}/api/products`, { headers: authHeaders() }); return res.json(); };
export const getStokRendah = async () => { const res = await fetch(`${BASE_URL}/api/products/low-stock`, { headers: authHeaders() }); return res.json(); };
export const tambahProduk = async (data) => { const res = await fetch(`${BASE_URL}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const editProduk = async (id, data) => { const res = await fetch(`${BASE_URL}/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const hapusProduk = async (id) => { const res = await fetch(`${BASE_URL}/api/products/${id}`, { method: 'DELETE', headers: authHeaders() }); return res.json(); };
export const getLogStok = async () => { const res = await fetch(`${BASE_URL}/api/stock`, { headers: authHeaders() }); return res.json(); };
export const tambahLogStok = async (data) => { const res = await fetch(`${BASE_URL}/api/stock`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const getFinancialSummary = async () => { const res = await fetch(`${BASE_URL}/api/ai/financial-summary`, { headers: authHeaders() }); return res.json(); };
export const sendChat = async (pesan) => { const res = await fetch(`${BASE_URL}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ pesan }) }); return res.json(); };

// REKOMENDASI PRODUK (Justin AI)
export const getRekomendasiProduk = async (id_produk, top_n = 5) => {
  const res = await fetch(`${BASE_URL}/api/ai/rekomendasi-produk/${id_produk}?top_n=${top_n}`, { headers: authHeaders() });
  return res.json();
};

// PREDIKSI RESTOCK (Migel AI)
export const getPrediksiRestock = async (category, current_stock, minimum_stok = 10) => {
  const res = await fetch(`${BASE_URL}/api/ai/prediksi-restock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ category, current_stock, minimum_stok })
  });
  return res.json();
};

// SUPPLIER
export const getSupplier = async () => { const res = await fetch(`${BASE_URL}/api/suppliers`, { headers: authHeaders() }); return res.json(); };
export const getSupplierById = async (id) => { const res = await fetch(`${BASE_URL}/api/suppliers/${id}`, { headers: authHeaders() }); return res.json(); };
export const tambahSupplier = async (data) => { const res = await fetch(`${BASE_URL}/api/suppliers`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const editSupplier = async (id, data) => { const res = await fetch(`${BASE_URL}/api/suppliers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); return res.json(); };
export const hapusSupplier = async (id) => { const res = await fetch(`${BASE_URL}/api/suppliers/${id}`, { method: 'DELETE', headers: authHeaders() }); return res.json(); };

export { getToken, setToken, removeToken };
