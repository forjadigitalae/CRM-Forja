/* =====================================================
   CONFIGURACIÓN
===================================================== */

const CONFIG = {
    SPREADSHEET_ID: '1pXa3WMgoquZd7jeXzUDAoq9HTeLkAexDhAaojT2wBNQ', // ⬅️ ACTUALIZA ESTE ID
    API_KEY: 'AIzaSyB9vU7X_Zj5L8d7c-AhdC6nduLIefhz_kY',
    SHEET_USERS: 'Usuarios',
    SHEET_LEADS: 'Leads'
};


/* =====================================================
   LOGIN - AUTENTICACIÓN
===================================================== */

// Verificar si ya está autenticado al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Si estamos en index.html y ya hay sesión, redirigir a dashboard
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const userName = localStorage.getItem('userName');
        if (userName) {
            window.location.href = 'dashboard.html';
            return;
        }
    }
    
    // Si estamos en cualquier otra página y NO hay sesión, redirigir a login
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        const userName = localStorage.getItem('userName');
        if (!userName) {
            window.location.href = 'index.html';
            return;
        }
    }
});

// Manejar el submit del formulario
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        await login(email, password);
    });
}

// Función principal de login (VERSION TEMPORAL SIN GOOGLE SHEETS)
async function login(email, password) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    const errorMessage = document.getElementById('errorMessage');
    
    // Mostrar loader
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    loginBtn.disabled = true;
    errorMessage.style.display = 'none';
    
    try {
        // Usuarios hardcodeados temporalmente
        const users = [
            ['forjadigitalae@gmail.com', 'admin123', 'Administrador Forja', 'Admin']
        ];
        
        // Pequeña pausa para simular API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Buscar usuario que coincida
        const user = users.find(row => {
            return row[0] === email && row[1] === password;
        });
        
        if (user) {
            // Login exitoso
            localStorage.setItem('userEmail', user[0]);
            localStorage.setItem('userName', user[2]);
            localStorage.setItem('userRole', user[3]);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            // Redirigir a dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error('Credenciales inválidas');
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        
        // Mostrar mensaje de error
        errorMessage.style.display = 'flex';
        
        // Restaurar botón
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        loginBtn.disabled = false;
        
        // Limpiar campos
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {
    // Limpiar localStorage
    localStorage.clear();
    
    // Redirigir a login
    window.location.href = 'index.html';
}


/* =====================================================
   UTILIDADES
===================================================== */

// Verificar autenticación (usar en todas las páginas protegidas)
function checkAuth() {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Obtener nombre de usuario actual
function getCurrentUser() {
    return {
        email: localStorage.getItem('userEmail'),
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole')
    };
}


/* =====================================================
   GOOGLE SHEETS API INTEGRATION
===================================================== */

// ⬅️ DESDE AQUÍ EMPIEZA EL CÓDIGO NUEVO

const SHEET_ID = '1pXa3WMgoquZd7jeXzUDAoq9HTeLkAexDhAaojT2wBNQ';
const API_KEY = 'AIzaSyB9vU7X_Zj5L8d7c-AhdC6nduLIefhz_kY';

const SHEETS = {
    USUARIOS: 'Usuarios',
    LEADS: 'Leads',
    OPORTUNIDADES: 'Oportunidades',
    INTERACCIONES: 'Interacciones',
    PROPUESTAS: 'Propuestas',
    RECORDATORIOS: 'Recordatorios',
    EVENTOS: 'Eventos',
    CONFIGURACION: 'Configuracion'
};

// ==========================================
// FUNCIONES GENÉRICAS PARA LEER DATOS
// ==========================================

/**
 * Leer datos de cualquier pestaña
 * @param {string} sheetName - Nombre de la pestaña
 * @param {string} range - Rango de celdas (ej: 'A1:Z1000')
 * @returns {Promise<Array>} Array de objetos con los datos
 */
async function readSheetData(sheetName, range = 'A1:Z1000') {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!${range}?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.values || data.values.length === 0) {
            return [];
        }
        
        // Primera fila son los encabezados
        const headers = data.values[0];
        const rows = data.values.slice(1);
        
        // Convertir a array de objetos
        return rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
    } catch (error) {
        console.error(`Error leyendo ${sheetName}:`, error);
        return [];
    }
}

/**
 * Escribir datos en cualquier pestaña usando Google Apps Script
 * @param {string} sheetName - Nombre de la pestaña
 * @param {Array} values - Array con los valores a escribir
 * @returns {Promise<boolean>} True si se guardó correctamente
 */
async function writeSheetData(sheetName, values) {
    try {
        // URL de tu Google Apps Script
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzE-Oy_tHdbGrpUHVMAHDXyS3fDFvDQZv-HSCQVg8EVu5EVJBIDiDbV26cxxN3tsX9hJA/exec'; // ⬅️ REEMPLAZAR
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sheetName: sheetName,
                values: values
            })
        });
        
        // Como usamos no-cors, asumimos éxito si no hay error
        console.log('Datos enviados a Google Apps Script');
        return true;
        
    } catch (error) {
        console.error(`Error escribiendo en ${sheetName}:`, error);
        return false;
    }
}

