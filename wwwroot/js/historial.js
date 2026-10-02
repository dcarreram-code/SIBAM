document.addEventListener("DOMContentLoaded", function () {

    const usuario = localStorage.getItem("usuarioSIBAM");

    if (!usuario) {

        window.location.href = "/";

        return;
    }

    const datosUsuario = JSON.parse(usuario);

    document.getElementById("nombreUsuario").textContent =
        datosUsuario.nombre;

    cargarHistorial();

});


async function cargarHistorial() {

    const tabla =
        document.getElementById("tablaHistorial");

    tabla.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                Cargando historial...
            </td>
        </tr>
    `;

    try {

        const respuesta = await fetch(
            "/api/Entregas/historial"
        );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener el historial."
            );
        }

        const historial = await respuesta.json();

        tabla.innerHTML = "";

        document.getElementById(
            "totalEntregas"
        ).textContent = historial.length;


        if (historial.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center">

                        No hay entregas registradas.

                    </td>
                </tr>
            `;

            return;
        }


        historial.forEach(function (entrega) {

            const fila = document.createElement("tr");

            const fecha = new Date(
                entrega.fecha
            ).toLocaleString();


            fila.innerHTML = `

                <td>
                    ${fecha}
                </td>

                <td>
                    ${entrega.dpi}
                </td>

                <td>
                    ${entrega.nombre}
                </td>

                <td>
                    ${entrega.turno}
                </td>

                <td>
                    Q ${Number(
                entrega.monto
            ).toFixed(2)}
                </td>

                <td>
                    ${entrega.usuario}
                </td>

                <td>
                    <span class="badge bg-success">
                        ${entrega.estado}
                    </span>
                </td>

            `;

            tabla.appendChild(fila);

        });

    }
    catch (error) {

        console.error(error);

        tabla.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-danger">

                    Error al cargar el historial.

                </td>
            </tr>
        `;

    }

}


function cerrarSesion() {

    localStorage.removeItem("usuarioSIBAM");

    window.location.href = "/";

}