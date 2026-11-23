using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UnidadDTO
    {
        public int IdUnidad { get; set; }
        public string? Nombre { get; set; }
        public string? Estado { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public int? IdBarrio { get; set; }
        public string? NombreBarrio { get; set; }
        public List<PoliciaListaDTO> Policias { get; set; } = new List<PoliciaListaDTO>();
    }

    public class UnidadListaDTO
    {
        public int IdUnidad { get; set; }
        public string? Nombre { get; set; }
        public string? Estado { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public string? NombreBarrio { get; set; }
        public int TotalPolicias { get; set; }
    }

    public class UnidadCreateDTO
    {
        [Required, StringLength(50)]
        public string Nombre { get; set; } = null!;

        [Required, Range(-90, 90)]
        public decimal? Latitud { get; set; }

        [Required, Range(-180, 180)]
        public decimal? Longitud { get; set; }

        [Range(1, int.MaxValue)]
        public int IdBarrio { get; set; }
    }

    public class UnidadUpdateDTO
    {
        [Required, StringLength(50)]
        public string Nombre { get; set; } = null!;

        [Required, StringLength(20)]
        public string Estado { get; set; } = null!;

        [Required, Range(-90, 90)]
        public decimal? Latitud { get; set; }

        [Required, Range(-180, 180)]
        public decimal? Longitud { get; set; }

        [Range(1, int.MaxValue)]
        public int IdBarrio { get; set; }
    }
}