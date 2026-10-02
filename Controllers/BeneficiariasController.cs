using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIBAM.API.Data;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;


namespace SIBAM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BeneficiariasController : ControllerBase
    {
        private readonly SibamDbContext _context;

        public BeneficiariasController(SibamDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerBeneficiarias()
        {
            var beneficiarias = await _context.Beneficiarias.ToListAsync();

            return Ok(beneficiarias);
        }

        [HttpGet("dpi/{dpi}")]
        public async Task<IActionResult> ObtenerPorDPI(string dpi)
        {
            var beneficiaria = await _context.Beneficiarias
                .FirstOrDefaultAsync(b => b.DPI == dpi);

            if (beneficiaria == null)
            {
                return NotFound(new
                {
                    mensaje = "No se encontró una beneficiaria con el DPI proporcionado."
                });
            }

            return Ok(beneficiaria);
        }


        [HttpGet("validar/{dpi}")]
        public async Task<IActionResult> ValidarBeneficiaria(string dpi)
        {
            var beneficiaria = await _context.Beneficiarias
                .FirstOrDefaultAsync(b => b.DPI == dpi);

            if (beneficiaria == null)
            {
                return NotFound(new
                {
                    encontrada = false,
                    mensaje = "No se encontró una beneficiaria con el DPI proporcionado."
                });
            }

            if (beneficiaria.Estado == "ENTREGADO")
            {
                return BadRequest(new
                {
                    encontrada = true,
                    puedeRecibir = false,
                    mensaje = "El bono ya fue entregado a esta beneficiaria.",
                    beneficiaria = beneficiaria.Nombre
                });
            }

            return Ok(new
            {
                encontrada = true,
                puedeRecibir = true,
                mensaje = "Beneficiaria válida. Puede continuar con la asignación de turno.",
                beneficiaria = beneficiaria
            });
        }

        [HttpPost("importar")]
        public async Task<IActionResult> ImportarExcel(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
            {
                return BadRequest(new
                {
                    mensaje = "Debe seleccionar un archivo Excel."
                });
            }

            if (!Path.GetExtension(archivo.FileName)
                .Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    mensaje = "El archivo debe tener formato .xlsx."
                });
            }

            var nuevas = 0;
            var duplicadas = 0;
            var errores = 0;

            var detalleErrores = new List<string>();

            using var stream = archivo.OpenReadStream();

            using var workbook = new XLWorkbook(stream);

            var hoja = workbook.Worksheets.FirstOrDefault();

            if (hoja == null)
            {
                return BadRequest(new
                {
                    mensaje = "El archivo Excel no contiene hojas."
                });
            }

            var ultimaFila = hoja.LastRowUsed()?.RowNumber() ?? 0;

            if (ultimaFila < 2)
            {
                return BadRequest(new
                {
                    mensaje = "El archivo Excel no contiene registros."
                });
            }

            for (int fila = 2; fila <= ultimaFila; fila++)
            {
                try
                {
                    var dpi = hoja.Cell(fila, 1).GetString().Trim();
                    var nombre = hoja.Cell(fila, 2).GetString().Trim();
                    var telefono = hoja.Cell(fila, 3).GetString().Trim();

                    var integrantesTexto = hoja.Cell(fila, 4).GetString().Trim();
                    var montoTexto = hoja.Cell(fila, 5).GetString().Trim();

                    if (string.IsNullOrWhiteSpace(dpi))
                    {
                        throw new Exception("El DPI está vacío.");
                    }

                    if (dpi.Length != 13)
                    {
                        throw new Exception("El DPI debe tener 13 caracteres.");
                    }

                    if (string.IsNullOrWhiteSpace(nombre))
                    {
                        throw new Exception("El nombre está vacío.");
                    }

                    if (!int.TryParse(integrantesTexto, out int integrantes))
                    {
                        throw new Exception("IntegrantesFamilia no es un número válido.");
                    }

                    if (integrantes <= 0)
                    {
                        throw new Exception("IntegrantesFamilia debe ser mayor que 0.");
                    }

                    if (!decimal.TryParse(
                        montoTexto,
                        System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture,
                        out decimal monto))
                    {
                        throw new Exception("MontoBono no es un número válido.");
                    }

                    if (monto < 0)
                    {
                        throw new Exception("MontoBono no puede ser negativo.");
                    }

                    var existe = await _context.Beneficiarias
                        .AnyAsync(b => b.DPI == dpi);

                    if (existe)
                    {
                        duplicadas++;
                        continue;
                    }

                    var beneficiaria = new Models.Beneficiaria
                    {
                        DPI = dpi,
                        Nombre = nombre,
                        Telefono = string.IsNullOrWhiteSpace(telefono)
                            ? null
                            : telefono,
                        IntegrantesFamilia = integrantes,
                        MontoBono = monto,
                        Estado = "PENDIENTE"
                    };

                    _context.Beneficiarias.Add(beneficiaria);

                    nuevas++;
                }
                catch (Exception ex)
                {
                    errores++;

                    detalleErrores.Add(
                        $"Fila {fila}: {ex.Message}"
                    );
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Importación completada.",
                registrosProcesados = ultimaFila - 1,
                nuevasBeneficiarias = nuevas,
                duplicadas = duplicadas,
                errores = errores,
                detalleErrores = detalleErrores
            });
        }

    }
}