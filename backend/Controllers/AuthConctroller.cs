using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly AppDBContext _context;
		private readonly IConfiguration _config;

		public AuthController(AppDBContext context, IConfiguration config)
		{
			_context = context;
			_config = config;
		}

		// POST: api/Auth/login
		[HttpPost("login")]
		public async Task<IActionResult> Login(LoginDTO dto)
		{
			// 1. Buscar al usuario por su username
			var usuario = await _context.Usuarios
				.Include(u => u.Rol)
				.FirstOrDefaultAsync(u => u.Username == dto.Username);

			// Mismo mensaje si falla el usuario o la clave, para no dar pistas
			if (usuario == null)
			{
				return Unauthorized("Usuario o contraseña incorrectos.");
			}

			// 2. Comparar la contraseña escrita con el hash guardado
			PasswordVerificationResult resultado;
			try
			{
				resultado = new PasswordHasher<Usuario>()
					.VerifyHashedPassword(usuario, usuario.PasswordHash, dto.Password);
			}
			catch (FormatException)
			{
				// El hash guardado no es válido (por ejemplo, un usuario creado a mano)
				return Unauthorized("Usuario o contraseña incorrectos.");
			}

			if (resultado == PasswordVerificationResult.Failed)
			{
				return Unauthorized("Usuario o contraseña incorrectos.");
			}

			// 3. La cuenta tiene que estar activa
			if (!string.Equals(usuario.Estado, "activo", StringComparison.OrdinalIgnoreCase))
			{
				return StatusCode(StatusCodes.Status403Forbidden, "La cuenta no está activa.");
			}

			// 4. Login correcto: devolver el token y los datos básicos
			return Ok(new
			{
				token = CrearToken(usuario),
				usuario.IdUsuario,
				usuario.Username,
				Rol = usuario.Rol.Nombre
			});
		}

		// El token lleva dentro el Id, el username y el rol de quien inició sesión
		private string CrearToken(Usuario usuario)
		{
			var descriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(new[]
				{
					new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
					new Claim(ClaimTypes.Name, usuario.Username),
					new Claim(ClaimTypes.Role, usuario.Rol.Nombre)
				}),
				Expires = DateTime.UtcNow.AddHours(8),
				Issuer = _config["Jwt:Issuer"],
				Audience = _config["Jwt:Audience"],
				SigningCredentials = new SigningCredentials(
					new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)),
					SecurityAlgorithms.HmacSha256)
			};

			return new JsonWebTokenHandler().CreateToken(descriptor);
		}
	}
}