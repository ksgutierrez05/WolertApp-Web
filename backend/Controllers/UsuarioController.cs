using backend.Data;
using backend.DTOs;
using backend.Models;
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

		// POST: api/Usuarios
		[HttpPost]
		public async Task<ActionResult<UsuarioDTO>> PostUsuario(UsuarioCreateDTO dto)
		{
			// 1. No permitir cédula, correo o username repetidos
			var duplicado = await _context.Usuarios.AnyAsync(u =>
				u.Cedula == dto.Cedula || u.Correo == dto.Correo || u.Username == dto.Username);
			if (duplicado)
			{
				return Conflict("Ya existe un usuario con esa cédula, correo o username.");
			}

			// 2. Si mandan un barrio, que exista
			if (dto.BarrioId != null && !await _context.Barrios.AnyAsync(b => b.IdBarrio == dto.BarrioId))
			{
				return BadRequest("El barrio indicado no existe.");
			}

			// 3. Todo usuario que se registra solo entra como Ciudadano
			var rol = await _context.Roles.FirstAsync(r => r.Nombre == "Ciudadano");

			// 4. Armar el usuario (el DTO no trae rol, estado ni fecha: los pone el servidor)
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
				RolId = rol.IdRol
			};

			// 5. Convertir la contraseña en hash (nunca se guarda en texto)
			usuario.PasswordHash = new PasswordHasher<Usuario>().HashPassword(usuario, dto.Password);

			_context.Usuarios.Add(usuario);
			await _context.SaveChangesAsync();

			// 6. Responder 201 con el usuario creado (sin contraseña)
			var creado = await GetUsuario(usuario.IdUsuario);
			return CreatedAtAction(nameof(GetUsuario), new { id = usuario.IdUsuario }, creado.Value);
		}
	}
}