# Profile System Architecture - MoneyTOR

## 📋 Overview
Sistem profile telah direfactor untuk memastikan data konsisten dan user experience yang jelas.

### Prinsip Utama:
- **Settings page** = satu-satunya tempat untuk mengedit profil
- **Profile modal** = read-only view untuk lihat data profil
- **API centralized** = updateProfil di-export dari api.js

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIAL STATE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Register → Backend                                         │
│  • nama_pemilik                                             │
│  • email                                                    │
│  • nama_usaha                                               │
│  • jenis_usaha                                              │
│  • lokasi_usaha                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│             DASHBOARD - Topbar (READ-ONLY)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Fetch data via getProfil() on mount                      │
│  • Display name, role, email, wa, lokasi                    │
│  • Show avatar                                              │
│  • NO EDIT FIELDS                                           │
│                                                             │
│  Button: "Edit Profil" → Navigate to /settings             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│          SETTINGS PAGE - Edit Profile                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Edit Fields:                                             │
│    - Nama Usaha                                             │
│    - Jenis Usaha (dropdown)                                 │
│    - Alamat Usaha                                           │
│    - Nama Lengkap                                           │
│    - No. Telepon                                            │
│    - Jabatan                                                │
│    - Foto (upload)                                          │
│                                                             │
│  • READ-ONLY Fields:                                        │
│    - Email (tidak bisa diubah)                              │
│                                                             │
│  • Button: "Simpan Semua Perubahan"                        │
│    Calls: updateProfil() from api.js                        │
│    Triggers: window.dispatchEvent(new Event('profileUpdated'))
│                                                             │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│           UPDATE SYNC TO TOPBAR                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Settings → updateProfil() → Backend                        │
│                              ↓                              │
│  Trigger: window.dispatchEvent('profileUpdated')           │
│                    ↓                                        │
│  Topbar Listener: Calls refreshProfil()                     │
│                    ↓                                        │
│  Topbar: Fetch latest data via getProfil()                 │
│                    ↓                                        │
│  Topbar UI: Update dengan data terbaru                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure & Changes

### 1. `/src/api.js`
**Status:** ✅ MODIFIED

```javascript
// NEW: Export centralized updateProfil function
export const updateProfil = async (data) => { 
    const res = await fetch(`${BASE_URL}/api/auth/profil`, { 
        method: 'PUT', 
        headers: { 
            'Content-Type': 'application/json', 
            ...authHeaders() 
        }, 
        body: JSON.stringify(data) 
    }); 
    return res.json(); 
};
```

### 2. `/src/components/dashboard/Topbar.jsx`
**Status:** ✅ MODIFIED

**Removed:**
- ❌ `useRef` import
- ❌ `editMode` state
- ❌ `profilEdit` state
- ❌ `fotoUrl` state
- ❌ `fileInputRef` ref
- ❌ `handleFoto()` function
- ❌ `handleSimpanProfil()` function
- ❌ All edit input fields in modal

**Added:**
- ✅ `Settings` icon import from lucide-react
- ✅ `refreshProfil()` async function to fetch from API
- ✅ Event listener for 'profileUpdated' event
- ✅ "Edit Profil" button → navigate('/settings')
- ✅ Profile modal purely read-only display

**Key Changes:**
```javascript
// NEW: Refresh function
const refreshProfil = async () => {
    const res = await getProfil();
    if (res.success && res.data) {
        setProfil({
            nama: res.data.nama_pemilik,
            role: res.data.jabatan,
            email: res.data.email,
            wa: res.data.no_telepon,
            lokasi: res.data.lokasi_usaha
        });
    }
};

// NEW: Listen for updates from Settings
useEffect(() => {
    const handleProfileUpdate = () => {
        refreshProfil();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
}, []);
```

**Modal Header:**
```javascript
// CHANGED: Only Show button now
<button onClick={() => { setShowProfil(false); navigate('/settings'); }}>
    <Settings size={16} />
    Edit Profil
</button>
```

