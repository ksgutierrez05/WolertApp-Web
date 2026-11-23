using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class TipoArmaRequestDto
    {
        [Required, StringLength(30)] public string Nombre { get; set; } = null!;
    }

    public class TipoArmaDto
    {
        public int IdTipoArma { get; set; }
        public string? Nombre { get; set; }
    }
}