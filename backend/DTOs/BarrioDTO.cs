using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class BarrioDTO
    {
        public int IdBarrio { get; set; }
        public string? Nombre { get; set; }
        public int? ComunaId { get; set; }
        public string? ComunaNombre { get; set; }
    }

    public class BarrioCreateDTO
    {
        [Required, StringLength(50)]
        public string Nombre { get; set; } = null!;

        [Range(1, int.MaxValue)]
        public int ComunaId { get; set; }
    }
}