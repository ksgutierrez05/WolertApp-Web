using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class TipoAlertaDTO
    {
        public int IdTipoAlerta { get; set; }
        public string? Nombre { get; set; }
        public string? Prioridad { get; set; }
        public string? CentralResponsable { get; set; }
    }

    public class TipoAlertaCreateDTO
    {
        [Required, StringLength(50)]
        public string Nombre { get; set; } = null!;

        [Required, StringLength(10)]
        public string Prioridad { get; set; } = null!;

        [StringLength(20)]
        public string? CentralResponsable { get; set; }
    }
}
