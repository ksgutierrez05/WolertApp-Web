using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class UsuariosController : ControllerBase
	{
		private readonly AppDBContext _context;

		public UsuariosController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/Usuarios
		[HttpGet]
		public async Task<ActionResult<IEnumerable<UsuarioListaDTO>>> GetUsuarios()
		{
			return await _context.Usuarios
				.Select(u => new UsuarioListaDTO
				{
					IdUsuario = u.IdUsuario,
					NombreCompleto = u.PrimerNombre + " " + u.PrimerApellido,
					Correo = u.Correo,
					Username = u.Username,
					RolNombre = u.Rol.Nombre,
					Estado = u.Estado
				})
				.ToListAsync();
		}
	}
}