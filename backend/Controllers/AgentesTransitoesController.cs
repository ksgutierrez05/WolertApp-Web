using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

[Route("api/[controller]")]
[ApiController]
public class AgentesTransitoesController : ControllerBase
{
    private readonly AppDBContext _context;
    public AgentesTransitoesController(AppDBContext context)
    {
        _context = context;
    }

    // GET: api/AgentesTransito
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgentesTransito>>> GetAgentesTransito()
    {
        return await _context.AgentesTransito.ToListAsync();
    }

    // GET: api/AgentesTransito/5
    [HttpGet("{idagentetransito}")]
    public async Task<ActionResult<AgentesTransito>> GetAgentesTransito(int idagentetransito)
    {
        var agentestransito = await _context.AgentesTransito.FindAsync(idagentetransito);

        if (agentestransito == null)
        {
            return NotFound();
        }

        return agentestransito;
    }

    // PUT: api/AgentesTransito/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{idagentetransito}")]
    public async Task<IActionResult> PutAgentesTransito(int? idagentetransito, AgentesTransito agentestransito)
    {
        if (idagentetransito != agentestransito.IdAgenteTransito)
        {
            return BadRequest();
        }

        _context.Entry(agentestransito).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AgentesTransitoExists(idagentetransito))
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

    // POST: api/AgentesTransito
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<AgentesTransito>> PostAgentesTransito(AgentesTransito agentestransito)
    {
        _context.AgentesTransito.Add(agentestransito);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetAgentesTransito", new { idagentetransito = agentestransito.IdAgenteTransito }, agentestransito);
    }

    // DELETE: api/AgentesTransito/5
    [HttpDelete("{idagentetransito}")]
    public async Task<IActionResult> DeleteAgentesTransito(int? idagentetransito)
    {
        var agentestransito = await _context.AgentesTransito.FindAsync(idagentetransito);
        if (agentestransito == null)
        {
            return NotFound();
        }

        _context.AgentesTransito.Remove(agentestransito);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool AgentesTransitoExists(int? idagentetransito)
    {
        return _context.AgentesTransito.Any(e => e.IdAgenteTransito == idagentetransito);
    }
}
