// ============================================
// MAKO41 · site-core.js
// Puente entre el frontend y el Apps Script
// (mismo patrón que la app del crucero: GET con
// ?action=... y POST con action + body JSON)
// ============================================

const CONFIG = {
  EVENT_NAME: "MAKO41",
  // 👉 Reemplaza esto con la URL de tu Web App publicada (Implementar > Nueva implementación)
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxASy-eubd_9w7I-RBNLgGUXExa4UB-GI0g7zAw5ad9NesAeWII8T2dW3BS7KdPynAlQA/exec"
};

// ---------- Sesión local (solo para recordar quién eres en este dispositivo) ----------
function getSession() {
  try { return JSON.parse(localStorage.getItem("mako41_session")); }
  catch (e) { return null; }
}
function setSession(name) {
  localStorage.setItem("mako41_session", JSON.stringify({ name, ts: Date.now() }));
}
function clearSession() {
  localStorage.removeItem("mako41_session");
}

// ---------- Llamadas a la API ----------
function apiGet(action) {
  const url = `${CONFIG.APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`;
  return fetch(url).then(r => r.json());
}

function apiPost(action, body) {
  const url = `${CONFIG.APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita preflight CORS
    body: JSON.stringify(body)
  }).then(r => r.json());
}

function getAppData() {
  return apiGet("getAppData");
}

function addDedicatoria({ invitado, mensaje, foto }) {
  return apiPost("addDedicatoria", { invitado, mensaje, foto });
}

function toggleLike(dedicatoriaId, invitado) {
  return apiPost("toggleLike", { dedicatoriaId, invitado });
}

function addComment(dedicatoriaId, invitado, comentario) {
  return apiPost("addComment", { dedicatoriaId, invitado, comentario });
}

function confirmarAsistencia(invitado) {
  return apiPost("confirmarAsistencia", { invitado });
}

function registrarGrupo(nombres, contacto, correo) {
  return apiPost("registrarGrupo", { nombres, contacto, correo });
}

// ---------- Utilidad: convertir un <input type=file> a base64 ----------
function fileToPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve({ base64, mimeType: file.type, originalName: file.name, size: file.size });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
