const formulario = document.getElementById('form-usuario');
const btnIrALogin = document.getElementById('btn-ir-a-login');
const btnIrARegistro = document.getElementById('btn-ir-a-registro');
const moduloUsuarios = document.getElementById('modulo-usuarios');
const moduloLogin = document.getElementById('modulo-login');
const formLogin = document.getElementById('form-login');

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

if (formulario) {
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const identificacion = document.getElementById('identificacion').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const cargo = document.getElementById('cargo').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!identificacion || !nombre || !cargo) {
            alert('Todos los campos del formulario son obligatorios.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden, por favor verifica nuevamente.');
            return;
        }

        const errorPassword = validarPassword(password);
        if (errorPassword) {
            alert(errorPassword);
            return;
        }

        let listaUsuarios = JSON.parse(localStorage.getItem('usuariosAcme')) || [];

        const usuarioDuplicado = listaUsuarios.some(user => String(user.id).trim() === identificacion);
        if (usuarioDuplicado) {
            alert('Ya existe un usuario con esa identificación.');
            return;
        }

        const nuevoUsuario = {
            id: identificacion,
            nombre: nombre,
            cargo: cargo,
            password: password
        };

        listaUsuarios.push(nuevoUsuario);
        localStorage.setItem('usuariosAcme', JSON.stringify(listaUsuarios));

        alert('Usuario registrado con éxito en el sistema local.');
        formulario.reset();
    });
}

if (btnIrALogin && btnIrARegistro && moduloUsuarios && moduloLogin) {
    btnIrALogin.addEventListener('click', function () {
        moduloUsuarios.style.display = 'none';
        moduloLogin.style.display = 'block';
        btnIrALogin.style.display = 'none';
        btnIrARegistro.style.display = 'inline-block';
    });

    btnIrARegistro.addEventListener('click', function () {
        moduloLogin.style.display = 'none';
        moduloUsuarios.style.display = 'block';
        btnIrARegistro.style.display = 'none';
        btnIrALogin.style.display = 'inline-block';
    });
}

if (formLogin) {
    formLogin.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const idLogin = document.getElementById('login-identificacion').value.trim();
        const passwordLogin = document.getElementById('login-password').value;

        let listaUsuarios = JSON.parse(localStorage.getItem('usuariosAcme')) || [];

        const usuarioEncontrado = listaUsuarios.find(user => String(user.id).trim() === idLogin);

        if (usuarioEncontrado && usuarioEncontrado.password === passwordLogin) {
            alert(`¡Bienvenido, ${usuarioEncontrado.nombre}!`);
            localStorage.setItem('tokenSesion', 'activo-' + usuarioEncontrado.id);
            localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));

            window.location.href = 'inventario.html';
        } else {
            alert('Error: Identificación o contraseña incorrectas.');
        }
    });
}