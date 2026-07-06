// Seguridad
if (!localStorage.getItem('tokenSesion')) {
    alert("Acceso denegado. Inicia sesión.");
    window.location.href = 'index.html';
}

document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

let inventario = JSON.parse(localStorage.getItem('inventarioMacondo')) || [];

const tipoProducto = document.getElementById('tipoProducto');
const campoDinamico = document.getElementById('campo-dinamico');

// 1. Renderizar campos dinámicos
tipoProducto.addEventListener('change', function () {
    campoDinamico.innerHTML = ''; // Limpiar campos previos

    if (this.value === 'materiaPrima') {
        campoDinamico.innerHTML = `
            <label for="proveedor">Nombre del Proveedor:</label>
            <input type="text" id="proveedor" required>
        `;
    } else if (this.value === 'productoTerminado') {
        campoDinamico.innerHTML = `
            <div id="contenedor-receta">
                <label>Receta (Ingredientes requeridos):</label>
                <div id="lista-ingredientes"></div>
                <button type="button" id="btn-add-ingrediente" style="background:#3498db; margin-top:10px;">+ Agregar Materia Prima</button>
            </div>
        `;
        document.getElementById('btn-add-ingrediente').addEventListener('click', agregarFilaIngrediente);
    }
});

// Función para agregar filas a la receta dinámicamente
function agregarFilaIngrediente() {
    const lista = document.getElementById('lista-ingredientes');
    const div = document.createElement('div');
    div.className = 'fila-ingrediente';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginTop = '10px';
    div.style.alignItems = 'center'; // Alineación vertical

    const opciones = inventario.filter(p => p.tipo === 'materiaPrima')
        .map(p => `<option value="${p.codigo}">${p.nombre}</option>`).join('');

    div.innerHTML = `
        <select class="ingrediente-select" required>${opciones || '<option>No hay materias primas</option>'}</select>
        <input type="number" class="ingrediente-cant" placeholder="Cantidad" required>
        <button type="button" class="btn-eliminar-fila" style="background:#e74c3c; border:none; color:white; cursor:pointer; padding: 5px 10px;">X</button>
    `;

    // Evento para eliminar esta fila específica
    div.querySelector('.btn-eliminar-fila').addEventListener('click', function () {
        div.remove();
    });

    lista.appendChild(div);
}

// 2. Guardar nuevo producto (Recolecta todos los ingredientes)
document.getElementById('formulario-inventario').addEventListener('submit', function (e) {
    e.preventDefault();
    const codigo = document.getElementById('producto-codigo').value;
    const nombre = document.getElementById('nombreProducto').value;
    const tipo = tipoProducto.value;

    if (inventario.find(p => p.codigo === codigo)) {
        alert("El código ya existe.");
        return;
    }

    let nuevoProducto = { codigo, nombre, tipo, stock: 0 };

    if (tipo === 'materiaPrima') {
        nuevoProducto.proveedor = document.getElementById('proveedor').value;
    } else {
        // Guardamos la receta como un arreglo
        let receta = [];
        document.querySelectorAll('.fila-ingrediente').forEach(fila => {
            receta.push({
                mpCodigo: fila.querySelector('.ingrediente-select').value,
                cantidad: parseInt(fila.querySelector('.ingrediente-cant').value)
            });
        });
        nuevoProducto.formula = receta;
    }

    inventario.push(nuevoProducto);
    localStorage.setItem('inventarioMacondo', JSON.stringify(inventario));
    alert('Producto creado con éxito.');
    this.reset();
    campoDinamico.innerHTML = '';
    actualizarInterfaz();
});

// Aumentar Stock
document.getElementById('formulario-stock').addEventListener('submit', function (e) {
    e.preventDefault();
    const codigo = document.getElementById('select-producto-stock').value;
    const cantidad = parseInt(document.getElementById('cantidad-stock').value);

    let producto = inventario.find(p => p.codigo === codigo);
    if (producto) {
        producto.stock += cantidad;
        localStorage.setItem('inventarioMacondo', JSON.stringify(inventario));
        alert('Stock actualizado.');
        this.reset();
        actualizarInterfaz();
    }
});

// Buscador
document.getElementById('buscador-inventario').addEventListener('input', function () {
    mostrarInventario(this.value.toLowerCase());
});

// Actualizar UI
function actualizarInterfaz() {
    inventario = JSON.parse(localStorage.getItem('inventarioMacondo')) || [];

    const selectStock = document.getElementById('select-producto-stock');
    selectStock.innerHTML = '<option value="" disabled selected>Seleccione producto...</option>';
    inventario.forEach(p => {
        selectStock.innerHTML += `<option value="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`;
    });

    mostrarInventario();
}

function mostrarInventario(filtro = '') {
    const lista = document.getElementById('lista-inventario');
    lista.innerHTML = '';

    // Usamos el 'index' en el forEach para saber qué elemento eliminar
    inventario.filter(p => p.nombre.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro))
        .forEach((item, index) => { // <--- Agregamos 'index' aquí

            let detalle = item.tipo === 'materiaPrima' ? `Proveedor: ${item.proveedor}` :
                `Receta: ` + (item.formula?.map(f => `${f.cantidad} de [${f.mpCodigo}]`).join(', ') || 'Sin ingredientes');

            // Creamos el elemento 'li'
            const li = document.createElement('li');
            li.style.cssText = "background: #fff; margin: 0.5rem 0; padding: 1rem; border: 1px solid #ccc; border-radius: 4px;";
            li.innerHTML = `
            <strong>[${item.codigo}] ${item.nombre}</strong> - <em>${item.tipo === 'materiaPrima' ? 'Materia Prima' : 'Producto Terminado'}</em><br>
            Saldo actual: <strong>${item.stock}</strong><br>
            ${detalle}<br>
        `;

            // Creamos el botón de eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.innerText = "Eliminar Producto";
            btnEliminar.style.cssText = "background-color: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-top: 10px; border-radius: 3px;";

            // Asignamos la función de eliminar al botón
            btnEliminar.onclick = () => eliminarProducto(index);

            li.appendChild(btnEliminar);
            lista.appendChild(li);
        });
}

// NUEVA FUNCIÓN: Colócala al final de tu archivo inventario.js
function eliminarProducto(index) {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
        inventario.splice(index, 1); // Elimina el producto del arreglo
        localStorage.setItem('inventarioMacondo', JSON.stringify(inventario)); // Guarda el cambio
        actualizarInterfaz(); // Recarga la lista para que desaparezca
    }
}

actualizarInterfaz();