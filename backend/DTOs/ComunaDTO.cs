using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ComunaDTO
    {
        public int IdComuna { get; set; }
        public string? Nombre { get; set; }
        public int TotalBarrios { get; set; }
    }

    public class ComunaCreateDTO
    {
        [Required, StringLength(50)]
        public string Nombre { get; set; } = null!;
    }
}