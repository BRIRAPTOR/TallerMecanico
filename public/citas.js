let mecanicos = [];
let clientes = [];

const selectClientes = document.querySelector('select[name="usuario_id"]');
const selectMecanicos = document.querySelector('select[name="mecanico_id"]');

async function loadDatos() {
    // 1. Cargar clientes
    const resClientes = await fetch(`/api/clientes`);
    clientes = await resClientes.json();

    // 2. Cargar mecánicos
    const resMecanicos = await fetch(`/api/mecanicos`);
    mecanicos = await resMecanicos.json();

    // 3. Llenar select de clientes
    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nombre_usuario;
        selectClientes.appendChild(option);
    });

    // 4. Llenar select de mecánicos
    mecanicos.forEach(mecanico => {
        const option = document.createElement("option");
        option.value = mecanico.id;
        option.textContent = mecanico.nombre_usuario;
        selectMecanicos.appendChild(option);
    });
}

// CREAR NUEVA CITA
const form = document.getElementById("form-cita");

form.addEventListener("submit", async function(event) {
    // Obtener valores de los campos
    const usuario_id = form.elements["usuario_id"].value;
    const mecanico_id = form.elements["mecanico_id"].value;
    const fecha = form.elements["fecha"].value;
    const hora = form.elements["hora"].value;
    const nota = form.elements["nota"].value;

    const data = {
        usuario_id,
        mecanico_id,
        fecha,
        hora,
        nota,
    };

    // Enviar datos al servidor
    try {
        const response = await fetch("/api/citas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Cita creada");
            form.reset();
        } else {
            alert("❌ Error");
        }
    } catch (error) {
        alert("❌ Error en la conexión: " + error.message);
    }
});
async function cargarCitas() {
    try {
        const respuesta = await fetch('api/citas'); // Ajusta tu URL
        const citas = await respuesta.json();

        const lista = document.getElementById('lista-citas');
        lista.innerHTML = ''; // Limpiar la lista

        for (const cita of citas) {
            const li = document.createElement('li');

            // 🔹 Espera a que se resuelvan las promesas
            const clienteRes = await fetch(`/api/user/${cita.usuario_id}`);
            const clienteData = await clienteRes.json();

            const mecanicoRes = await fetch(`/api/user/${cita.mecanico_id}`);
            const mecanicoData = await mecanicoRes.json();

            const nombre_cliente = clienteData[0]?.nombre_usuario || 'Desconocido';
            const nombre_mecanico = mecanicoData[0]?.nombre_usuario || 'Desconocido';

            // Convertimos la fecha a formato legible
            const fechaLegible = new Date(cita.fecha).toLocaleDateString('es-MX');

            li.textContent = `🆔 ${cita.id} | 📅 ${fechaLegible} | ⏰ ${cita.hora} | 🧑 Cliente: ${nombre_cliente} | 🔧 Mecánico: ${nombre_mecanico} | 📝 Nota: ${cita.nota}`;

            lista.appendChild(li);
        }
    } catch (error) {
        console.error('Error al cargar las citas:', error);
    }
}

cargarCitas();
document.addEventListener("DOMContentLoaded", loadDatos);
