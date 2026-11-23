using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CambiarPasswordDTO
    {
        [Required, StringLength(100)]
        public string PasswordActual { get; set; } = null!;

        [Required, StringLength(100)]
        public string PasswordNueva { get; set; } = null!;
    }
}