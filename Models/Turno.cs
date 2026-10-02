using System.ComponentModel.DataAnnotations;

namespace SIBAM.API.Models
{
    public class Turno
    {
        [Key]
        public int IdTurno { get; set; }

        public int IdBeneficiaria { get; set; }

        public int NumeroTurno { get; set; }

        public DateTime Fecha { get; set; }

        public string Estado { get; set; } = string.Empty;
    }
}