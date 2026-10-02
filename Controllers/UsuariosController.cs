using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIBAM.API.Data;

namespace SIBAM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly SibamDbContext _context;

        public UsuariosController(SibamDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(string usuario, string password)
        {
            var usuarioEncontrado = await _context.Usuarios
                .FirstOrDefaultAsync(u =>
                    u.UsuarioNombre == usuario &&
                    u.Password == password &&
                    u.Activo);

            if (usuarioEncontrado == null)
            {
                return Unauthorized(new
                {
                    mensaje = "Usuario o contraseña incorrectos."
                });
            }

            return Ok(new
            {
                mensaje = "Inicio de sesión correcto.",
                idUsuario = usuarioEncontrado.IdUsuario,
                nombre = usuarioEncontrado.Nombre,
                usuario = usuarioEncontrado.UsuarioNombre,
                rol = usuarioEncontrado.Rol
            });
        }
    }
}