using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
   public async Task<ActionResult<IEnumerable<AgenteTransitoListaDTO>>> GetAgentesTransito()
    {
        return await _context.AgentesTransito.Select(a => new AgenteTransitoListaDTO
        {
            IdAgenteTransito = a.IdAgenteTransito,
            NombreUsuario = a.Usuario.PrimerNombre + " " + a.Usuario.PrimerApellido,
            Cedula = a.Usuario.Cedula,
            Correo = a.Usuario.Correo,
            Telefono = a.Usuario.Telefono,
            Username = a.Usuario.Username,
            BarrioNombre = a.Usuario.Barrio != null ? a.Usuario.Barrio.Nombre : null,
            Placa = a.Placa,
            Rango = a.Rango,
            EstadoUsuario = a.Usuario.Estado,
            EstadoAgente = a.Estado,
            UnidadTransitoId = a.UnidadTransitoId,
            NombreUnidad = a.UnidadTransito != null ? a.UnidadTransito.Nombre : null,
            EstadoUnidad = a.UnidadTransito != null ? a.UnidadTransito.Estado : null
        }).ToListAsync();
    }


    // GET: api/AgentesTransito/5
    [HttpGet("{id}")]
    public async Task<ActionResult<AgentesTransitoDTO>> GetAgenteTransito(int id)
    {
        var agente = await _context.AgentesTransito.Where(a => a.IdAgenteTransito == id)
            .Select(a => new AgentesTransitoDTO
            {
                IdAgenteTransito = a.IdAgenteTransito,
                NombreUsuario = a.Usuario.PrimerNombre + " " + a.Usuario.PrimerApellido,
                PrimerNombre = a.Usuario.PrimerNombre,
                SegundoNombre = a.Usuario.SegundoNombre,
                PrimerApellido = a.Usuario.PrimerApellido,
                SegundoApellido = a.Usuario.SegundoApellido,
                Cedula = a.Usuario.Cedula,
                Correo = a.Usuario.Correo,
                Telefono = a.Usuario.Telefono,
                Username = a.Usuario.Username,
                Calle = a.Usuario.Calle,
                Carrera = a.Usuario.Carrera,
                Etapa = a.Usuario.Etapa,
                Manzana = a.Usuario.Manzana,
                Casa = a.Usuario.Casa,
                BarrioNombre = a.Usuario.Barrio != null ? a.Usuario.Barrio.Nombre : null,
                FechaCreacion = a.Usuario.FechaCreacion,
                Placa = a.Placa,
                Rango = a.Rango,
                EstadoUsuario = a.Usuario.Estado,
                EstadoAgente = a.Estado,
                UnidadTransitoId = a.UnidadTransitoId,
                NombreUnidad = a.UnidadTransito != null ? a.UnidadTransito.Nombre : null,
                EstadoUnidad = a.UnidadTransito != null ? a.UnidadTransito.Estado : null
            }).FirstOrDefaultAsync();

        if (agente == null)
        {
            return NotFound();
        }

        return agente;
    }


    // PUT: api/AgentesTransito/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAgenteTransito(int id, AgenteTransitoUpdateDTO agenteUpdate)
    {
        var agente = await _context.AgentesTransito.FindAsync(id);
        if (agente == null)
        {
            return NotFound();
        }

       
        var unidadId = agenteUpdate.UnidadTransitoId;
        if (unidadId.HasValue && unidadId.Value <= 0)
        {
            unidadId = null;
        }

        if (unidadId.HasValue && !await _context.UnidadesTransito.AnyAsync(u => u.IdUnidadTransito == unidadId.Value))
        {
            return BadRequest("La unidad de transito indicada no existe.");
        }

        agente.Placa = agenteUpdate.Placa;
        agente.Rango = agenteUpdate.Rango;
        agente.Estado = agenteUpdate.EstadoAgente;
        agente.UnidadTransitoId = unidadId;

        await _context.SaveChangesAsync();

        return NoContent();
    }
    // POST: api/AgentesTransito
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<AgentesTransitoDTO>> PostAgenteTransito(AgenteTransitoCreateDTO agenteCreate)
    {
        var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "AgenteTransito");
        if (rol == null)
        {
            return BadRequest("El rol AgenteTransito no existe.");
        }

        
        var barrioId = agenteCreate.BarrioId;
        if (barrioId.HasValue && barrioId.Value <= 0)
        {
            barrioId = null;
        }

        var unidadId = agenteCreate.UnidadTransitoId;
        if (unidadId.HasValue && unidadId.Value <= 0)
        {
            unidadId = null;
        }

        if (barrioId.HasValue && !await _context.Barrios.AnyAsync(b => b.IdBarrio == barrioId.Value))
        {
            return BadRequest("El barrio indicado no existe.");
        }

        if (unidadId.HasValue && !await _context.UnidadesTransito.AnyAsync(u => u.IdUnidadTransito == unidadId.Value))
        {
            return BadRequest("La unidad de transito indicada no existe.");
        }

        var existe = await _context.Usuarios.AnyAsync(u =>
            u.Cedula == agenteCreate.Cedula ||
            u.Correo == agenteCreate.Correo ||
            u.Username == agenteCreate.Username);
        if (existe)
        {
            return Conflict("Ya existe un usuario con esa cedula, correo o username.");
        }

        var usuario = new Usuario
        {
            Cedula = agenteCreate.Cedula,
            PrimerNombre = agenteCreate.PrimerNombre,
            SegundoNombre = agenteCreate.SegundoNombre,
            PrimerApellido = agenteCreate.PrimerApellido,
            SegundoApellido = agenteCreate.SegundoApellido,
            Correo = agenteCreate.Correo,
            Telefono = agenteCreate.Telefono,
            Username = agenteCreate.Username,
            Calle = agenteCreate.Calle,
            Carrera = agenteCreate.Carrera,
            Etapa = agenteCreate.Etapa,
            Manzana = agenteCreate.Manzana,
            Casa = agenteCreate.Casa,
            BarrioId = barrioId,
            RolId = rol.IdRol
        };
        usuario.PasswordHash = new PasswordHasher<Usuario>().HashPassword(usuario, agenteCreate.Password);

        var agente = new AgentesTransito
        {
            Usuario = usuario,
            Placa = agenteCreate.Placa,
            Rango = agenteCreate.Rango,
            Estado = "disponible",
            UnidadTransitoId = unidadId
        };

        _context.AgentesTransito.Add(agente);
        await _context.SaveChangesAsync();

       
        var creado = await GetAgenteTransito(agente.IdAgenteTransito);

        return CreatedAtAction("GetAgenteTransito", new { id = agente.IdAgenteTransito }, creado.Value);
    }

    // DELETE: api/AgentesTransito/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAgentesTransito(int id)
    {
        var agente = await _context.AgentesTransito.FindAsync(id);
        if (agente == null)
        {
            return NotFound();
        }

        _context.AgentesTransito.Remove(agente);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool AgentesTransitoExists(int? idagentetransito)
    {
        return _context.AgentesTransito.Any(e => e.IdAgenteTransito == idagentetransito);
    }
}
