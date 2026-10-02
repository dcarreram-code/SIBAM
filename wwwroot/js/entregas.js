let beneficiariaEntrega = null;
let turnoSeleccionado = null;


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


async function validarEntrega() {

    const dpi = document
        .getElementById("dpiEntrega")
        .value
        .trim();

    const numeroTurno = document
        .getElementById("turnoEntrega")
        .value
        .trim();

    const mensaje = document
        .getElementById("mensajeEntrega");

    const panel = document
        .getElementById("datosEntrega");


    panel.style.display = "none";

    beneficiariaEntrega = null;
    turnoSeleccionado = null;


    if (!dpi || !numeroTurno) {

        mensaje.innerHTML = `
            <div class="alert alert-warning">
                Ingrese el DPI y el número de turno.
            </div>
        `;

        return;
    }


    try {

        // 1. Buscar beneficiaria por DPI

        const respuestaBeneficiaria = await fetch(
            `/api/Beneficiarias/dpi/${encodeURIComponent(dpi)}`
        );


        const datosBeneficiaria =
            await respuestaBeneficiaria.json();


        if (!respuestaBeneficiaria.ok) {

            mensaje.innerHTML = `
                <div class="alert alert-danger">
                    ${datosBeneficiaria.mensaje}
                </div>
            `;

            return;
        }


        // 2. Verificar que no haya recibido el bono

        if (datosBeneficiaria.estado === "ENTREGADO") {

            mensaje.innerHTML = `
                <div class="alert alert-danger">
                    El bono ya fue entregado a esta beneficiaria.
                </div>
            `;

            return;
        }


        beneficiariaEntrega = datosBeneficiaria;


        // 3. Obtener turnos

        const respuestaTurnos = await fetch(
            "/api/Turnos"
        );


        if (!respuestaTurnos.ok) {

            throw new Error(
                "No se pudieron consultar los turnos."
            );
        }


        const turnos = await respuestaTurnos.json();


        // 4. Buscar el turno correspondiente

        const turno = turnos.find(t =>
            t.idBeneficiaria ===
            beneficiariaEntrega.idBeneficiaria
            &&
            t.numeroTurno ===
            Number(numeroTurno)
        );


        if (!turno) {

            mensaje.innerHTML = `
                <div class="alert alert-danger">
                    El turno no existe o no pertenece
                    a esta beneficiaria.
                </div>
            `;

            return;
        }


        // 5. Verificar si el turno ya fue atendido

        if (turno.estado === "ATENDIDO") {

            mensaje.innerHTML = `
                <div class="alert alert-danger">
                    Este turno ya fue atendido.
                </div>
            `;

            return;
        }


        turnoSeleccionado = turno;


        // Mostrar información

        document.getElementById(
            "nombreEntrega"
        ).textContent =
            beneficiariaEntrega.nombre;


        document.getElementById(
            "dpiResultado"
        ).textContent =
            beneficiariaEntrega.dpi;


        document.getElementById(
            "turnoResultado"
        ).textContent =
            turno.numeroTurno;


        document.getElementById(
            "montoEntrega"
        ).textContent =
            Number(
                beneficiariaEntrega.montoBono
            ).toFixed(2);


        panel.style.display = "block";


        mensaje.innerHTML = `
            <div class="alert alert-success">
                Datos validados correctamente.
            </div>
        `;

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


async function registrarEntrega() {

    if (!beneficiariaEntrega ||
        !turnoSeleccionado) {

        return;
    }


    const usuario = localStorage.getItem("usuarioSIBAM");

    if (!usuario) {

        window.location.href = "/";

        return;
    }


    const datosUsuario = JSON.parse(usuario);


    try {

        const url =
            `/api/Entregas?` +
            `idBeneficiaria=${beneficiariaEntrega.idBeneficiaria}` +
            `&idTurno=${turnoSeleccionado.idTurno}` +
            `&idUsuario=${datosUsuario.idUsuario}`;


        const respuesta = await fetch(
            url,
            {
                method: "POST"
            }
        );


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            document.getElementById(
                "mensajeEntrega"
            ).innerHTML = `
                <div class="alert alert-danger">
                    ${datos.mensaje}
                </div>
            `;

            return;
        }


        // Mostrar resultado

        document.getElementById(
            "nombreFinal"
        ).textContent =
            datos.beneficiaria;


        document.getElementById(
            "montoFinal"
        ).textContent =
            Number(
                datos.monto
            ).toFixed(2);


        document.getElementById(
            "turnoFinal"
        ).textContent =
            datos.turno;


        document.getElementById(
            "fechaFinal"
        ).textContent =
            new Date(
                datos.fecha
            ).toLocaleString();


        document.getElementById(
            "resultadoFinal"
        ).style.display = "block";


        document.getElementById(
            "datosEntrega"
        ).style.display = "none";


        document.getElementById(
            "mensajeEntrega"
        ).innerHTML = `
            <div class="alert alert-success">
                ${datos.mensaje}
            </div>
        `;


        // Limpiar datos

        beneficiariaEntrega = null;
        turnoSeleccionado = null;


    }
    catch (error) {

        console.error(error);

        document.getElementById(
            "mensajeEntrega"
        ).innerHTML = `
            <div class="alert alert-danger">
                No se pudo conectar con el servidor.
            </div>
        `;

    }

}


function cerrarSesion() {

    localStorage.removeItem("usuarioSIBAM");

    window.location.href = "/";

}