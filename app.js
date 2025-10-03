/* =====================================================
   CONFIGURACIÓN
===================================================== */

const CONFIG = {
    SPREADSHEET_ID: '1fMRFNMvwPfKesy1RJhIKwZAIEgyrp8JwRV6YNkaz7og',
    API_KEY: 'AIzaSyB9vU7X_Zj5L8d7c-AhdC6nduLIefhz_kY', // ⚠️ REEMPLAZAR con tu API Key
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

// Función principal de login
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