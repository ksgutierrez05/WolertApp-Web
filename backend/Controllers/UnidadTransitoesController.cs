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

    // GET: api/UnidadTransitoes
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
            NombreComuna = u.Barrio != null && u.Barrio.Comuna != null ? u.Barrio.Comuna.Nombre : null,
            TotalAgentes = u.AgentesTransito.Count()
        }).ToListAsync();
    }

    // GET: api/UnidadTransitoes/5
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
                NombreComuna = u.Barrio != null && u.Barrio.Comuna != null ? u.Barrio.Comuna.Nombre : null,
                TotalAgentes = u.AgentesTransito.Count(),
                Agentes = u.AgentesTransito.Select(a => new AgentesTransitoDTO
                {
                    IdUsuario = a.IdUsuario,
                    NombreUsuario = ((a.Usuario!.PrimerNombre ?? "") + " " + (a.Usuario.PrimerApellido ?? "")).Trim(),
                    Cedula = a.Usuario.Cedula,
                    Correo = a.Usuario.Correo,
                    Telefono = a.Usuario.Telefono,
                    Username = a.Usuario.Username,
                    Placa = a.Placa,
                    Rango = a.Rango,
                    EstadoUsuario = a.Usuario.Estado,
                    EstadoAgente = a.Estado,
                    UnidadTransitoId = a.UnidadTransitoId
                }).ToList()
            }).FirstOrDefaultAsync();

        if (unidad == null)
        {
            return NotFound();
        }

        return unidad;
    }

    // PUT: api/UnidadTransitoes/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUnidadTransito(int id, UnidadTransitoUpdateDTO unidadUpdate)
    {
        var unidad = await _context.UnidadesTransito.FindAsync(id);
        if (unidad == null)
        {
            return NotFound();
        }

        var barrioId = unidadUpdate.BarrioId;
        if (barrioId.HasValue && barrioId.Value <= 0)
        {
            barrioId = null;
        }

        if (barrioId.HasValue && !await _context.Barrios.AnyAsync(b => b.IdBarrio == barrioId.Value))
        {
            return BadRequest("El barrio indicado no existe.");
        }

        var nombre = unidadUpdate.Nombre.Trim().ToUpper();
        if (await _context.UnidadesTransito.AnyAsync(u =>
                u.Nombre != null && u.Nombre.ToUpper() == nombre && u.IdUnidadTransito != id))
        {
            return Conflict("Ya existe otra unidad con ese nombre.");
        }

        unidad.Nombre = nombre;
        unidad.Estado = unidadUpdate.Estado.Trim().ToUpper();
        unidad.Latitud = unidadUpdate.Latitud;
        unidad.Longitud = unidadUpdate.Longitud;
        unidad.BarrioId = barrioId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/UnidadTransitoes
    [HttpPost]
    public async Task<ActionResult<UnidadTransitoDTO>> PostUnidadTransito(UnidadTransitoCreateDTO unidadCreate)
    {
        var nombre = unidadCreate.Nombre.Trim().ToUpper();
        if (await _context.UnidadesTransito.AnyAsync(u => u.Nombre != null && u.Nombre.ToUpper() == nombre))
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

        // El ID lo genera el trigger TRG_ID_UNIDADES_TRANSITO
        var unidad = new UnidadTransito
        {
            Nombre = nombre,
            Estado = unidadCreate.Estado.Trim().ToUpper(),
            Latitud = unidadCreate.Latitud,
            Longitud = unidadCreate.Longitud,
            BarrioId = barrioId
        };

        _context.UnidadesTransito.Add(unidad);
        await _context.SaveChangesAsync();

        var creada = await GetUnidadTransito(unidad.IdUnidadTransito);

        return CreatedAtAction("GetUnidadTransito", new { id = unidad.IdUnidadTransito }, creada.Value);
    }

    // DELETE: api/UnidadTransitoes/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUnidadTransito(int id)
    {
        var unidad = await _context.UnidadesTransito.FindAsync(id);
        if (unidad == null)
        {
            return NotFound();
        }

        var totalAgentes = await _context.AgentesTransito.CountAsync(a => a.UnidadTransitoId == id);
        if (totalAgentes > 0)
        {
            return Conflict("No se puede eliminar: la unidad tiene " + totalAgentes + " agente(s) asignado(s).");
        }

        try
        {
            _context.UnidadesTransito.Remove(unidad);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // ORA-02292: la unidad tiene asignaciones o atenciones que la referencian
            return Conflict("No se puede eliminar: la unidad tiene registros asociados.");
        }

        return NoContent();
    }
}