// ==========================================
// FUNCIONES ESPECÍFICAS POR MÓDULO
// ==========================================

// ========== LEADS ==========
async function getLeads() {
    return await readSheetData(SHEETS.LEADS);
}

async function addLead(leadData) {
    // Obtener el próximo ID
    const leads = await getLeads();
    const nextId = leads.length > 0 ? Math.max(...leads.map(l => parseInt(l.id) || 0)) + 1 : 1;
    
    // Crear fila con datos en el ORDEN EXACTO de las columnas del Sheet
    const newRow = [
        nextId,                                              // id
        leadData.nombre,                                     // nombre
        leadData.cargo || '',                                // cargo
        leadData.email,                                      // email
        leadData.telefono,                                   // telefono
        leadData.empresa || '',                              // empresa
        leadData.sector || '',                               // sector
        leadData.estado || 'Nuevo',                          // estado
        leadData.prioridad || 'Media',                       // prioridad
        leadData.valor_estimado || 0,                        // valor_estimado
        leadData.asignado_a || 'Sin asignar',               // asignado_a
        leadData.notas || '',                                // notas
        new Date().toISOString().split('T')[0],             // fecha_creacion
        new Date().toISOString().split('T')[0],             // fecha_actualizacion
        leadData.origen || 'CRM Manual'                      // origen
    ];
    
    return await writeSheetData(SHEETS.LEADS, [newRow]);
}

// ========== OPORTUNIDADES ==========
async function getOportunidades() {
    return await readSheetData(SHEETS.OPORTUNIDADES);
}

async function addOportunidad(oppData) {
    const newRow = [
        '', // ID
        oppData.titulo,
        oppData.lead_id || '',
        oppData.empresa || '',
        oppData.contacto || '',
        oppData.etapa || 'Prospecto',
        oppData.valor || 0,
        oppData.probabilidad || 0,
        new Date().toISOString().split('T')[0], // fecha_creacion
        oppData.fecha_cierre_estimada || '',
        '', // fecha_cierre_real
        oppData.asignado_a || '',
        oppData.descripcion || '',
        oppData.notas || '',
        'Activa'
    ];
    
    return await writeSheetData(SHEETS.OPORTUNIDADES, [newRow]);
}

// ========== INTERACCIONES ==========
async function getInteracciones() {
    return await readSheetData(SHEETS.INTERACCIONES);
}

async function addInteraccion(interactionData) {
    const newRow = [
        '', // ID
        interactionData.lead_id || '',
        interactionData.oportunidad_id || '',
        interactionData.tipo || 'nota',
        interactionData.titulo || '',
        interactionData.descripcion || '',
        interactionData.fecha || new Date().toISOString().split('T')[0],
        interactionData.hora || '',
        interactionData.duracion || 0,
        interactionData.usuario || '',
        interactionData.empresa || '',
        interactionData.cliente || '',
        interactionData.resultado || '',
        interactionData.siguiente_accion || '',
        new Date().toISOString() // fecha_creacion
    ];
    
    return await writeSheetData(SHEETS.INTERACCIONES, [newRow]);
}