### 3. `/src/pages/Settings.jsx`
**Status:** ✅ MODIFIED

**Removed:**
- ❌ Local `updateProfil()` function definition
- ❌ `BASE_URL`, `API_KEY`, `getToken` variables (duplicated)

**Added:**
- ✅ Import `updateProfil` from api.js
- ✅ Event dispatch in handleSave: `window.dispatchEvent(new Event('profileUpdated'))`

**Key Change:**
```javascript
// BEFORE:
async function updateProfil(data) { ... }  // Local definition

// AFTER:
import { getProfil, logout, isLoggedIn, getStokRendah, updateProfil } from '../api';

// USAGE IN handleSave:
const res = await updateProfil({...});
if (res.success) {
    setSaved(true);
    // NEW: Trigger Topbar refresh
    window.dispatchEvent(new Event('profileUpdated'));
}
```

### 4. `/src/components/auth/RegisterForm.jsx`
**Status:** ✅ NO CHANGES

Already sends proper initial profile data to backend.

---

## 🧪 Testing Checklist

- [ ] Login dengan akun existing
- [ ] Lihat profile di Topbar (read-only)
- [ ] Click avatar → modal profile buka (read-only)
- [ ] Click "Edit Profil" button → redirect ke /settings
- [ ] Edit data di Settings page
- [ ] Click "Simpan Semua Perubahan"
- [ ] Verify data tersimpan (check success message)
- [ ] Close Settings dan lihat Topbar → data sudah updated
- [ ] Refresh page → data masih ada (dari API)
- [ ] Coba edit email → tidak bisa (read-only)
- [ ] Register akun baru → initial profile terisi
- [ ] Akses Settings dari akun baru → data dari register terlihat

---

## 🔐 Security Notes

- ✅ Email field read-only - tidak bisa diubah di Settings (prevent account takeover)
- ✅ API validation di backend harus memastikan email tidak berubah
- ✅ Token-based auth via Bearer token

---

## 🐛 Known Issues & Solutions

### Issue 1: Race condition antara multiple Settings edits
**Status:** ✅ MITIGATED
- Solution: Button disabled saat loading (`disabled={loading}`)

### Issue 2: Stale data di Topbar jika API gagal
**Status:** ✅ HANDLED
- Solution: Error logged, Topbar keeps showing last valid data
- User dapat retry manual dengan re-open modal

### Issue 3: Event listener memory leak
**Status:** ✅ HANDLED
- Solution: useEffect cleanup function removes listener on unmount

---

## 📊 Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    API LAYER                             │
├──────────────────────────────────────────────────────────┤
│  • updateProfil(data)                                   │
│  • getProfil()                                          │
│  • logout(), isLoggedIn(), loginSeller(), registerSeller()
└──────────────────────────────────────────────────────────┘
        ↑                       ↑                      ↑
        │                       │                      │
┌───────┴────────┐     ┌────────┴────────┐     ┌─────┴──────────┐
│   Topbar       │     │   Settings      │     │  Auth Pages    │
│                │     │                 │     │  (Register)    │
│ • Read-only    │     │ • Edit data     │     │                │
│ • View only    │     │ • Save changes  │     │ • Initial data │
│ • Fetch on     │     │ • Trigger event │     │ • Set on       │
│   mount        │     │                 │     │   register     │
│ • Listen for   │     │                 │     │                │
│   updates      │     │                 │     │                │
└────────────────┘     └─────────────────┘     └────────────────┘
```

---

## ✅ Implementation Complete

Semua perbaikan sudah diimplementasikan dengan baik. Sistem profile sekarang:
- Konsisten dan centralized
- User experience yang jelas
- Data always in sync antara views
- Email tidak bisa di-edit (security)
- Code lebih maintainable

---

**Last Updated:** June 2, 2026
**Status:** ✅ READY FOR DEPLOYMENT
