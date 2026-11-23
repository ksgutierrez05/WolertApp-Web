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

    // GET: api/AgentesTransitoes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgenteTransitoListaDTO>>> GetAgentesTransito()
    {
        return await _context.AgentesTransito.Select(a => new AgenteTransitoListaDTO
        {
            IdUsuario = a.IdUsuario,
            NombreUsuario = ((a.Usuario!.PrimerNombre ?? "") + " " + (a.Usuario.PrimerApellido ?? "")).Trim(),
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

    // GET: api/AgentesTransitoes/5  (el id es el ID_USUARIO)
    [HttpGet("{id}")]
    public async Task<ActionResult<AgentesTransitoDTO>> GetAgenteTransito(int id)
    {
        var agente = await _context.AgentesTransito.Where(a => a.IdUsuario == id)
            .Select(a => new AgentesTransitoDTO
            {
                IdUsuario = a.IdUsuario,
                NombreUsuario = ((a.Usuario!.PrimerNombre ?? "") + " " + (a.Usuario.PrimerApellido ?? "")).Trim(),
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

    // PUT: api/AgentesTransitoes/5  (el id es el ID_USUARIO)
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAgenteTransito(int id, AgenteTransitoUpdateDTO agenteUpdate)
    {
        var agente = await _context.AgentesTransito.FindAsync(id);
        if (agente == null)
        {
            return NotFound();
        }

        var placa = agenteUpdate.Placa.Trim().ToUpper();
        if (await _context.AgentesTransito.AnyAsync(a => a.Placa == placa && a.IdUsuario != id))
        {
            return Conflict("Ya existe otro agente con esa placa.");
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

        agente.Placa = placa;
        agente.Rango = agenteUpdate.Rango?.Trim().ToUpper();
        agente.Estado = agenteUpdate.EstadoAgente.Trim().ToUpper();
        agente.UnidadTransitoId = unidadId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/AgentesTransitoes
    [HttpPost]
    public async Task<ActionResult<AgentesTransitoDTO>> PostAgenteTransito(AgenteTransitoCreateDTO agenteCreate)
    {
        var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "AGENTE_TRANSITO");
        if (rol == null)
        {
            return BadRequest("El rol AGENTE_TRANSITO no existe.");
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

        var placa = agenteCreate.Placa.Trim().ToUpper();
        if (await _context.AgentesTransito.AnyAsync(a => a.Placa == placa))
        {
            return Conflict("Ya existe un agente con esa placa.");
        }

        // El ID_USUARIO lo genera el trigger TRG_ID_USUARIOS
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
            RolId = rol.IdRol,
            Estado = "ACTIVO"
        };
        usuario.PasswordHash = new PasswordHasher<Usuario>().HashPassword(usuario, agenteCreate.Password);

        // La PK del agente es el ID del usuario: EF la toma de la navegación al guardar
        var agente = new AgentesTransito
        {
            Usuario = usuario,
            Placa = placa,
            Rango = agenteCreate.Rango?.Trim().ToUpper(),
            Estado = "ACTIVO",
            UnidadTransitoId = unidadId
        };

        _context.AgentesTransito.Add(agente);
        await _context.SaveChangesAsync();

        var creado = await GetAgenteTransito(agente.IdUsuario);

        return CreatedAtAction("GetAgenteTransito", new { id = agente.IdUsuario }, creado.Value);
    }

    // DELETE: api/AgentesTransitoes/5  (el id es el ID_USUARIO)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAgentesTransito(int id)
    {
        var agente = await _context.AgentesTransito.FindAsync(id);
        if (agente == null)
        {
            return NotFound();
        }

        // Solo borra el registro de agente; el usuario sigue existiendo
        try
        {
            _context.AgentesTransito.Remove(agente);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // ORA-02292: tiene atenciones u otros registros que lo referencian
            return Conflict("No se puede eliminar: el agente tiene registros asociados.");
        }

        return NoContent();
    }
}