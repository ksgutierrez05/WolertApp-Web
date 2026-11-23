using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UnidadTransitoDTO
    {
        public int IdUnidadTransito { get; set; }
        public string? Nombre { get; set; }
        public string? Estado { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public int? BarrioId { get; set; }
        public string? NombreBarrio { get; set; }
        public string? NombreComuna { get; set; }
        public int TotalAgentes { get; set; }
        public List<AgentesTransitoDTO> Agentes { get; set; } = new List<AgentesTransitoDTO>();
    }

    public class UnidadTransitoListaDTO
    {
        public int IdUnidadTransito { get; set; }
        public string? Nombre { get; set; }
        public string? Estado { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public int? BarrioId { get; set; }
        public string? NombreBarrio { get; set; }
        public string? NombreComuna { get; set; }
        public int TotalAgentes { get; set; }
    }

    public class UnidadTransitoCreateDTO
    {
        [Required, StringLength(20)]
        public string Nombre { get; set; } = null!;

        [StringLength(20)]
        public string Estado { get; set; } = "OPERATIVA";

        [Required, Range(-90, 90)]
        public decimal? Latitud { get; set; }

        [Required, Range(-180, 180)]
        public decimal? Longitud { get; set; }

        public int? BarrioId { get; set; }
    }

    public class UnidadTransitoUpdateDTO
    {
        [Required, StringLength(20)]
        public string Nombre { get; set; } = null!;

        [Required, StringLength(20)]
        public string Estado { get; set; } = null!;

        [Required, Range(-90, 90)]
        public decimal? Latitud { get; set; }

        [Required, Range(-180, 180)]
        public decimal? Longitud { get; set; }

        public int? BarrioId { get; set; }
    }
}