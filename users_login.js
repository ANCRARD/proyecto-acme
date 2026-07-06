const formulario = document.getElementById('form-usuario');

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const identificacion = document.getElementById('identificacion').value;
    const nombre = document.getElementById('nombre').value;
    const cargo = document.getElementById('cargo').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden, por favor verifica nuevamente.');
        return;
    }

    const nuevoUsuario = {
        id: identificacion,
        nombre: nombre,
        cargo: cargo,
        password: password
    };

    let listaUsuarios = JSON.parse(localStorage.getItem('usuariosAcme')) || [];
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosAcme', JSON.stringify(listaUsuarios));

    alert('Usuario registrado con éxito en el sistema local.');
    formulario.reset();
});

//----------------------------------------------------------------------------------
const btnIrALogin = document.getElementById('btn-ir-a-login');
const btnIrARegistro = document.getElementById('btn-ir-a-registro');
const moduloUsuarios = document.getElementById('modulo-usuarios');
const moduloLogin = document.getElementById('modulo-login');

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

//-----------------------------------------------------------------------------------
const formLogin = document.getElementById('form-login');
formLogin.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const idLogin = document.getElementById('login-identificacion').value;
    const passwordLogin = document.getElementById('login-password').value;

    let listaUsuarios = JSON.parse(localStorage.getItem('usuariosAcme')) || [];

    const usuarioEncontrado = listaUsuarios.find(user => user.id === idLogin);

    if (usuarioEncontrado && usuarioEncontrado.password === passwordLogin) {
        alert(` ¡Bienvenido, ${usuarioEncontrado.nombre}!`);
        localStorage.setItem('tokenSesion', 'activo-' + usuarioEncontrado.id);
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));


        window.location.href = 'inventario.html';
    } else {
        alert("Error: Identificación o contraseña incorrectas.");
    }
});