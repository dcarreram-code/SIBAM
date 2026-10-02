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


async function importarExcel() {

    const archivoInput =
        document.getElementById("archivoExcel");

    const mensaje =
        document.getElementById("mensajeImportacion");

    const resultado =
        document.getElementById("resultadoImportacion");


    if (archivoInput.files.length === 0) {

        mensaje.innerHTML = `
            <div class="alert alert-warning">
                Seleccione un archivo Excel.
            </div>
        `;

        return;
    }


    const archivo = archivoInput.files[0];


    if (!archivo.name.toLowerCase().endsWith(".xlsx")) {

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                El archivo debe tener formato .xlsx.
            </div>
        `;

        return;
    }


    const formulario = new FormData();

    formulario.append("archivo", archivo);


    mensaje.innerHTML = `
        <div class="alert alert-info">
            Importando archivo, espere un momento...
        </div>
    `;


    try {

        const respuesta = await fetch(
            "/api/Beneficiarias/importar",
            {
                method: "POST",
                body: formulario
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


        mensaje.innerHTML = `
            <div class="alert alert-success">
                ${datos.mensaje}
            </div>
        `;


        resultado.style.display = "block";


        document.getElementById("procesados").textContent =
            datos.registrosProcesados;

        document.getElementById("nuevas").textContent =
            datos.nuevasBeneficiarias;

        document.getElementById("duplicadas").textContent =
            datos.duplicadas;

        document.getElementById("errores").textContent =
            datos.errores;


        const detalle =
            document.getElementById("detalleErrores");


        if (datos.detalleErrores &&
            datos.detalleErrores.length > 0) {

            detalle.innerHTML = `
                <div class="alert alert-warning">

                    <strong>Detalle de errores:</strong>

                    <ul class="mt-2 mb-0">

                        ${datos.detalleErrores
                    .map(error => `<li>${error}</li>`)
                    .join("")}

                    </ul>

                </div>
            `;

        }
        else {

            detalle.innerHTML = `
                <div class="alert alert-success">
                    No se encontraron errores durante la importación.
                </div>
            `;

        }

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


function cerrarSesion() {

    localStorage.removeItem("usuarioSIBAM");

    window.location.href = "/";

}