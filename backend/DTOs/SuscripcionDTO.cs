using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class SuscripcionRequestDto
    {
        // Solo lo usa un ADMIN. Para un usuario normal se toma del token.
        public int? IdUsuario { get; set; }
        public int? IdTipoAlerta { get; set; }   // null = todos los tipos
        public int? IdBarrio { get; set; }       // barrio y comuna null = toda la ciudad
        public int? IdComuna { get; set; }
        [StringLength(15)] public string? Estado { get; set; }  // si no se envía: ACTIVA
    }

    public class SuscripcionDto
    {
        public int IdSuscripcion { get; set; }
        public int? IdUsuario { get; set; }
        public string? UsuarioCedula { get; set; }
        public string? UsuarioCorreo { get; set; }
        public int? IdTipoAlerta { get; set; }
        public string? TipoAlertaNombre { get; set; }
        public int? IdBarrio { get; set; }
        public string? BarrioNombre { get; set; }
        public int? IdComuna { get; set; }
        public string? ComunaNombre { get; set; }
        public string? Estado { get; set; }
        public string Alcance { get; set; } = "CIUDAD";  // BARRIO / COMUNA / CIUDAD
    }
}