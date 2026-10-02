using System.ComponentModel.DataAnnotations;

namespace SIBAM.API.Models
{
    public class Beneficiaria
    {
        [Key]
        public int IdBeneficiaria { get; set; }

        public string DPI { get; set; } = string.Empty;

        public string Nombre { get; set; } = string.Empty;

        public string? Telefono { get; set; }

        public int IntegrantesFamilia { get; set; }

        public decimal MontoBono { get; set; }

        public string Estado { get; set; } = string.Empty;
    }
}