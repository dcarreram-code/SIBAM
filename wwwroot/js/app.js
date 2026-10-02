const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    mensaje.innerHTML = "";

    try {

        const url =
            `/api/Usuarios/login?usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`;

        const respuesta = await fetch(url, {
            method: "POST"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            mensaje.innerHTML = `
                <div class="alert alert-danger">
                    ${datos.mensaje}
                </div>
            `;

            return;
        }

        localStorage.setItem(
            "usuarioSIBAM",
            JSON.stringify(datos)
        );

        window.location.href = "/dashboard.html";

    } catch (error) {

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                No se pudo conectar con el servidor.
            </div>
        `;

        console.error(error);
    }

});