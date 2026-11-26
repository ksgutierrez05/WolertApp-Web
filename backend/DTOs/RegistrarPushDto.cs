using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class RegistrarPushDto
{
    [Required]
    [MaxLength(2048)]
    public string Endpoint { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string P256dh { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Auth { get; set; } = string.Empty;

    [Required]
    [Range(-90.0, 90.0)]
    public decimal? Latitud { get; set; }

    [Required]
    [Range(-180.0, 180.0)]
    public decimal? Longitud { get; set; }

    [Range(50, 2000)]
    public int RadioMetros { get; set; } = 500;
}