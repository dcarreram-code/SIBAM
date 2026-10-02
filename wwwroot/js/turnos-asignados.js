document.addEventListener("DOMContentLoaded", function () {

    const usuario = localStorage.getItem("usuarioSIBAM");

    if (!usuario) {

        window.location.href = "/";

        return;
    }

    const datosUsuario = JSON.parse(usuario);

    document.getElementById("nombreUsuario").textContent =
        datosUsuario.nombre;

    cargarTurnos();

});


async function cargarTurnos() {

    const tabla =
        document.getElementById("tablaTurnos");

    tabla.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                Cargando turnos...
            </td>
        </tr>
    `;

    try {

        const respuesta = await fetch(
            "/api/Turnos"
        );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los turnos."
            );

        }

        const turnos = await respuesta.json();

        tabla.innerHTML = "";


        // Obtener beneficiarias

        const respuestaBeneficiarias = await fetch(
            "/api/Beneficiarias"
        );

        if (!respuestaBeneficiarias.ok) {

            throw new Error(
                "No se pudieron obtener las beneficiarias."
            );

        }

        const beneficiarias =
            await respuestaBeneficiarias.json();


        let pendientes = 0;
        let atendidos = 0;


        if (turnos.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center">

                        No hay turnos asignados.

                    </td>
                </tr>
            `;

        }


        turnos.forEach(function (turno) {

            const beneficiaria =
                beneficiarias.find(
                    b =>
                        b.idBeneficiaria ===
                        turno.idBeneficiaria
                );


            if (turno.estado === "PENDIENTE") {

                pendientes++;

            }
            else if (turno.estado === "ATENDIDO") {

                atendidos++;

            }


            const fila =
                document.createElement("tr");


            const fecha =
                new Date(
                    turno.fecha
                ).toLocaleString();


            fila.innerHTML = `

                <td>
                    <strong>
                        #${turno.numeroTurno}
                    </strong>
                </td>

                <td>
                    ${beneficiaria
                    ? beneficiaria.nombre
                    : "No encontrada"
                }
                </td>

                <td>
                    ${beneficiaria
                    ? beneficiaria.dpi
                    : "-"
                }
                </td>

                <td>
                    ${fecha}
                </td>

                <td>
                    ${crearEstadoTurno(
                    turno.estado
                )}
                </td>

            `;


            tabla.appendChild(fila);

        });


        document.getElementById(
            "totalTurnos"
        ).textContent = turnos.length;


        document.getElementById(
            "turnosPendientes"
        ).textContent = pendientes;


        document.getElementById(
            "turnosAtendidos"
        ).textContent = atendidos;

    }
    catch (error) {

        console.error(error);

        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-danger">

                    Error al cargar los turnos.

                </td>
            </tr>
        `;

    }

}


function crearEstadoTurno(estado) {

    if (estado === "ATENDIDO") {

        return `
            <span class="badge bg-success">
                ATENDIDO
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