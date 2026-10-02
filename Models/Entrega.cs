using System.ComponentModel.DataAnnotations;

namespace SIBAM.API.Models
{
    public class Entrega
    {
        [Key]
        public int IdEntrega { get; set; }

        public int IdBeneficiaria { get; set; }

        public int IdTurno { get; set; }

        public decimal Monto { get; set; }

        public DateTime FechaEntrega { get; set; }

        public int IdUsuario { get; set; }

        public string Estado { get; set; } = string.Empty;
    }
}