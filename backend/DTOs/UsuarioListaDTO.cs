namespace backend.DTOs
{
	public class UsuarioListaDTO
	{
		public int IdUsuario { get; set; }
		public string NombreCompleto { get; set; } = null!;
		public string Correo { get; set; } = null!;
		public string Username { get; set; } = null!;
		public string RolNombre { get; set; } = null!;
		public string Estado { get; set; } = null!;
	}
}