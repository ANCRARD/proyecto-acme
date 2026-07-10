const STORAGE_KEY_INVENTARIO = 'inventarioMacondo';
const STORAGE_KEY_CONSECUTIVO = 'consecutivoMacondo';
const STORAGE_KEY_PRODUCCION = 'produccionMacondo';

function leerAlmacenamiento(clave, valorPorDefecto = []) {
    const valor = localStorage.getItem(clave);
    if (!valor) {
        return valorPorDefecto;
    }

    try {
        return JSON.parse(valor);
    } catch (error) {
        console.error(`No fue posible leer ${clave}:`, error);
        return valorPorDefecto;
    }
}

function obtenerTopProductosFabricados(historial = [], inventarioActual = [], limite = 5) {
    const acumuladoPorProducto = new Map();

    historial.forEach(registro => {
        const producto = inventarioActual.find(item => item.codigo === registro.productoCodigo);
        const formula = producto?.formula || registro.formula || [];

        if (!acumuladoPorProducto.has(registro.productoCodigo)) {
            acumuladoPorProducto.set(registro.productoCodigo, {
                codigo: registro.productoCodigo,
                nombre: registro.productoNombre,
                cantidadTotal: 0,
                materiaPrima: new Map()
            });
        }

        const resumen = acumuladoPorProducto.get(registro.productoCodigo);
        resumen.cantidadTotal += Number(registro.cantidad) || 0;

        formula.forEach(ingrediente => {
            const codigoMp = ingrediente.mpCodigo;
            const cantidadUsada = Number(ingrediente.cantidad) * Number(registro.cantidad);
            if (!resumen.materiaPrima.has(codigoMp)) {
                const materiaPrima = inventarioActual.find(item => item.codigo === codigoMp);
                resumen.materiaPrima.set(codigoMp, {
                    codigo: codigoMp,
                    nombre: materiaPrima?.nombre || codigoMp,
                    cantidadTotalUsada: 0
                });
            }

            resumen.materiaPrima.get(codigoMp).cantidadTotalUsada += cantidadUsada;
        });
    });

    return Array.from(acumuladoPorProducto.values())
        .map(item => ({
            codigo: item.codigo,
            nombre: item.nombre,
            cantidadTotal: item.cantidadTotal,
            materiaPrima: Array.from(item.materiaPrima.values()).sort((a, b) => b.cantidadTotalUsada - a.cantidadTotalUsada)
        }))
        .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
        .slice(0, limite);
}

function inicializarProduccion() {
    if (!localStorage.getItem('tokenSesion')) {
        alert('Acceso denegado. Inicia sesión.');
        window.location.href = 'index.html';
        return;
    }

    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    let inventario = leerAlmacenamiento(STORAGE_KEY_INVENTARIO, []);
    let historialProduccion = leerAlmacenamiento(STORAGE_KEY_PRODUCCION, []);
    let contadorProduccion = Number.parseInt(localStorage.getItem(STORAGE_KEY_CONSECUTIVO), 10) || 1;

    const selectProduccion = document.getElementById('select-producto-producir');
    const formularioProduccion = document.getElementById('formulario-produccion');
    const botonReporte = document.getElementById('btn-generar-reporte');
    const contenedorReporte = document.getElementById('reporte-top-productos');

    function cargarProductosTerminados() {
        if (!selectProduccion) {
            return;
        }

        selectProduccion.innerHTML = '<option value="" disabled selected>Seleccione producto...</option>';
        const terminados = inventario.filter(producto => producto.tipo === 'productoTerminado');

        terminados.forEach(producto => {
            selectProduccion.innerHTML += `<option value="${producto.codigo}">[${producto.codigo}] ${producto.nombre}</option>`;
        });
    }

    function mostrarReporteProductos() {
        if (!contenedorReporte) {
            return;
        }

        const topProductos = obtenerTopProductosFabricados(historialProduccion, inventario, 5);

        if (!topProductos.length) {
            contenedorReporte.innerHTML = '<p>No hay registros de producción todavía.</p>';
            return;
        }

        contenedorReporte.innerHTML = topProductos.map((producto, index) => {
            const detalleMateriaPrima = producto.materiaPrima.length > 0
                ? producto.materiaPrima.map(mp => `<li>${mp.nombre}: ${mp.cantidadTotalUsada} unidades</li>`).join('')
                : '<li>Sin receta asociada</li>';

            return `
                <article class="item-reporte-producto">
                    <h3>${index + 1}. ${producto.nombre}</h3>
                    <p><strong>Cantidad fabricada:</strong> ${producto.cantidadTotal} unidades</p>
                    <p><strong>Materia prima usada:</strong></p>
                    <ul>${detalleMateriaPrima}</ul>
                </article>
            `;
        }).join('');
    }

    formularioProduccion?.addEventListener('submit', function (e) {
        e.preventDefault();

        const codigoProducto = selectProduccion.value;
        const cantidadAFabricar = Number.parseInt(document.getElementById('cantidad-producir').value, 10);

        let producto = inventario.find(item => item.codigo === codigoProducto);

        if (!producto) {
            alert('Seleccione un producto válido.');
            return;
        }

        if (!producto.formula || producto.formula.length === 0) {
            alert('Este producto no tiene una receta definida. Por favor, edítalo en Inventario.');
            return;
        }

        const errores = [];
        producto.formula.forEach(ingrediente => {
            const mp = inventario.find(item => item.codigo === ingrediente.mpCodigo);
            const necesaria = ingrediente.cantidad * cantidadAFabricar;

            if (!mp || mp.stock < necesaria) {
                errores.push(mp ? mp.nombre : `Código ${ingrediente.mpCodigo}`);
            }
        });

        if (errores.length > 0) {
            alert('Stock insuficiente para: ' + errores.join(', '));
            return;
        }

        producto.formula.forEach(ingrediente => {
            const mp = inventario.find(item => item.codigo === ingrediente.mpCodigo);
            mp.stock -= ingrediente.cantidad * cantidadAFabricar;
        });

        producto.stock += cantidadAFabricar;

        historialProduccion.push({
            id: contadorProduccion,
            productoCodigo: producto.codigo,
            productoNombre: producto.nombre,
            cantidad: cantidadAFabricar,
            formula: producto.formula.map(ingrediente => ({ ...ingrediente }))
        });

        localStorage.setItem(STORAGE_KEY_INVENTARIO, JSON.stringify(inventario));
        localStorage.setItem(STORAGE_KEY_PRODUCCION, JSON.stringify(historialProduccion));
        localStorage.setItem(STORAGE_KEY_CONSECUTIVO, contadorProduccion + 1);

        document.getElementById('resumen-produccion').style.display = 'block';
        document.getElementById('orden-consecutivo').innerText = contadorProduccion;
        document.getElementById('resumen-producto').innerText = producto.nombre;
        document.getElementById('resumen-cantidad').innerText = cantidadAFabricar;

        const listaMP = producto.formula.map(ingrediente => `${ingrediente.cantidad * cantidadAFabricar} und. de [${ingrediente.mpCodigo}]`).join(', ');
        document.getElementById('resumen-mp').innerText = listaMP;

        mostrarReporteProductos();
        contadorProduccion++;
        alert('Proceso de producción finalizado con éxito.');
        this.reset();
    });

    botonReporte?.addEventListener('click', mostrarReporteProductos);
    cargarProductosTerminados();
    mostrarReporteProductos();
}

if (typeof document !== 'undefined') {
    inicializarProduccion();
}

if (typeof module !== 'undefined') {
    module.exports = {
        obtenerTopProductosFabricados
    };
}
