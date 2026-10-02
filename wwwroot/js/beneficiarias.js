document.addEventListener("DOMContentLoaded", function () {

    const usuario = localStorage.getItem("usuarioSIBAM");

    if (!usuario) {

        window.location.href = "/";

        return;
    }

    const datosUsuario = JSON.parse(usuario);

    document.getElementById("nombreUsuario").textContent =
        datosUsuario.nombre;

    cargarBeneficiarias();

});


async function cargarBeneficiarias() {

    const tabla = document.getElementById("tablaBeneficiarias");

    tabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Cargando...
            </td>
        </tr>
    `;

    try {

        const respuesta = await fetch(
            "/api/Beneficiarias"
        );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las beneficiarias."
            );
        }

        const beneficiarias = await respuesta.json();

        tabla.innerHTML = "";

        if (beneficiarias.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center">

                        No hay beneficiarias registradas.

                    </td>
                </tr>
            `;

            return;
        }

        beneficiarias.forEach(function (beneficiaria) {

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${beneficiaria.dpi}</td>

                <td>${beneficiaria.nombre}</td>

                <td>${beneficiaria.telefono ?? ""}</td>

                <td>${beneficiaria.integrantesFamilia}</td>

                <td>
                    Q ${Number(
                beneficiaria.montoBono
            ).toFixed(2)}
                </td>

                <td>
                    ${crearEstado(
                beneficiaria.estado
            )}
                </td>
            `;

            tabla.appendChild(fila);

        });

    }
    catch (error) {

        console.error(error);

        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-danger">

                    Error al cargar las beneficiarias.

                </td>
            </tr>
        `;

    }

}


async function buscarBeneficiaria() {

    const dpi = document
        .getElementById("buscarDPI")
        .value
        .trim();

    const mensaje = document
        .getElementById("mensajeBusqueda");

    if (!dpi) {

        mensaje.innerHTML = `
            <div class="alert alert-warning">
                Ingrese un DPI para realizar la búsqueda.
            </div>
        `;

        return;
    }

    try {

        const respuesta = await fetch(
            `/api/Beneficiarias/dpi/${encodeURIComponent(dpi)}`
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            mensaje.innerHTML = `
                <div class="alert alert-danger">
                    ${datos.mensaje}
                </div>
            `;

            return;
        }

        mensaje.innerHTML = `
            <div class="alert alert-success">

                <strong>${datos.nombre}</strong><br>

                DPI: ${datos.dpi}<br>

                Estado:
                ${datos.estado}<br>

                Monto:
                Q ${Number(
            datos.montoBono
        ).toFixed(2)}

            </div>
        `;

    }
    catch (error) {

        console.error(error);

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                Error al consultar la beneficiaria.
            </div>
        `;

    }

}


function crearEstado(estado) {

    if (estado === "ENTREGADO") {

        return `
            <span class="badge bg-success">
                ENTREGADO
            </span>
        `;

    }

    return `
        <span class="badge bg-warning text-dark">
            PENDIENTE
        </span>
    `;

}


function cerrarSesion() {

    localStorage.removeItem("usuarioSIBAM");

    window.location.href = "/";

}