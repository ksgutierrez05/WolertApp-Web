using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PoliciasController : ControllerBase
    {
        private readonly AppDBContext _context;

        public PoliciasController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/Policias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PoliciaListaDTO>>> GetPolicias()
        {
            return await _context.Policias.Select(p => new PoliciaListaDTO
            {
                IdPolicia = p.IdPolicia,
                IdUsuario = p.IdUsuario,
                NombreUsuario = p.Usuario!.PrimerNombre + " " + p.Usuario.PrimerApellido,
                Cedula = p.Usuario.Cedula,
                Correo = p.Usuario.Correo,
                Telefono = p.Usuario.Telefono,
                Placa = p.Placa,
                Rango = p.Rango,
                Estado = p.Estado,
                IdUnidad = p.IdUnidad,
                NombreUnidad = p.Unidad != null ? p.Unidad.Nombre : null
            }).ToListAsync();
        }

        // GET: api/Policias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PoliciaDTO>> GetPolicia(int id)
        {
            var policia = await _context.Policias.Where(p => p.IdPolicia == id)
                .Select(p => new PoliciaDTO
                {
                    IdPolicia = p.IdPolicia,
                    IdUsuario = p.IdUsuario,
                    NombreUsuario = p.Usuario!.PrimerNombre + " " + p.Usuario.PrimerApellido,
                    PrimerNombre = p.Usuario.PrimerNombre,
                    SegundoNombre = p.Usuario.SegundoNombre,
                    PrimerApellido = p.Usuario.PrimerApellido,
                    SegundoApellido = p.Usuario.SegundoApellido,
                    Cedula = p.Usuario.Cedula,
                    Correo = p.Usuario.Correo,
                    Telefono = p.Usuario.Telefono,
                    Username = p.Usuario.Username,
                    Calle = p.Usuario.Calle,
                    Carrera = p.Usuario.Carrera,
                    Etapa = p.Usuario.Etapa,
                    Manzana = p.Usuario.Manzana,
                    Casa = p.Usuario.Casa,
                    BarrioNombre = p.Usuario.Barrio != null ? p.Usuario.Barrio.Nombre : null,
                    EstadoUsuario = p.Usuario.Estado,
                    FechaCreacion = p.Usuario.FechaCreacion,
                    Placa = p.Placa,
                    Rango = p.Rango,
                    Estado = p.Estado,
                    IdUnidad = p.IdUnidad,
                    NombreUnidad = p.Unidad != null ? p.Unidad.Nombre : null,
                    EstadoUnidad = p.Unidad != null ? p.Unidad.Estado : null
                }).FirstOrDefaultAsync();

            if (policia == null)
            {
                return NotFound();
            }

            return policia;
        }

        // POST: api/Policias
        [HttpPost]
        public async Task<ActionResult<PoliciaListaDTO>> PostPolicia(PoliciaCreateDTO policiaCreate)
        {
            // El usuario ya debe existir y tener el rol Policia
            var usuario = await _context.Usuarios.Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUsuario == policiaCreate.IdUsuario);
            if (usuario == null)
            {
                return BadRequest("El usuario no existe");
            }

            if (usuario.Rol == null || usuario.Rol.Nombre != "Policia")
            {
                return BadRequest("El usuario no tiene el rol Policia");
            }

            if (await _context.Policias.AnyAsync(p => p.IdUsuario == policiaCreate.IdUsuario))
            {
                return BadRequest("Ese usuario ya está registrado como policía");
            }

            if (await _context.Policias.AnyAsync(p => p.Placa == policiaCreate.Placa))
            {
                return BadRequest("Ya existe un policía con esa placa");
            }

            Unidad? unidad = null;
            if (policiaCreate.IdUnidad != null)
            {
                unidad = await _context.Unidades.FindAsync(policiaCreate.IdUnidad);
                if (unidad == null)
                {
                    return BadRequest("La unidad no existe");
                }
            }

            var policia = new Policia
            {
                IdUsuario = policiaCreate.IdUsuario,
                Placa = policiaCreate.Placa,
                Rango = policiaCreate.Rango,
                Estado = policiaCreate.Estado,
                IdUnidad = policiaCreate.IdUnidad
            };
            _context.Policias.Add(policia);
            await _context.SaveChangesAsync();

            var respuesta = new PoliciaListaDTO
            {
                IdPolicia = policia.IdPolicia,
                IdUsuario = policia.IdUsuario,
                NombreUsuario = usuario.PrimerNombre + " " + usuario.PrimerApellido,
                Cedula = usuario.Cedula,
                Correo = usuario.Correo,
                Telefono = usuario.Telefono,
                Placa = policia.Placa,
                Rango = policia.Rango,
                Estado = policia.Estado,
                IdUnidad = policia.IdUnidad,
                NombreUnidad = unidad?.Nombre
            };

            return CreatedAtAction("GetPolicia", new { id = policia.IdPolicia }, respuesta);
        }

        // PUT: api/Policias/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPolicia(int id, PoliciaUpdateDTO policiaUpdate)
        {
            var policia = await _context.Policias.FindAsync(id);
            if (policia == null)
            {
                return NotFound();
            }

            if (await _context.Policias.AnyAsync(p => p.Placa == policiaUpdate.Placa && p.IdPolicia != id))
            {
                return BadRequest("Ya existe otro policía con esa placa");
            }

            if (policiaUpdate.IdUnidad != null &&
                !await _context.Unidades.AnyAsync(u => u.IdUnidad == policiaUpdate.IdUnidad))
            {
                return BadRequest("La unidad no existe");
            }

            policia.Placa = policiaUpdate.Placa;
            policia.Rango = policiaUpdate.Rango;
            policia.Estado = policiaUpdate.Estado;
            policia.IdUnidad = policiaUpdate.IdUnidad;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Policias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePolicia(int id)
        {
            var policia = await _context.Policias.FindAsync(id);
            if (policia == null)
            {
                return NotFound();
            }

            // Solo borra el registro de policía; el usuario sigue existiendo
            _context.Policias.Remove(policia);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}