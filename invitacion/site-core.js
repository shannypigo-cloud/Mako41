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
  // OJO: no le ponemos header Content-Type a propósito. Si lo hacemos,
  // el navegador puede disparar un preflight o Apps Script puede
  // redirigir el POST de forma que se convierta en GET (bug conocido).
  // Dejando el body como string plano, el fetch usa text/plain por
  // default (sin preflight) y Codigo.gs lo parsea como JSON del lado
  // del servidor. Así es como funciona el crucero.
  const url = `${CONFIG.APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`;
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body || {})
  }).then(r => r.json());
}

function getAppData() {
  return apiGet("getAppData");
}

function addDedicatoria({ invitado, mensaje, foto }) {
  return apiPost("addDedicatoria", { invitado, mensaje, foto });
}

function toggleLike(dedicatoriaId, invitado, emoji) {
  return apiPost("toggleLike", { dedicatoriaId, invitado, emoji });
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

function declinarAsistencia(contacto, motivo) {
  return apiPost("declinarAsistencia", { contacto, motivo });
}

// ---------- Utilidad: convertir un <input type=file> a base64 ----------
// Comprime/redimensiona la imagen antes de mandarla (máx 1000px de ancho,
// calidad 0.7) para que la URL no se vuelva gigante y falle o se demore.
function fileToPayload(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const MAX_WIDTH = 1000;
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG calidad 0.7 — buen balance entre peso y calidad visual
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64 = dataUrl.split(",")[1];

        resolve({
          base64,
          mimeType: 'image/jpeg',
          originalName: file.name,
          size: Math.round((base64.length * 3) / 4) // tamaño aprox ya comprimido
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
