// Seguridad: Verificar que el usuario sea administrador
if (!localStorage.getItem('tokenSesion')) {
    alert('Acceso denegado. Inicia sesión.');
    window.location.href = 'index.html';
}

let usuarioActual = null;
try {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
    }
} catch (e) {
    console.error('Error al recuperar usuario actual:', e);
}

// Verificar que sea administrador
if (!usuarioActual?.cargo || usuarioActual.cargo !== 'administrador') {
    alert('Acceso denegado. Solo los administradores pueden acceder a este módulo.');
    window.location.href = 'inventario.html';
}

const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

const formAdminUsuario = document.getElementById('form-admin-usuario');
const listaUsuariosAdmin = document.getElementById('lista-usuarios-admin');
const buscadorUsuarios = document.getElementById('buscador-usuarios');

function validarPassword(password) {
    if (password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (/\s/.test(password)) {
        return 'La contraseña no puede contener espacios.';
    }

    if (!/[A-Z]/.test(password)) {
        return 'La contraseña debe incluir al menos una letra mayúscula.';
    }

    if (!/[a-z]/.test(password)) {
        return 'La contraseña debe incluir al menos una letra minúscula.';
    }

    if (!/\d/.test(password)) {
        return 'La contraseña debe incluir al menos un número.';
    }

    if (!/[!@#$%^&*.,;:_?-]/.test(password)) {
        return 'La contraseña debe incluir al menos un símbolo especial.';
    }

    return '';
}

function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem('usuariosAcme')) || [];
}

function guardarUsuarios(listaUsuarios) {
    localStorage.setItem('usuariosAcme', JSON.stringify(listaUsuarios));
}

function renderizarUsuarios(filtro = '') {
    listaUsuariosAdmin.innerHTML = '';

    const usuarios = obtenerUsuarios();

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        String(u.id).includes(filtro)
    );

    if (usuariosFiltrados.length === 0) {
        listaUsuariosAdmin.innerHTML = '<li style="text-align: center; padding: 1rem; color: #666;">No hay usuarios registrados.</li>';
        return;
    }

    usuariosFiltrados.forEach(usuario => {
        const li = document.createElement('li');
        li.style.cssText = 'background: #fff; margin: 0.5rem 0; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; gap: 10px;';

        li.innerHTML = `
            <div style="flex: 1;">
                <strong style="font-size: 1.1rem; color: #2c3e50;">${usuario.nombre}</strong><br>
                <small style="color: #666;">
                    <strong>ID:</strong> ${usuario.id} | 
                    <strong>Cargo:</strong> ${usuario.cargo}
                </small>
            </div>
        `;

        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.style.cssText = 'background-color: #e74c3c; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 0.9rem;';

        btnEliminar.addEventListener('click', () => {
            if (String(usuario.id) === String(usuarioActual?.id)) {
                alert('No puedes eliminar tu propio usuario administrador.');
                return;
            }

            if (confirm(`¿Deseas eliminar a ${usuario.nombre}?`)) {
                const usuariosActualizados = obtenerUsuarios().filter(u => String(u.id) !== String(usuario.id));
                guardarUsuarios(usuariosActualizados);
                renderizarUsuarios(filtro);
            }
        });

        li.appendChild(btnEliminar);
        listaUsuariosAdmin.appendChild(li);
    });
}

// Evento para el formulario de agregar usuario
if (formAdminUsuario) {
    formAdminUsuario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const identificacion = document.getElementById('admin-identificacion').value.trim();
        const nombre = document.getElementById('admin-nombre').value.trim();
        const cargo = document.getElementById('admin-cargo').value;
        const password = document.getElementById('admin-password').value;
        const confirmPassword = document.getElementById('admin-confirm-password').value;

        if (!identificacion || !nombre || !cargo) {
            alert('Complete todos los datos del usuario.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const errorPassword = validarPassword(password);
        if (errorPassword) {
            alert(errorPassword);
            return;
        }

        const usuarios = obtenerUsuarios();
        if (usuarios.some(user => String(user.id).trim() === identificacion)) {
            alert('Ya existe un usuario con esa identificación.');
            return;
        }

        usuarios.push({
            id: identificacion,
            nombre,
            cargo,
            password
        });

        guardarUsuarios(usuarios);
        alert('Usuario agregado correctamente.');
        this.reset();
        renderizarUsuarios('');
    });
}

// Evento para el buscador
if (buscadorUsuarios) {
    buscadorUsuarios.addEventListener('input', function () {
        renderizarUsuarios(this.value);
    });
}

// Renderizar usuarios al cargar
renderizarUsuarios();
