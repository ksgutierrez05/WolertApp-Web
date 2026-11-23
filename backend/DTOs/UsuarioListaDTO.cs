namespace backend.DTOs
{
    public class UsuarioListaDTO
    {
        public int IdUsuario { get; set; }
        public string? NombreCompleto { get; set; }
        public string? Correo { get; set; }
        public string? Username { get; set; }
        public string? RolNombre { get; set; }
        public string? Estado { get; set; }
    }
}