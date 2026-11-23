using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class RolesController : ControllerBase
	{
		private readonly AppDBContext _context;

		public RolesController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/Roles  -> [{ idRol, nombre }]
		// El frontend necesita los Id porque PostPersonal recibe RolId, no el nombre.
		[Authorize]
		[HttpGet]
		public async Task<IActionResult> GetRoles()
		{
			var roles = await _context.Roles
				.Select(r => new { r.IdRol, r.Nombre })
				.ToListAsync();

			return Ok(roles);
		}
	}
}