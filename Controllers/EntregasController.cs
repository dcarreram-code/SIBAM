using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIBAM.API.Data;
using SIBAM.API.Models;

namespace SIBAM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EntregasController : ControllerBase
    {
        private readonly SibamDbContext _context;

        public EntregasController(SibamDbContext context)
        {
            _context = context;
        }


        [HttpGet("historial")]
        public async Task<IActionResult> ObtenerHistorial()
        {
            var historial = await _context.Entregas
                .Join(
                    _context.Beneficiarias,
                    entrega => entrega.IdBeneficiaria,
                    beneficiaria => beneficiaria.IdBeneficiaria,
                    (entrega, beneficiaria) => new
                    {
                        entrega,
                        beneficiaria
                    })
                .Join(
                    _context.Turnos,
                    x => x.entrega.IdTurno,
                    turno => turno.IdTurno,
                    (x, turno) => new
                    {
                        x.entrega,
                        x.beneficiaria,
                        turno
                    })
                .Join(
                    _context.Usuarios,
                    x => x.entrega.IdUsuario,
                    usuario => usuario.IdUsuario,
                    (x, usuario) => new
                    {
                        x.entrega,
                        x.beneficiaria,
                        x.turno,
                        usuario
                    })
                .OrderByDescending(x => x.entrega.FechaEntrega)
                .Select(x => new
                {
                    idEntrega = x.entrega.IdEntrega,
                    fecha = x.entrega.FechaEntrega,
                    dpi = x.beneficiaria.DPI,
                    nombre = x.beneficiaria.Nombre,
                    turno = x.turno.NumeroTurno,
                    monto = x.entrega.Monto,
                    usuario = x.usuario.UsuarioNombre,
                    estado = x.entrega.Estado
                })
                .ToListAsync();

            return Ok(historial);
        }






        [HttpPost]
        public async Task<IActionResult> RegistrarEntrega(
            int idBeneficiaria,
            int idTurno,
            int idUsuario)
        {
            var beneficiaria = await _context.Beneficiarias
                .FirstOrDefaultAsync(b => b.IdBeneficiaria == idBeneficiaria);

            if (beneficiaria == null)
            {
                return NotFound(new
                {
                    mensaje = "No se encontró la beneficiaria."
                });
            }

            if (beneficiaria.Estado == "ENTREGADO")
            {
                return BadRequest(new
                {
                    mensaje = "El bono ya fue entregado a esta beneficiaria."
                });
            }

            var turno = await _context.Turnos
                .FirstOrDefaultAsync(t =>
                    t.IdTurno == idTurno &&
                    t.IdBeneficiaria == idBeneficiaria);

            if (turno == null)
            {
                return NotFound(new
                {
                    mensaje = "El turno no existe o no pertenece a esta beneficiaria."
                });
            }

            if (turno.Estado == "ATENDIDO")
            {
                return BadRequest(new
                {
                    mensaje = "Este turno ya fue atendido."
                });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u =>
                    u.IdUsuario == idUsuario &&
                    u.Activo);

            if (usuario == null)
            {
                return BadRequest(new
                {
                    mensaje = "El usuario encargado no es válido."
                });
            }

            var entrega = new Entrega
            {
                IdBeneficiaria = idBeneficiaria,
                IdTurno = idTurno,
                Monto = beneficiaria.MontoBono,
                FechaEntrega = DateTime.Now,
                IdUsuario = idUsuario,
                Estado = "ENTREGADO"
            };

            _context.Entregas.Add(entrega);

            beneficiaria.Estado = "ENTREGADO";
            turno.Estado = "ATENDIDO";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Bono entregado correctamente.",
                beneficiaria = beneficiaria.Nombre,
                monto = entrega.Monto,
                turno = turno.NumeroTurno,
                fecha = entrega.FechaEntrega
            });
        }
    }
}