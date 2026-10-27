namespace backend.DTOs
{
    public class UnidadDTO
    {
        public int IdUnidad { get; set; }
        public string Nombre { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        public int IdBarrio { get; set; }
        public string? NombreBarrio { get; set; }
        public List<PoliciaListaDTO> Policias { get; set; } = new List<PoliciaListaDTO>();
    }

    public class UnidadListaDTO
    {
        public int IdUnidad { get; set; }
        public string Nombre { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        public string? NombreBarrio { get; set; }
        public int TotalPolicias { get; set; }
    }

    public class UnidadCreateDTO
    {
        public string Nombre { get; set; } = null!;
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        public int IdBarrio { get; set; }
    }

    public class UnidadUpdateDTO
    {
        public string Nombre { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        public int IdBarrio { get; set; }
    }
}