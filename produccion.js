// Seguridad: Verificar sesión
if (!localStorage.getItem('tokenSesion')) {
    alert("Acceso denegado. Inicia sesión.");
    window.location.href = 'index.html';
}

document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

let inventario = JSON.parse(localStorage.getItem('inventarioMacondo')) || [];
let contadorProduccion = parseInt(localStorage.getItem('consecutivoMacondo')) || 1;

const selectProduccion = document.getElementById('select-producto-producir');

// Cargar solo productos terminados en el select
function cargarProductosTerminados() {
    selectProduccion.innerHTML = '<option value="" disabled selected>Seleccione producto...</option>';
    let terminados = inventario.filter(p => p.tipo === 'productoTerminado');

    terminados.forEach(p => {
        selectProduccion.innerHTML += `<option value="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`;
    });
}

// Lógica de producción
document.getElementById('formulario-produccion').addEventListener('submit', function (e) {
    e.preventDefault();

    const codigoProducto = selectProduccion.value;
    const cantidadAFabricar = parseInt(document.getElementById('cantidad-producir').value);

    let producto = inventario.find(p => p.codigo === codigoProducto);

    // Validación: ¿Tiene el producto una fórmula definida?
    if (!producto.formula || producto.formula.length === 0) {
        alert("Este producto no tiene una receta definida. Por favor, edítalo en Inventario.");
        return;
    }

    // 1. Verificar stock de TODAS las materias primas antes de descontar nada
    let errores = [];
    producto.formula.forEach(ingrediente => {
        let mp = inventario.find(p => p.codigo === ingrediente.mpCodigo);
        let necesaria = ingrediente.cantidad * cantidadAFabricar;

        if (!mp || mp.stock < necesaria) {
            errores.push(mp ? mp.nombre : `Código ${ingrediente.mpCodigo}`);
        }
    });

    if (errores.length > 0) {
        alert("Stock insuficiente para: " + errores.join(", "));
        return;
    }

    // 2. Ejecutar producción (Descontar MP y Aumentar Producto)
    producto.formula.forEach(ingrediente => {
        let mp = inventario.find(p => p.codigo === ingrediente.mpCodigo);
        mp.stock -= (ingrediente.cantidad * cantidadAFabricar);
    });

    producto.stock += cantidadAFabricar;

    // 3. Guardar cambios
    localStorage.setItem('inventarioMacondo', JSON.stringify(inventario));
    localStorage.setItem('consecutivoMacondo', contadorProduccion + 1);

    // 4. Mostrar Resumen
    document.getElementById('resumen-produccion').style.display = 'block';
    document.getElementById('orden-consecutivo').innerText = contadorProduccion;
    document.getElementById('resumen-producto').innerText = producto.nombre;
    document.getElementById('resumen-cantidad').innerText = cantidadAFabricar;

    // Listar las materias primas usadas en el resumen
    let listaMP = producto.formula.map(f => `${f.cantidad * cantidadAFabricar} und. de [${f.mpCodigo}]`).join(', ');
    document.getElementById('resumen-mp').innerText = listaMP;

    contadorProduccion++;
    alert('Proceso de producción finalizado con éxito.');
    this.reset();
});

cargarProductosTerminados();