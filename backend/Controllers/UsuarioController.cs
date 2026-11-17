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

        private const string Admin = "ADMIN";
        private const string Ciudadano = "CIUDADANO";
        private const string AdminPolicia = "ADMIN_POLICIA";
        private const string AdminTransito = "ADMIN_TRANSITO";
        private const string Policia = "POLICIA";
        private const string AgenteTransito = "AGENTE_TRANSITO";
        private const string CentralPolicia = "CENTRAL_POLICIA";
        private const string CentralTransito = "CENTRAL_TRANSITO";

        private const string Activo = "ACTIVO";
        private const string Inactivo = "INACTIVO";

        private static readonly Dictionary<string, string[]> Permitidos = new()
        {
            [Admin] = new[] { Admin, AdminPolicia, AdminTransito },
            [AdminPolicia] = new[] { Policia, CentralPolicia },
            [AdminTransito] = new[] { AgenteTransito, CentralTransito }
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
                    RolNombre = u.Rol != null ? u.Rol.Nombre : null,
                    Estado = u.Estado
                })
                .ToListAsync();
        }

		// GET: api/Usuarios/vecinos  (ciudadanos activos del mismo barrio, sin contar al propio usuario)
		[HttpGet("vecinos")]
		[Authorize]
		public async Task<IActionResult> GetVecinos()
		{
			var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);
			if (!int.TryParse(idTexto, out var idUsuario)) return Unauthorized();

			var barrioId = await _context.Usuarios
				.Where(u => u.IdUsuario == idUsuario)
				.Select(u => u.BarrioId)
				.FirstOrDefaultAsync();

			if (barrioId == null) return Ok(new List<object>());

			var vecinos = await _context.Usuarios
				.AsNoTracking()
				.Where(u => u.BarrioId == barrioId
					&& u.IdUsuario != idUsuario
					&& u.Rol.Nombre == "Ciudadano"
					&& u.Estado.ToLower() == "activo")
				.OrderBy(u => u.PrimerNombre)
				.Select(u => new
				{
					u.IdUsuario,
					Nombre = u.PrimerNombre + " " + u.PrimerApellido,
					BarrioNombre = u.Barrio.Nombre
				})
				.ToListAsync();

			return Ok(vecinos);
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
                    RolNombre = u.Rol != null ? u.Rol.Nombre : null,
                    BarrioNombre = u.Barrio != null ? u.Barrio.Nombre : null
                })
                .FirstOrDefaultAsync();

            if (usuario == null) return NotFound();
            return usuario;
        }

        // POST: api/Usuarios  (registro público: siempre CIUDADANO)
        [HttpPost]
        public async Task<ActionResult<UsuarioDTO>> PostUsuario(UsuarioCreateDTO dto)
        {
            var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == Ciudadano);
            if (rol == null)
                return StatusCode(500, "No existe el rol CIUDADANO en la base de datos.");

            return await CrearUsuario(dto, rol);
        }

        // POST: api/Usuarios/personal
        [Authorize]
        [HttpPost("personal")]
        public async Task<ActionResult<UsuarioDTO>> PostPersonal(UsuarioPersonalCreateDTO dto)
        {
            var rolCreador = User.FindFirst(ClaimTypes.Role)?.Value;
            if (rolCreador == null) return Unauthorized();

            var rolNuevo = await _context.Roles.FindAsync(dto.RolId);
            if (rolNuevo == null)
                return BadRequest("El rol indicado no existe.");

            if (!Permitidos.TryGetValue(rolCreador, out var rolesPermitidos)
                || !rolesPermitidos.Contains(rolNuevo.Nombre))
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    $"Un usuario con rol {rolCreador} no puede crear usuarios con rol {rolNuevo.Nombre}.");
            }

            return await CrearUsuario(dto, rolNuevo);
        }

        private async Task<ActionResult<UsuarioDTO>> CrearUsuario(UsuarioCreateDTO dto, Rol rol)
        {
            var duplicado = await _context.Usuarios.AnyAsync(u =>
                u.Cedula == dto.Cedula || u.Correo == dto.Correo || u.Username == dto.Username);
            if (duplicado)
                return Conflict("Ya existe un usuario con esa cédula, correo o username.");

            if (dto.BarrioId != null && !await _context.Barrios.AnyAsync(b => b.IdBarrio == dto.BarrioId))
                return BadRequest("El barrio indicado no existe.");

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
                Estado = Activo
            };

            usuario.PasswordHash = new PasswordHasher<Usuario>().HashPassword(usuario, dto.Password);

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var creado = await GetUsuario(usuario.IdUsuario);
            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.IdUsuario }, creado.Value);
        }

        // PUT: api/Usuarios/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, UsuarioUpdateDTO dto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();

            var rol = User.FindFirst(ClaimTypes.Role)?.Value;
            var idActual = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (rol != Admin && idActual != id.ToString())
                return Forbid();

            var duplicado = await _context.Usuarios.AnyAsync(u => u.IdUsuario != id &&
                (u.Cedula == dto.Cedula || u.Correo == dto.Correo || u.Username == dto.Username));
            if (duplicado)
                return Conflict("Ya existe un usuario con esa cédula, correo o username.");

            if (dto.BarrioId != null && !await _context.Barrios.AnyAsync(b => b.IdBarrio == dto.BarrioId))
                return BadRequest("El barrio indicado no existe.");

            usuario.Cedula = dto.Cedula;
            usuario.PrimerNombre = dto.PrimerNombre;
            usuario.SegundoNombre = dto.SegundoNombre;
            usuario.PrimerApellido = dto.PrimerApellido;
            usuario.SegundoApellido = dto.SegundoApellido;
            usuario.Correo = dto.Correo;
            usuario.Telefono = dto.Telefono;
            usuario.Username = dto.Username;
            usuario.Calle = dto.Calle;
            usuario.Carrera = dto.Carrera;
            usuario.Etapa = dto.Etapa;
            usuario.Manzana = dto.Manzana;
            usuario.Casa = dto.Casa;
            usuario.BarrioId = dto.BarrioId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

		// PUT: api/usuarios/5/password  (solo el dueño de la cuenta)
		[HttpPut("{id}/password")]
		[Authorize]
		public async Task<IActionResult> CambiarPassword(int id, CambiarPasswordDTO dto)
		{
			// Cada usuario solo cambia SU contraseña
			var idToken = User.FindFirstValue(ClaimTypes.NameIdentifier);
			if (idToken != id.ToString()) return Forbid();

			if (string.IsNullOrWhiteSpace(dto.PasswordActual))
				return BadRequest("Escribe tu contraseña actual.");

			if (string.IsNullOrWhiteSpace(dto.PasswordNueva) || dto.PasswordNueva.Length < 8)
				return BadRequest("La nueva contraseña debe tener al menos 8 caracteres.");

			var usuario = await _context.Usuarios.FindAsync(id);
			if (usuario == null) return NotFound();

			var hasher = new PasswordHasher<Usuario>();

			PasswordVerificationResult resultado;
			try
			{
				resultado = hasher.VerifyHashedPassword(usuario, usuario.PasswordHash, dto.PasswordActual);
			}
			catch (FormatException)
			{
				// Hash inválido (usuario creado a mano)
				return BadRequest("La contraseña actual es incorrecta.");
			}

			if (resultado == PasswordVerificationResult.Failed)
				return BadRequest("La contraseña actual es incorrecta.");

			usuario.PasswordHash = hasher.HashPassword(usuario, dto.PasswordNueva);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		// DELETE: api/Usuarios/5  (desactiva, no borra)
		[Authorize(Roles = Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();

            if (User.FindFirst(ClaimTypes.NameIdentifier)?.Value == id.ToString())
                return BadRequest("No puedes desactivar tu propia cuenta.");

            usuario.Estado = Inactivo;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ===== TEMPORAL: úsalo una vez desde Swagger y BÓRRALO =====
        [HttpPost("TEMP-reset-passwords")]
        public async Task<IActionResult> TempResetPasswords()
        {
            var hasher = new PasswordHasher<Usuario>();
            var todos = await _context.Usuarios.Where(u => u.PasswordHash == null).ToListAsync();
            foreach (var u in todos)
                u.PasswordHash = hasher.HashPassword(u, "ClaveTemporal123*");
            await _context.SaveChangesAsync();
            return Ok($"{todos.Count} usuarios actualizados");
        }
    }
}