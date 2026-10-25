using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

		// Jerarquía: quién (rol) puede crear a quiénes (roles)
		private static readonly Dictionary<string, string[]> Permitidos = new()
		{
			["Admin"] = new[] { "Admin", "AdminPolicia", "DirectorTransito" },
			["AdminPolicia"] = new[] { "Policia", "CentralPolicia" },
			["DirectorTransito"] = new[] { "AgenteTransito", "CentralTransito" }
		};

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

		// GET: api/Usuarios/5
		[HttpGet("{id}")]
		public async Task<ActionResult<UsuarioDTO>> GetUsuario(int id)
		{
			var usuario = await _context.Usuarios
				.Where(u => u.IdUsuario == id)
				.Select(u => new UsuarioDTO
				{
					IdUsuario = u.IdUsuario,
					Cedula = u.Cedula,
					PrimerNombre = u.PrimerNombre,
					SegundoNombre = u.SegundoNombre,
					PrimerApellido = u.PrimerApellido,
					SegundoApellido = u.SegundoApellido,
					Correo = u.Correo,
					Telefono = u.Telefono,
					Username = u.Username,
					Calle = u.Calle,
					Carrera = u.Carrera,
					Etapa = u.Etapa,
					Manzana = u.Manzana,
					Casa = u.Casa,
					Estado = u.Estado,
					FechaCreacion = u.FechaCreacion,
					RolNombre = u.Rol.Nombre,
					BarrioNombre = u.Barrio != null ? u.Barrio.Nombre : null
				})
				.FirstOrDefaultAsync();

			if (usuario == null)
			{
				return NotFound();
			}

			return usuario;
		}

		// POST: api/Usuarios  (registro público: siempre Ciudadano)
		[HttpPost]
		public async Task<ActionResult<UsuarioDTO>> PostUsuario(UsuarioCreateDTO dto)
		{
			var rol = await _context.Roles.FirstAsync(r => r.Nombre == "Ciudadano");
			return await CrearUsuario(dto, rol, null);
		}

		// POST: api/Usuarios/personal  (solo con sesión iniciada y según la jerarquía)
		[Authorize]
		[HttpPost("personal")]
		public async Task<ActionResult<UsuarioDTO>> PostPersonal(UsuarioPersonalCreateDTO dto)
		{
			// Quién está haciendo la petición (sale del token)
			var rolCreador = User.FindFirst(ClaimTypes.Role)?.Value;
			var idCreadorTexto = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			if (rolCreador == null || !int.TryParse(idCreadorTexto, out var idCreador))
			{
				return Unauthorized();
			}

			// ¿Qué rol quiere crear?
			var rolNuevo = await _context.Roles.FindAsync(dto.RolId);
			if (rolNuevo == null)
			{
				return BadRequest("El rol indicado no existe.");
			}

			// ¿Su rol tiene permiso para crear ese rol?
			if (!Permitidos.TryGetValue(rolCreador, out var rolesPermitidos)
				|| !rolesPermitidos.Contains(rolNuevo.Nombre))
			{
				return StatusCode(StatusCodes.Status403Forbidden,
					$"Un usuario con rol {rolCreador} no puede crear usuarios con rol {rolNuevo.Nombre}.");
			}

			return await CrearUsuario(dto, rolNuevo, idCreador);
		}

		// Lógica común para crear un usuario (registro público y personal)
		private async Task<ActionResult<UsuarioDTO>> CrearUsuario(UsuarioCreateDTO dto, Rol rol, int? creadoPorId)
		{
			var duplicado = await _context.Usuarios.AnyAsync(u =>
				u.Cedula == dto.Cedula || u.Correo == dto.Correo || u.Username == dto.Username);
			if (duplicado)
			{
				return Conflict("Ya existe un usuario con esa cédula, correo o username.");
			}

			if (dto.BarrioId != null && !await _context.Barrios.AnyAsync(b => b.IdBarrio == dto.BarrioId))
			{
				return BadRequest("El barrio indicado no existe.");
			}

			var usuario = new Usuario
			{
				Cedula = dto.Cedula,
				PrimerNombre = dto.PrimerNombre,
				SegundoNombre = dto.SegundoNombre,
				PrimerApellido = dto.PrimerApellido,
				SegundoApellido = dto.SegundoApellido,
				Correo = dto.Correo,
				Telefono = dto.Telefono,
				Username = dto.Username,
				Calle = dto.Calle,
				Carrera = dto.Carrera,
				Etapa = dto.Etapa,
				Manzana = dto.Manzana,
				Casa = dto.Casa,
				BarrioId = dto.BarrioId,
				RolId = rol.IdRol,
				CreadoPorId = creadoPorId
			};

			usuario.PasswordHash = new PasswordHasher<Usuario>().HashPassword(usuario, dto.Password);

			_context.Usuarios.Add(usuario);
			await _context.SaveChangesAsync();

			var creado = await GetUsuario(usuario.IdUsuario);
			return CreatedAtAction(nameof(GetUsuario), new { id = usuario.IdUsuario }, creado.Value);
		}
	}
}