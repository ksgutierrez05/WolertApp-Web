using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

[Route("api/[controller]")]
[ApiController]
public class UnidadsController : ControllerBase
{
    private readonly AppDBContext _context;
    public UnidadsController(AppDBContext context)
    {
        _context = context;
    }

    // GET: api/Unidad
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Unidad>>> GetUnidad()
    {
        return await _context.Unidad.ToListAsync();
    }

    // GET: api/Unidad/5
    [HttpGet("{idunidad}")]
    public async Task<ActionResult<Unidad>> GetUnidad(int idunidad)
    {
        var unidad = await _context.Unidad.FindAsync(idunidad);

        if (unidad == null)
        {
            return NotFound();
        }

        return unidad;
    }

    // PUT: api/Unidad/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{idunidad}")]
    public async Task<IActionResult> PutUnidad(int? idunidad, Unidad unidad)
    {
        if (idunidad != unidad.IdUnidad)
        {
            return BadRequest();
        }

        _context.Entry(unidad).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UnidadExists(idunidad))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // POST: api/Unidad
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Unidad>> PostUnidad(Unidad unidad)
    {
        _context.Unidad.Add(unidad);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetUnidad", new { idunidad = unidad.IdUnidad }, unidad);
    }

    // DELETE: api/Unidad/5
    [HttpDelete("{idunidad}")]
    public async Task<IActionResult> DeleteUnidad(int? idunidad)
    {
        var unidad = await _context.Unidad.FindAsync(idunidad);
        if (unidad == null)
        {
            return NotFound();
        }

        _context.Unidad.Remove(unidad);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool UnidadExists(int? idunidad)
    {
        return _context.Unidad.Any(e => e.IdUnidad == idunidad);
    }
}
