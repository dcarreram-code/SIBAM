let beneficiariaActual = null;


document.addEventListener("DOMContentLoaded", function () {

    const usuario = localStorage.getItem("usuarioSIBAM");

    if (!usuario) {

        window.location.href = "/";

        return;
    }

    const datosUsuario = JSON.parse(usuario);

    document.getElementById("nombreUsuario").textContent =
        datosUsuario.nombre;

});


async function validarBeneficiaria() {

    const dpi = document
        .getElementById("dpi")
        .value
        .trim();

    const mensaje = document
        .getElementById("mensajeValidacion");

    const datosPanel = document
        .getElementById("datosBeneficiaria");

    const resultado = document
        .getElementById("resultadoTurno");


    datosPanel.style.display = "none";
    resultado.style.display = "none";
    beneficiariaActual = null;


    if (!dpi) {

        mensaje.innerHTML = `
            <div class="alert alert-warning">
                Ingrese el DPI de la beneficiaria.
            </div>
        `;

        return;
    }


    try {

        const respuesta = await fetch(
            `/api/Beneficiarias/validar/${encodeURIComponent(dpi)}`
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


        beneficiariaActual = datos.beneficiaria;


        mensaje.innerHTML = `
            <div class="alert alert-success">
                ${datos.mensaje}
            </div>
        `;


        document.getElementById(
            "nombreBeneficiaria"
        ).textContent = beneficiariaActual.nombre;


        document.getElementById(
            "dpiBeneficiaria"
        ).textContent = beneficiariaActual.dpi;


        document.getElementById(
            "telefonoBeneficiaria"
        ).textContent =
            beneficiariaActual.telefono || "No registrado";


        document.getElementById(
            "montoBeneficiaria"
        ).textContent =
            Number(
                beneficiariaActual.montoBono
            ).toFixed(2);


        datosPanel.style.display = "block";

    }
    catch (error) {

        console.error(error);

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                No se pudo conectar con el servidor.
            </div>
        `;

    }

}


async function generarTurno() {

    if (!beneficiariaActual) {

        return;
    }


    const mensaje = document
        .getElementById("mensajeValidacion");


    try {

        const respuesta = await fetch(
            `/api/Turnos?idBeneficiaria=${beneficiariaActual.idBeneficiaria}`,
            {
                method: "POST"
            }
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


        document.getElementById(
            "numeroTurno"
        ).textContent = datos.numeroTurno;


        document.getElementById(
            "nombreTurno"
        ).textContent = beneficiariaActual.nombre;


        document.getElementById(
            "dpiTurno"
        ).textContent = beneficiariaActual.dpi;


        document.getElementById(
            "fechaTurno"
        ).textContent =
            new Date(datos.fecha).toLocaleString();


        document.getElementById(
            "resultadoTurno"
        ).style.display = "block";


        document.getElementById(
            "btnGenerarTurno"
        ).disabled = true;


        mensaje.innerHTML = `
            <div class="alert alert-success">
                Turno generado correctamente.
            </div>
        `;

    }
    catch (error) {

        console.error(error);

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                No se pudo generar el turno.
            </div>
        `;

    }

}


function cerrarSesion() {

    localStorage.removeItem("usuarioSIBAM");

    window.location.href = "/";

}