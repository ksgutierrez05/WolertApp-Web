using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class LoginDTO
    {
        [Required, StringLength(15)]
        public string Username { get; set; } = null!;

        [Required, StringLength(100)]
        public string Password { get; set; } = null!;
    }
}