using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIBAM.API.Data;

namespace SIBAM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly SibamDbContext _context;

        public DashboardController(SibamDbContext context)
        {
            _context = context;
        }

        [HttpGet("estadisticas")]
        public async Task<IActionResult> ObtenerEstadisticas()
        {
            var totalBeneficiarias = await _context.Beneficiarias
                .CountAsync();

            var totalPendientes = await _context.Beneficiarias
                .CountAsync(b => b.Estado == "PENDIENTE");

            var totalTurnos = await _context.Turnos
                .CountAsync();

            var totalEntregas = await _context.Entregas
                .CountAsync();

            return Ok(new
            {
                totalBeneficiarias,
                totalPendientes,
                totalTurnos,
                totalEntregas
            });
        }
    }
}