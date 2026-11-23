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
                IdUsuario = p.IdUsuario,
                NombreUsuario = ((p.Usuario!.PrimerNombre ?? "") + " " + (p.Usuario.PrimerApellido ?? "")).Trim(),
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

        // GET: api/Policias/5  (el id es el ID_USUARIO)
        [HttpGet("{id}")]
        public async Task<ActionResult<PoliciaDTO>> GetPolicia(int id)
        {
            var policia = await _context.Policias.Where(p => p.IdUsuario == id)
                .Select(p => new PoliciaDTO
                {
                    IdUsuario = p.IdUsuario,
                    NombreUsuario = ((p.Usuario!.PrimerNombre ?? "") + " " + (p.Usuario.PrimerApellido ?? "")).Trim(),
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
            // El usuario ya debe existir y tener el rol POLICIA
            var usuario = await _context.Usuarios.Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUsuario == policiaCreate.IdUsuario);
            if (usuario == null)
            {
                return BadRequest("El usuario no existe");
            }

            if (usuario.Rol?.Nombre != "POLICIA")
            {
                return BadRequest("El usuario no tiene el rol POLICIA");
            }

            // La PK de POLICIAS es ID_USUARIO, así que un usuario solo puede ser policía una vez
            if (await _context.Policias.AnyAsync(p => p.IdUsuario == policiaCreate.IdUsuario))
            {
                return Conflict("Ese usuario ya está registrado como policía");
            }

            var placa = policiaCreate.Placa.Trim().ToUpper();
            var rango = policiaCreate.Rango?.Trim().ToUpper();
            var estado = policiaCreate.Estado.Trim().ToUpper();

            if (await _context.Policias.AnyAsync(p => p.Placa == placa))
            {
                return Conflict("Ya existe un policía con esa placa");
            }

            Unidad? unidad = null;
            if (policiaCreate.IdUnidad != null)
            {
                unidad = await _context.Unidades.FindAsync(policiaCreate.IdUnidad.Value);
                if (unidad == null)
                {
                    return BadRequest("La unidad no existe");
                }
            }

            // El ID no se genera: es el mismo ID_USUARIO
            var policia = new Policia
            {
                IdUsuario = policiaCreate.IdUsuario,
                Placa = placa,
                Rango = rango,
                Estado = estado,
                IdUnidad = policiaCreate.IdUnidad
            };
            _context.Policias.Add(policia);
            await _context.SaveChangesAsync();

            var respuesta = new PoliciaListaDTO
            {
                IdUsuario = policia.IdUsuario,
                NombreUsuario = ((usuario.PrimerNombre ?? "") + " " + (usuario.PrimerApellido ?? "")).Trim(),
                Cedula = usuario.Cedula,
                Correo = usuario.Correo,
                Telefono = usuario.Telefono,
                Placa = policia.Placa,
                Rango = policia.Rango,
                Estado = policia.Estado,
                IdUnidad = policia.IdUnidad,
                NombreUnidad = unidad?.Nombre
            };

            return CreatedAtAction("GetPolicia", new { id = policia.IdUsuario }, respuesta);
        }

        // PUT: api/Policias/5  (el id es el ID_USUARIO)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPolicia(int id, PoliciaUpdateDTO policiaUpdate)
        {
            var policia = await _context.Policias.FindAsync(id);
            if (policia == null)
            {
                return NotFound();
            }

            var placa = policiaUpdate.Placa.Trim().ToUpper();

            if (await _context.Policias.AnyAsync(p => p.Placa == placa && p.IdUsuario != id))
            {
                return Conflict("Ya existe otro policía con esa placa");
            }

            if (policiaUpdate.IdUnidad != null &&
                !await _context.Unidades.AnyAsync(u => u.IdUnidad == policiaUpdate.IdUnidad))
            {
                return BadRequest("La unidad no existe");
            }

            policia.Placa = placa;
            policia.Rango = policiaUpdate.Rango?.Trim().ToUpper();
            policia.Estado = policiaUpdate.Estado.Trim().ToUpper();
            policia.IdUnidad = policiaUpdate.IdUnidad;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Policias/5  (el id es el ID_USUARIO)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePolicia(int id)
        {
            var policia = await _context.Policias.FindAsync(id);
            if (policia == null)
            {
                return NotFound();
            }

            // Solo borra el registro de policía; el usuario sigue existiendo
            try
            {
                _context.Policias.Remove(policia);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // ORA-02292: tiene asignaciones, atenciones u otros registros que lo referencian
                return Conflict("No se puede eliminar: el policía tiene registros asociados");
            }

            return NoContent();
        }
    }
}