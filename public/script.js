document.getElementById('addProductForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (validarFormulario()) {
        crearProducto();
    }
});

// Validar campos del formulario
function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const imagen = document.getElementById('imagen').value.trim();

    return validarDatosProducto(nombre, descripcion, precio, stock, imagen);
}

// Validar datos del producto
function validarDatosProducto(nombre, descripcion, precio, stock, imagen) {
    const errores = [];
    if (nombre === '') errores.push('El nombre es obligatorio.');
    if (descripcion === '') errores.push('La descripción es obligatoria.');
    if (isNaN(precio) || precio <= 0) errores.push('El precio debe ser un número válido mayor que 0.');
    if (isNaN(stock) || stock < 0) errores.push('El stock debe ser un número entero válido (0 o mayor).');
    if (imagen === '') errores.push('La URL de la imagen es obligatoria.');

    if (errores.length > 0) {
        alert(errores.join('\n'));
        return false;
    }
    return true; // Todo es válido
}

// Crear un nuevo producto
function crearProducto() {
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const imagen = document.getElementById('imagen').value;

    fetch('/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, descripcion, precio, stock, imagen })
    })
        .then(response => response.text())
        .then(message => {
            console.log(message);
            cargarProductos();
            document.getElementById('addProductForm').reset();
        })
        .catch(err => console.error('Error al crear el producto:', err));
}

// Cargar todos los productos
function cargarProductos() {
    fetch('/productos')
        .then(response => response.json())
        .then(data => {
            const productosDiv = document.getElementById('productos');
            productosDiv.innerHTML = '';
            const productosHTML = data.map(producto => `
                <div class="card">
                    <h4>${producto.nombre}</h4>
                    <p>${producto.descripcion}</p>
                    <p>Precio: $${producto.precio}</p>
                    <p>Stock: ${producto.stock}</p>
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
                    <button onclick="mostrarFormularioActualizar(${producto.id}, '${producto.nombre}', '${producto.descripcion}', ${producto.precio}, ${producto.stock}, '${producto.imagen}')">Actualizar</button>
                </div>
            `).join('');
            productosDiv.innerHTML = productosHTML;
        })
        .catch(err => console.error('Error al cargar productos:', err));
}
function cerrarModal() {
    const modal = document.querySelector('.modal');
    modal.innerHTML = '';
    modal.style.display = 'none';
}
// Mostrar formulario de actualización
function mostrarFormularioActualizar(id, nombre, descripcion, precio, stock, imagen) {
    const updateProductDiv = document.getElementById('updateProductForm');
    updateProductDiv.innerHTML += `
        <div class="div_actualizar_form modal-content">
        <button onclick="cerrarModal()" class="close-button">Cerrar</button>
            <h2>Actualizar Producto</h2>
            <input type="text" id="nombre-${id}" value="${nombre}">
            <textarea id="descripcion-${id}">${descripcion}</textarea>
            <input type="number" id="precio-${id}" value="${precio}">
            <input type="number" id="stock-${id}" value="${stock}">
            <input type="text" id="imagen-${id}" value="${imagen}">
            <button onclick="actualizarProducto(${id})" class="btn-guardar">Guardar</button>
        </div>
    `;
    const modal = document.querySelector('.modal');
    modal.style.display = 'flex';
}

// Actualizar un producto
function actualizarProducto(id) {
    const nombre = document.getElementById(`nombre-${id}`).value.trim();
    const descripcion = document.getElementById(`descripcion-${id}`).value.trim();
    const precio = parseFloat(document.getElementById(`precio-${id}`).value);
    const stock = parseInt(document.getElementById(`stock-${id}`).value);
    const imagen = document.getElementById(`imagen-${id}`).value.trim();

    cerrarModal();


    if (!validarDatosProducto(nombre, descripcion, precio, stock, imagen)) {
        return; // Salir si la validación falla
    }

    fetch(`/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, descripcion, precio, stock, imagen })
    })
        .then(response => response.text())
        .then(message => {
            console.log(message);
            cargarProductos();
        })
        .catch(err => console.error('Error al actualizar el producto:', err));
}

// Eliminar un producto
function eliminarProducto(id) {
    fetch(`/productos/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.text())
        .then(message => {
            console.log(message);
            cargarProductos();
        })
        .catch(err => console.error('Error al eliminar el producto:', err));
}

document.getElementById('logoutBtn').addEventListener('click', async function () {


    try {
        const response = await fetch('http://localhost:3000/logout', {
            method: 'POST'
        });

        if (response.ok) {
            showMessage('Sesión cerrada con éxito.');
            window.location.href = 'http://localhost:3000/login.html';
        } else {
            const data = await response.json();
            showMessage(data.error || 'Error al cerrar sesión.', true); // Mostrar mensaje de error si no es exitosa
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showMessage('Error al conectar con el servidor.', true); // Error de conexión con el servidor
    }
});

function showMessage(message, isError = false) {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.style.color = isError ? 'red' : 'green';
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}
// Cargar los productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);
