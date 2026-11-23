using Google.Apis.Auth;
using System.Security.Claims;
using System.Security.Cryptography;
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
           
            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (usuario == null
                || string.IsNullOrEmpty(usuario.PasswordHash)
                || string.IsNullOrEmpty(usuario.Username)
                || string.IsNullOrEmpty(usuario.Rol?.Nombre))
            {
                return Unauthorized("Usuario o contraseña incorrectos.");
            }

            
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

           
            if (usuario.Estado != "ACTIVO")
            {
                return StatusCode(StatusCodes.Status403Forbidden, "La cuenta no está activa.");
            }

            
            return Ok(new
            {
                token = CrearToken(usuario),
                usuario.IdUsuario,
                usuario.Username,
                Rol = usuario.Rol.Nombre
            });
        }

		// POST: api/Auth/google
		[HttpPost("google")]
		public async Task<IActionResult> LoginGoogle(GoogleLoginDTO dto)
		{
			GoogleJsonWebSignature.Payload payload;
			try
			{
				// Verifica firma, vencimiento y que el token fue emitido para TU Client ID
				payload = await GoogleJsonWebSignature.ValidateAsync(
					dto.Credential,
					new GoogleJsonWebSignature.ValidationSettings
					{
						Audience = new[] { _config["Google:ClientId"]! }
					});
			}
			catch (InvalidJwtException)
			{
				return Unauthorized("Token de Google inválido.");
			}

			if (!payload.EmailVerified)
			{
				return Unauthorized("El correo de Google no está verificado.");
			}

			// Solo entra quien ya está registrado con ese mismo correo
			var usuario = await _context.Usuarios
				.Include(u => u.Rol)
				.FirstOrDefaultAsync(u => u.Correo == payload.Email);

			if (usuario == null
				|| string.IsNullOrEmpty(usuario.Username)
				|| string.IsNullOrEmpty(usuario.Rol?.Nombre))
			{
				return Unauthorized("No hay una cuenta registrada con este correo. Regístrate primero.");
			}

			if (usuario.Estado != "ACTIVO")
			{
				return StatusCode(StatusCodes.Status403Forbidden, "La cuenta no está activa.");
			}

			return Ok(new
			{
				token = CrearToken(usuario),
				usuario.IdUsuario,
				usuario.Username,
				Rol = usuario.Rol.Nombre
			});
		}

		// POST: api/Auth/google/register
		// Completa el registro en una sola petición con la credencial de Google y los datos faltantes.
		[HttpPost("google/register")]
		public async Task<IActionResult> RegisterGoogle(GoogleRegisterDTO dto)
		{
			GoogleJsonWebSignature.Payload payload;
			try
			{
				payload = await GoogleJsonWebSignature.ValidateAsync(
					dto.Credential,
					new GoogleJsonWebSignature.ValidationSettings
					{
						Audience = new[] { _config["Google:ClientId"]! }
					});
			}
			catch (InvalidJwtException)
			{
				return Unauthorized("Token de Google inválido.");
			}

			if (!payload.EmailVerified)
				return Unauthorized("El correo de Google no está verificado.");

			var email = payload.Email.Trim().ToLowerInvariant();
			if (await _context.Usuarios.AnyAsync(u => u.Correo != null && u.Correo.ToLower() == email))
				return Conflict("Ya existe una cuenta con este correo. Inicia sesión con Google.");

			var username = dto.Username.Trim();
			if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(dto.Cedula))
				return BadRequest("La cédula y el username son obligatorios.");

			if (await _context.Usuarios.AnyAsync(u => u.Cedula == dto.Cedula || u.Username == username))
				return Conflict("Ya existe un usuario con esa cédula o username.");

			if (dto.BarrioId != null && !await _context.Barrios.AnyAsync(b => b.IdBarrio == dto.BarrioId))
				return BadRequest("El barrio indicado no existe.");

			var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "CIUDADANO");
			if (rol == null)
				return StatusCode(StatusCodes.Status500InternalServerError,
					"No existe el rol CIUDADANO en la base de datos.");

			var nombres = (payload.GivenName ?? payload.Name ?? "").Trim().Split(' ', 2,
				StringSplitOptions.RemoveEmptyEntries);
			var apellidos = (payload.FamilyName ?? "").Trim().Split(' ', 2,
				StringSplitOptions.RemoveEmptyEntries);
			if (nombres.Length == 0)
				return BadRequest("Google no proporcionó un nombre válido para el registro.");

			var usuario = new Usuario
			{
				Cedula = dto.Cedula.Trim(),
				PrimerNombre = nombres[0],
				SegundoNombre = nombres.Length > 1 ? nombres[1] : null,
				PrimerApellido = apellidos.Length > 0 ? apellidos[0] : "",
				SegundoApellido = apellidos.Length > 1 ? apellidos[1] : null,
				Correo = email,
				Telefono = dto.Telefono?.Trim(),
				Username = username,
				BarrioId = dto.BarrioId,
				RolId = rol.IdRol,
				Estado = "ACTIVO"
			};

			// La cuenta se autentica con Google; esta clave aleatoria no se entrega ni se usa en el flujo OAuth.
			usuario.PasswordHash = new PasswordHasher<Usuario>().HashPassword(
				usuario, Convert.ToBase64String(RandomNumberGenerator.GetBytes(48)));

			_context.Usuarios.Add(usuario);
			await _context.SaveChangesAsync();
			usuario.Rol = rol;

			return Ok(new
			{
				token = CrearToken(usuario),
				usuario.IdUsuario,
				usuario.Username,
				Rol = rol.Nombre
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
                    new Claim(ClaimTypes.Name, usuario.Username!),
                    new Claim(ClaimTypes.Role, usuario.Rol!.Nombre)
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
