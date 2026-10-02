using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIBAM.API.Data;
using SIBAM.API.Models;

namespace SIBAM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TurnosController : ControllerBase
    {
        private readonly SibamDbContext _context;

        public TurnosController(SibamDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> ObtenerTurnos()
        {
            var turnos = await _context.Turnos
                .ToListAsync();

            return Ok(turnos);
        }





        [HttpPost]
        public async Task<IActionResult> GenerarTurno(int idBeneficiaria)
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
                    mensaje = "La beneficiaria ya recibió el bono."
                });
            }

            var ultimoTurno = await _context.Turnos
                .OrderByDescending(t => t.NumeroTurno)
                .FirstOrDefaultAsync();

            int siguienteTurno = ultimoTurno == null
                ? 1
                : ultimoTurno.NumeroTurno + 1;

            var turno = new Turno
            {
                IdBeneficiaria = idBeneficiaria,
                NumeroTurno = siguienteTurno,
                Fecha = DateTime.Now,
                Estado = "PENDIENTE"
            };

            _context.Turnos.Add(turno);

            await _context.SaveChangesAsync();

            return Ok(turno);
        }
    }
}