using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
	public class AppDBContext : DbContext
	{
		public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) { }

		// Tablas
		public DbSet<backend.Models.Unidad> Unidades { get; set; } = default!;
		public DbSet<backend.Models.Policia> Policias { get; set; } = default!;
		public DbSet<Rol> Roles { get; set; }
		public DbSet<Usuario> Usuarios { get; set; }
		public DbSet<Comuna> Comunas { get; set; }
		public DbSet<Barrio> Barrios { get; set; }
		public DbSet<UnidadTransito> UnidadesTransito { get; set; }
		public DbSet<AgentesTransito> AgentesTransito { get; set; }
		public DbSet<TipoAlerta> TiposAlerta { get; set; }
		public DbSet<Alerta> Alertas { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			ConfigurarUsuarios(modelBuilder);
			SembrarRoles(modelBuilder);
			ConfigurarAlertas(modelBuilder);
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
			usuario.HasOne(u => u.Rol).WithMany(r => r.Usuarios).OnDelete(DeleteBehavior.Restrict);
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
				new Rol { IdRol = 7, Nombre = "CentralTransito" },
				new Rol { IdRol = 8, Nombre = "DirectorTransito" }
			);
		}

		// Reglas de las tablas TiposAlerta y Alertas
		private static void ConfigurarAlertas(ModelBuilder modelBuilder)
		{
			// El nombre del tipo de alerta no se puede repetir
			modelBuilder.Entity<TipoAlerta>().HasIndex(t => t.Nombre).IsUnique();

			var alerta = modelBuilder.Entity<Alerta>();

			// Restrict: no se puede borrar un usuario, tipo o barrio que tenga alertas
			alerta.HasOne(a => a.Usuario).WithMany().HasForeignKey(a => a.UsuarioId).OnDelete(DeleteBehavior.Restrict);
			alerta.HasOne(a => a.TipoAlerta).WithMany().HasForeignKey(a => a.TipoAlertaId).OnDelete(DeleteBehavior.Restrict);
			alerta.HasOne(a => a.Barrio).WithMany().HasForeignKey(a => a.BarrioId).OnDelete(DeleteBehavior.Restrict);

			// Índice para consultar alertas por fecha
			alerta.HasIndex(a => a.Fecha);
		}
	}
}