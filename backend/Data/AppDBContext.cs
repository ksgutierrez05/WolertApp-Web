using backend.Models;
using Microsoft.EntityFrameworkCore;
using WolertApp.Models;

namespace backend.Data
{
    public class AppDBContext : DbContext
    {
     
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) { }

        // Tablas
        public DbSet<Rol> Roles { get; set; } = default!;
        public DbSet<Usuario> Usuarios { get; set; } = default!;
        public DbSet<Comuna> Comunas { get; set; } = default!;
        public DbSet<Barrio> Barrios { get; set; } = default!;
        public DbSet<Unidad> Unidades { get; set; } = default!;
        public DbSet<Policia> Policias { get; set; } = default!;
        public DbSet<UnidadTransito> UnidadesTransito { get; set; } = default!;
        public DbSet<AgentesTransito> AgentesTransito { get; set; } = default!;
        public DbSet<Alerta> Alertas { get; set; } = default!;
        public DbSet<TipoAlerta> TiposAlerta { get; set; } = default!;
        public DbSet<TipoArma> TiposArma => Set<TipoArma>();
        public DbSet<MedioTransporte> MediosTransporte => Set<MedioTransporte>();
        public DbSet<Semaforo> Semaforos => Set<Semaforo>();
        public DbSet<Alarma> Alarmas => Set<Alarma>();
        public DbSet<Suscripcion> Suscripciones => Set<Suscripcion>();
        public DbSet<Notificacion> Notificaciones => Set<Notificacion>();
        public DbSet<AsignacionUnidad> Asignaciones => Set<AsignacionUnidad>();
        public DbSet<AtencionAlerta> AtencionesAlerta => Set<AtencionAlerta>();
        public DbSet<AtencionTransito> AtencionesTransito => Set<AtencionTransito>();
        public DbSet<SolicitudApoyo> SolicitudesApoyo => Set<SolicitudApoyo>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Los IDs los generan los triggers + secuencias de la base:
            // EF no debe enviarlos al insertar, solo leerlos de vuelta.
            modelBuilder.Entity<Usuario>().Property(u => u.IdUsuario).ValueGeneratedOnAdd();
            modelBuilder.Entity<Comuna>().Property(c => c.IdComuna).ValueGeneratedOnAdd();
            modelBuilder.Entity<Barrio>().Property(b => b.IdBarrio).ValueGeneratedOnAdd();
            modelBuilder.Entity<Rol>().Property(r => r.IdRol).ValueGeneratedOnAdd();
            modelBuilder.Entity<Unidad>().Property(u => u.IdUnidad).ValueGeneratedOnAdd();
            modelBuilder.Entity<UnidadTransito>().Property(u => u.IdUnidadTransito).ValueGeneratedOnAdd();
            // POLICIAS y AGENTES_TRANSITO: la clave es ID_USUARIO (FK a USUARIOS), no se autogenera
            modelBuilder.Entity<Policia>().Property(p => p.IdUsuario).ValueGeneratedNever();
            modelBuilder.Entity<AgentesTransito>().Property(a => a.IdUsuario).ValueGeneratedNever();
            modelBuilder.Entity<Alerta>().Property(a => a.IdAlerta).ValueGeneratedOnAdd();
            modelBuilder.Entity<TipoAlerta>().Property(t => t.IdTipoAlerta).ValueGeneratedOnAdd();
            modelBuilder.Entity<TipoArma>().Property(t => t.IdTipoArma).ValueGeneratedOnAdd();
            modelBuilder.Entity<MedioTransporte>().Property(m => m.IdMedioTransporte).ValueGeneratedOnAdd();
            modelBuilder.Entity<Notificacion>().Property(n => n.IdNotificacion).ValueGeneratedOnAdd();
            modelBuilder.Entity<AsignacionUnidad>().Property(a => a.IdAsignacion).ValueGeneratedOnAdd();
            modelBuilder.Entity<AtencionAlerta>().Property(a => a.IdAtencion).ValueGeneratedOnAdd();
            modelBuilder.Entity<AtencionTransito>().Property(a => a.IdAtencionTransito).ValueGeneratedOnAdd();
            modelBuilder.Entity<SolicitudApoyo>().Property(s => s.IdSolicitudApoyo).ValueGeneratedOnAdd();

            // SEMAFOROS: ID por trigger TRG_ID_SEMAFOROS (ejecutar antes SQL/TRG_ID_SEMAFOROS.sql)
            modelBuilder.Entity<Semaforo>(e =>
            {
                e.Property(s => s.IdSemaforo).ValueGeneratedOnAdd();
                e.Property(s => s.Latitud).HasPrecision(10, 7);
                e.Property(s => s.Longitud).HasPrecision(10, 7);
            });

            modelBuilder.Entity<Alarma>(e =>
            {
                e.Property(a => a.IdAlarma).ValueGeneratedOnAdd();
                e.Property(a => a.Latitud).HasColumnType("NUMBER");
                e.Property(a => a.Longitud).HasColumnType("NUMBER");
                e.Property(a => a.RadioCobertura).HasColumnType("NUMBER");
                // La escribe el trigger TRG_FECHA_ACTIVACION_ALARMA: EF no la envía y la vuelve a leer
                e.Property(a => a.FechaActivacion).ValueGeneratedOnAddOrUpdate();
            });

            modelBuilder.Entity<Suscripcion>().Property(s => s.IdSuscripcion).ValueGeneratedOnAdd();
            // No se puede borrar un rol si todavía tiene usuarios
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Rol)
                .WithMany(r => r.Usuarios)
                .OnDelete(DeleteBehavior.Restrict);

            // La base no tiene ON DELETE CASCADE: que EF no lo asuma.
            // Si hay registros dependientes, el DELETE falla con ORA-02292 y el controlador responde 409.
            modelBuilder.Entity<Policia>()
                .HasOne(p => p.Usuario)
                .WithMany()
                .HasForeignKey(p => p.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Policia>()
                .HasOne(p => p.Unidad)
                .WithMany(u => u.Policias)
                .HasForeignKey(p => p.IdUnidad)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}