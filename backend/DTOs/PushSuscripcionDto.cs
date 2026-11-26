using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class PushSuscripcionDto
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
}