using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using backend.DTOs;

[Route("api/[controller]")]
[ApiController]
public class UnidadTransitoesController : ControllerBase
{
    private readonly AppDBContext _context;
    public UnidadTransitoesController(AppDBContext context)
    {
        _context = context;
    }

    // GET: api/UnidadTransito
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UnidadTransitoListaDTO>>> GetUnidadesTransito()
    {
        return await _context.UnidadesTransito.Select(u => new UnidadTransitoListaDTO
        {
            IdUnidadTransito = u.IdUnidadTransito,
            Nombre = u.Nombre,
            Estado = u.Estado,
            Latitud = u.Latitud,
            Longitud = u.Longitud,
            BarrioId = u.BarrioId,
            NombreBarrio = u.Barrio != null ? u.Barrio.Nombre : null,
            NombreComuna = u.Barrio != null ? u.Barrio.Comuna.Nombre : null,
            TotalAgentes = u.AgentesTransito.Count()
        }).ToListAsync();
    }

    // GET: api/UnidadTransito/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UnidadTransitoDTO>> GetUnidadTransito(int id)
    {
        var unidad = await _context.UnidadesTransito.Where(u => u.IdUnidadTransito == id)
            .Select(u => new UnidadTransitoDTO
            {
                IdUnidadTransito = u.IdUnidadTransito,
                Nombre = u.Nombre,
                Estado = u.Estado,
                Latitud = u.Latitud,
                Longitud = u.Longitud,
                BarrioId = u.BarrioId,
                NombreBarrio = u.Barrio != null ? u.Barrio.Nombre : null,
                NombreComuna = u.Barrio != null ? u.Barrio.Comuna.Nombre : null,
                TotalAgentes = u.AgentesTransito.Count(),
                Agentes = u.AgentesTransito.Select(a => new AgentesTransitoDTO
                {
                    IdAgenteTransito = a.IdAgenteTransito,
                    NombreUsuario = a.Usuario.PrimerNombre + " " + a.Usuario.PrimerApellido,
                    Cedula = a.Usuario.Cedula,
                    Correo = a.Usuario.Correo,
                    Telefono = a.Usuario.Telefono,
                    Username = a.Usuario.Username,
                    Placa = a.Placa,
                    Rango = a.Rango,
                    EstadoUsuario = a.Usuario.Estado,
                    EstadoAgente = a.Estado
                }).ToList()
            }).FirstOrDefaultAsync();

        if (unidad == null)
        {
            return NotFound();
        }

        return unidad;
    }


    // PUT: api/UnidadTransito/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUnidadTransito(int id, UnidadTransitoUpdateDTO unidadUpdate)
    {
        
        var unidad = await _context.UnidadesTransito.FindAsync(id);

      if (unidad == null)
        {
            return NotFound();
        }

        unidad.Nombre = unidadUpdate.Nombre;
        unidad.Estado = unidadUpdate.Estado;
        unidad.Latitud = unidadUpdate.Latitud;
        unidad.Longitud = unidadUpdate.Longitud;
        unidad.BarrioId = unidadUpdate.BarrioId;


        
        await _context.SaveChangesAsync();
       

        return NoContent();
    }

    // POST: api/UnidadTransito
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<UnidadTransitoDTO>> PostUnidadTransito(UnidadTransitoCreateDTO unidadCreate)
    {
        if (await _context.UnidadesTransito.AnyAsync(u => u.Nombre == unidadCreate.Nombre))
        {
            return Conflict("Ya existe una unidad con ese nombre.");
        }

       
        var barrioId = unidadCreate.BarrioId;
        if (barrioId.HasValue && barrioId.Value <= 0)
        {
            barrioId = null;
        }

        if (barrioId.HasValue && !await _context.Barrios.AnyAsync(b => b.IdBarrio == barrioId.Value))
        {
            return BadRequest("El barrio indicado no existe.");
        }

        var unidad = new UnidadTransito
        {
            Nombre = unidadCreate.Nombre,
            Estado = unidadCreate.Estado,
            Latitud = unidadCreate.Latitud,
            Longitud = unidadCreate.Longitud,
            BarrioId = barrioId
        };

        _context.UnidadesTransito.Add(unidad);
        await _context.SaveChangesAsync();

       
        var creada = await GetUnidadTransito(unidad.IdUnidadTransito);

        return CreatedAtAction("GetUnidadTransito", new { id = unidad.IdUnidadTransito }, creada.Value);
    }

    // DELETE: api/UnidadTransito/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUnidadTransito(int? id)
    {
        var unidad = await _context.UnidadesTransito.FindAsync(id);
        if (unidad == null)
        {
            return NotFound();
        }

        _context.UnidadesTransito.Remove(unidad);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool UnidadTransitoExists(int? idunidadtransito)
    {
        return _context.UnidadesTransito.Any(e => e.IdUnidadTransito == idunidadtransito);
    }
}
