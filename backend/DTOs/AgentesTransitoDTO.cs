using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AgentesTransitoDTO
    {
        public int IdUsuario { get; set; }
        public string? NombreUsuario { get; set; }
        public string? PrimerNombre { get; set; }
        public string? SegundoNombre { get; set; }
        public string? PrimerApellido { get; set; }
        public string? SegundoApellido { get; set; }
        public string? Cedula { get; set; }
        public string? Correo { get; set; }
        public string? Telefono { get; set; }
        public string? Username { get; set; }
        public string? Calle { get; set; }
        public string? Carrera { get; set; }
        public string? Etapa { get; set; }
        public string? Manzana { get; set; }
        public string? Casa { get; set; }
        public string? BarrioNombre { get; set; }
        public string? Placa { get; set; }
        public string? Rango { get; set; }
        public string? EstadoUsuario { get; set; }
        public string? EstadoAgente { get; set; }
        public int? UnidadTransitoId { get; set; }
        public string? NombreUnidad { get; set; }
        public string? EstadoUnidad { get; set; }
    }

    public class AgenteTransitoListaDTO
    {
        public int IdUsuario { get; set; }
        public string? NombreUsuario { get; set; }
        public string? Cedula { get; set; }
        public string? Correo { get; set; }
        public string? Telefono { get; set; }
        public string? Username { get; set; }
        public string? BarrioNombre { get; set; }
        public string? Placa { get; set; }
        public string? Rango { get; set; }
        public string? EstadoUsuario { get; set; }
        public string? EstadoAgente { get; set; }
        public int? UnidadTransitoId { get; set; }
        public string? NombreUnidad { get; set; }
        public string? EstadoUnidad { get; set; }
    }

    public class AgenteTransitoCreateDTO
    {
        [Required, StringLength(11)]
        public string Cedula { get; set; } = null!;

        [Required, StringLength(12)]
        public string PrimerNombre { get; set; } = null!;

        [StringLength(12)]
        public string? SegundoNombre { get; set; }

        [Required, StringLength(20)]
        public string PrimerApellido { get; set; } = null!;

        [StringLength(20)]
        public string? SegundoApellido { get; set; }

        [Required, EmailAddress, StringLength(40)]
        public string Correo { get; set; } = null!;

        [StringLength(10)]
        public string? Telefono { get; set; }

        [Required, StringLength(15)]
        public string Username { get; set; } = null!;

        [Required, StringLength(100)]
        public string Password { get; set; } = null!;

        [StringLength(50)]
        public string? Calle { get; set; }

        [StringLength(50)]
        public string? Carrera { get; set; }

        [StringLength(20)]
        public string? Etapa { get; set; }

        [StringLength(20)]
        public string? Manzana { get; set; }

        [StringLength(10)]
        public string? Casa { get; set; }

        public int? BarrioId { get; set; }

        [Required, StringLength(20)]
        public string Placa { get; set; } = null!;

        [StringLength(30)]
        public string? Rango { get; set; }

        public int? UnidadTransitoId { get; set; }
    }

    public class AgenteTransitoUpdateDTO
    {
        [Required, StringLength(20)]
        public string Placa { get; set; } = null!;

        [StringLength(30)]
        public string? Rango { get; set; }

        [Required, StringLength(20)]
        public string EstadoAgente { get; set; } = null!;

        public int? UnidadTransitoId { get; set; }
    }
}