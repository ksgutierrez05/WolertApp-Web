using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class UnidadesController : ControllerBase
    {
        private readonly AppDBContext _context;

        public UnidadesController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/Unidades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UnidadListaDTO>>> GetUnidades()
        {
            return await _context.Unidades.Select(u => new UnidadListaDTO
            {
                IdUnidad = u.IdUnidad,
                Nombre = u.Nombre,
                Estado = u.Estado,
                Latitud = u.Latitud,
                Longitud = u.Longitud,
                NombreBarrio = u.Barrio != null ? u.Barrio.Nombre : null,
                TotalPolicias = u.Policias.Count()
            }).ToListAsync();
        }

        // GET: api/Unidades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UnidadDTO>> GetUnidad(int id)
        {
            var unidad = await _context.Unidades.Where(u => u.IdUnidad == id)
                .Select(u => new UnidadDTO
                {
                    IdUnidad = u.IdUnidad,
                    Nombre = u.Nombre,
                    Estado = u.Estado,
                    Latitud = u.Latitud,
                    Longitud = u.Longitud,
                    IdBarrio = u.idBarrio,
                    NombreBarrio = u.Barrio != null ? u.Barrio.Nombre : null,
                    Policias = u.Policias.Select(p => new PoliciaListaDTO
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
                        NombreUnidad = u.Nombre
                    }).ToList()
                }).FirstOrDefaultAsync();

            if (unidad == null)
            {
                return NotFound();
            }

            return unidad;
        }

        // POST: api/Unidades
        [HttpPost]
        public async Task<ActionResult<UnidadListaDTO>> PostUnidad(UnidadCreateDTO unidadCreate)
        {
            var barrio = await _context.Barrios.FindAsync(unidadCreate.IdBarrio);
            if (barrio == null)
            {
                return BadRequest("El barrio no existe");
            }

            if (await _context.Unidades.AnyAsync(u => u.Nombre == unidadCreate.Nombre))
            {
                return BadRequest("Ya existe una unidad con ese nombre");
            }

            var unidad = new Unidad
            {
                Nombre = unidadCreate.Nombre,
                Estado = "OPERATIVA",
                Latitud = (int)unidadCreate.Latitud,
                Longitud = (int)unidadCreate.Longitud,
                idBarrio = unidadCreate.IdBarrio
            };
            _context.Unidades.Add(unidad);
            await _context.SaveChangesAsync();

            var respuesta = new UnidadListaDTO
            {
                IdUnidad = unidad.IdUnidad,
                Nombre = unidad.Nombre,
                Estado = unidad.Estado,
                Latitud = unidad.Latitud,
                Longitud = unidad.Longitud,
                NombreBarrio = barrio.Nombre,
                TotalPolicias = 0
            };

            return CreatedAtAction("GetUnidad", new { id = unidad.IdUnidad }, respuesta);
        }

        // PUT: api/Unidades/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUnidad(int id, UnidadUpdateDTO unidadUpdate)
        {
            var unidad = await _context.Unidades.FindAsync(id);
            if (unidad == null)
            {
                return NotFound();
            }

            if (!await _context.Barrios.AnyAsync(b => b.IdBarrio == unidadUpdate.IdBarrio))
            {
                return BadRequest("El barrio no existe");
            }

            if (await _context.Unidades.AnyAsync(u => u.Nombre == unidadUpdate.Nombre && u.IdUnidad != id))
            {
                return BadRequest("Ya existe otra unidad con ese nombre");
            }

            unidad.Nombre = unidadUpdate.Nombre;
            unidad.Estado = unidadUpdate.Estado;
            unidad.Latitud = (int)unidadUpdate.Latitud;
            unidad.Longitud = (int)unidadUpdate.Longitud;
            unidad.idBarrio = unidadUpdate.IdBarrio;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Unidades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUnidad(int id)
        {
            var unidad = await _context.Unidades.FindAsync(id);
            if (unidad == null)
            {
                return NotFound();
            }

            var totalPolicias = await _context.Policias.CountAsync(p => p.IdUnidad == id);
            if (totalPolicias > 0)
            {
                return BadRequest("No se puede eliminar: la unidad tiene " + totalPolicias + " policía(s) asignado(s)");
            }

            _context.Unidades.Remove(unidad);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}