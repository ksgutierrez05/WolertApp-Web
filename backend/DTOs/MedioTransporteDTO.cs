using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class MedioTransporteRequestDto
    {
        [Required, StringLength(50)] public string Nombre { get; set; } = null!;
    }

    public class MedioTransporteDto
    {
        public int IdMedioTransporte { get; set; }
        public string? Nombre { get; set; }
    }
}