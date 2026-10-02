document.addEventListener("DOMContentLoaded", async function () {

    const usuario = localStorage.getItem("usuarioSIBAM");

    if (!usuario) {

        window.location.href = "/";

        return;
    }

    const datosUsuario = JSON.parse(usuario);

    document.getElementById("nombreUsuario").textContent =
        datosUsuario.nombre;

    await cargarEstadisticas();

});


async function cargarEstadisticas() {

    try {

        const respuesta = await fetch(
            "/api/Dashboard/estadisticas"
        );

        if (!respuesta.ok) {

            console.error(
                "No se pudieron obtener las estadísticas."
            );

            return;
        }

        const datos = await respuesta.json();

        document.getElementById(
            "totalBeneficiarias"
        ).textContent = datos.totalBeneficiarias;

        document.getElementById(
            "totalPendientes"
        ).textContent = datos.totalPendientes;

        document.getElementById(
            "totalTurnos"
        ).textContent = datos.totalTurnos;

        document.getElementById(
            "totalEntregas"
        ).textContent = datos.totalEntregas;

    }
    catch (error) {

        console.error(
            "Error al cargar estadísticas:",
            error
        );

    }

}


function cerrarSesion() {

    localStorage.removeItem("usuarioSIBAM");

    window.location.href = "/";

}