// ========== PROPUESTAS ==========
async function getPropuestas() {
    return await readSheetData(SHEETS.PROPUESTAS);
}

async function addPropuesta(proposalData) {
    const newRow = [
        '', // ID
        proposalData.titulo,
        proposalData.lead_id || '',
        proposalData.oportunidad_id || '',
        proposalData.empresa || '',
        proposalData.contacto || '',
        proposalData.descripcion || '',
        proposalData.valor || 0,
        proposalData.moneda || 'USD',
        proposalData.estado || 'Borrador',
        new Date().toISOString().split('T')[0], // fecha_creacion
        proposalData.fecha_envio || '',
        proposalData.fecha_valida_hasta || '',
        proposalData.fecha_aprobacion || '',
        proposalData.creado_por || '',
        proposalData.url_documento || '',
        proposalData.notas || '',
        proposalData.terminos || ''
    ];
    
    return await writeSheetData(SHEETS.PROPUESTAS, [newRow]);
}

// ========== RECORDATORIOS ==========
async function getRecordatorios() {
    return await readSheetData(SHEETS.RECORDATORIOS);
}

async function addRecordatorio(reminderData) {
    const newRow = [
        '', // ID
        reminderData.titulo,
        reminderData.descripcion || '',
        reminderData.tipo || 'tarea',
        reminderData.fecha || new Date().toISOString().split('T')[0],
        reminderData.hora || '',
        reminderData.prioridad || 'Media',
        'Pendiente', // estado
        reminderData.lead_id || '',
        reminderData.oportunidad_id || '',
        reminderData.empresa || '',
        reminderData.asignado_a || '',
        '', // completado_por
        '', // fecha_completado
        new Date().toISOString(), // fecha_creacion
        reminderData.notificacion || 'No',
        reminderData.minutos_antes || 30
    ];
    
    return await writeSheetData(SHEETS.RECORDATORIOS, [newRow]);
}

// ========== EVENTOS ==========
async function getEventos() {
    return await readSheetData(SHEETS.EVENTOS);
}

async function addEvento(eventData) {
    const newRow = [
        '', // ID
        eventData.titulo,
        eventData.descripcion || '',
        eventData.tipo || 'reunion',
        eventData.fecha || new Date().toISOString().split('T')[0],
        eventData.hora_inicio || '',
        eventData.hora_fin || '',
        eventData.duracion || 60,
        eventData.ubicacion || '',
        eventData.lead_id || '',
        eventData.oportunidad_id || '',
        eventData.empresa || '',
        eventData.cliente || '',
        eventData.asignado_a || '',
        'Programado', // estado
        eventData.recordatorio || 'No',
        eventData.minutos_recordatorio || 30,
        '', // google_calendar_id
        new Date().toISOString() // fecha_creacion
    ];
    
    return await writeSheetData(SHEETS.EVENTOS, [newRow]);
}

// ========== CONFIGURACIÓN ==========
async function getConfiguracion() {
    return await readSheetData(SHEETS.CONFIGURACION);
}

async function getConfigValue(key) {
    const configs = await getConfiguracion();
    const config = configs.find(c => c.clave === key);
    return config ? config.valor : null;
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Generar próximo ID para una pestaña
 */
async function getNextId(sheetName) {
    const data = await readSheetData(sheetName);
    if (data.length === 0) return 1;
    
    const ids = data.map(row => parseInt(row.id) || 0);
    return Math.max(...ids) + 1;
}

/**
 * Cargar datos de múltiples pestañas
 */
async function loadAllData() {
    const [leads, oportunidades, interacciones, propuestas, recordatorios, eventos] = await Promise.all([
        getLeads(),
        getOportunidades(),
        getInteracciones(),
        getPropuestas(),
        getRecordatorios(),
        getEventos()
    ]);
    
    return {
        leads,
        oportunidades,
        interacciones,
        propuestas,
        recordatorios,
        eventos
    };
}

console.log('✅ Google Sheets API Integration loaded');