using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

[Route("api/[controller]")]
[ApiController]
public class PoliciasController : ControllerBase
{
    private readonly AppDBContext _context;
    public PoliciasController(AppDBContext context)
    {
        _context = context;
    }

    // GET: api/Policia
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Policia>>> GetPolicia()
    {
        return await _context.Policia.ToListAsync();
    }

    // GET: api/Policia/5
    [HttpGet("{idusuario}")]
    public async Task<ActionResult<Policia>> GetPolicia(int idusuario)
    {
        var policia = await _context.Policia.FindAsync(idusuario);

        if (policia == null)
        {
            return NotFound();
        }

        return policia;
    }

    // PUT: api/Policia/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{idusuario}")]
    public async Task<IActionResult> PutPolicia(int? idusuario, Policia policia)
    {
        if (idusuario != policia.IdUsuario)
        {
            return BadRequest();
        }

        _context.Entry(policia).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PoliciaExists(idusuario))
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

    // POST: api/Policia
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Policia>> PostPolicia(Policia policia)
    {
        _context.Policia.Add(policia);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetPolicia", new { idusuario = policia.IdUsuario }, policia);
    }

    // DELETE: api/Policia/5
    [HttpDelete("{idusuario}")]
    public async Task<IActionResult> DeletePolicia(int? idusuario)
    {
        var policia = await _context.Policia.FindAsync(idusuario);
        if (policia == null)
        {
            return NotFound();
        }

        _context.Policia.Remove(policia);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PoliciaExists(int? idusuario)
    {
        return _context.Policia.Any(e => e.IdUsuario == idusuario);
    }
}
