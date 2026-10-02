using Microsoft.EntityFrameworkCore;
using SIBAM.API.Models;

namespace SIBAM.API.Data
{
    public class SibamDbContext : DbContext
    {
        public SibamDbContext(DbContextOptions<SibamDbContext> options)
            : base(options)
        {
        }

        public DbSet<Beneficiaria> Beneficiarias { get; set; }
        public DbSet<Turno> Turnos { get; set; }
        public DbSet<Entrega> Entregas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
    }
}