using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
	public class AppDBContext : DbContext
	{
		public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) { }

		// Tablas
		public DbSet<Rol> Roles { get; set; }
		public DbSet<Usuario> Usuarios { get; set; }
		public DbSet<Comuna> Comunas { get; set; }
		public DbSet<Barrio> Barrios { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			ConfigurarUsuarios(modelBuilder);
			SembrarRoles(modelBuilder);
		}

		// Reglas de la tabla Usuarios
		private static void ConfigurarUsuarios(ModelBuilder modelBuilder)
		{
			var usuario = modelBuilder.Entity<Usuario>();

			// Estos datos no se pueden repetir entre usuarios
			usuario.HasIndex(u => u.Cedula).IsUnique();
			usuario.HasIndex(u => u.Correo).IsUnique();
			usuario.HasIndex(u => u.Username).IsUnique();
			// No se puede borrar un rol si todavía tiene usuarios
			usuario.HasOne(u => u.Rol) .WithMany(r => r.Usuarios) .OnDelete(DeleteBehavior.Restrict);
		}

		// Datos iniciales de la tabla Roles
		private static void SembrarRoles(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Rol>().HasData(
				new Rol { IdRol = 1, Nombre = "Admin" },
				new Rol { IdRol = 2, Nombre = "Ciudadano" },
				new Rol { IdRol = 3, Nombre = "Policia" },
				new Rol { IdRol = 4, Nombre = "AdminPolicia" },
				new Rol { IdRol = 5, Nombre = "CentralPolicia" },
				new Rol { IdRol = 6, Nombre = "AgenteTransito" },
				new Rol { IdRol = 7, Nombre = "CentralTransito"},
				new Rol { IdRol = 8, Nombre = "DirectorTransito" }
			);
		}
	}
}