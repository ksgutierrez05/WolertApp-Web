namespace backend.DTOs
{
    
    public class UnidadTransitoDTO
        {
           public int IdUnidadTransito { get; set; }
           public string Nombre { get; set; }
           public string Estado { get; set; }
           public double? Latitud { get; set; }
           public double? Longitud { get; set; }
           public int? BarrioId { get; set; }
           public string? NombreBarrio { get; set; }
           public string? NombreComuna { get; set; }
           public int TotalAgentes { get; set; }
           public List<AgentesTransitoDTO> Agentes { get; set; }
        }

    public class UnidadTransitoListaDTO
        {
           public int IdUnidadTransito { get; set; }
           public string Nombre { get; set; }
           public string Estado { get; set; }
           public double? Latitud { get; set; }
           public double? Longitud { get; set; }
           public int? BarrioId { get; set; }
           public string? NombreBarrio { get; set; }
           public string? NombreComuna { get; set; }
           public int TotalAgentes { get; set; }
        }

    public class UnidadTransitoCreateDTO
        {
           public string Nombre { get; set; }
           public string Estado { get; set; } = "activo";
           public double? Latitud { get; set; }
           public double? Longitud { get; set; }
           public int? BarrioId { get; set; }
        }

    public class UnidadTransitoUpdateDTO
        {
            public string? Nombre { get; set; }
            public string? Estado { get; set; }
            public double? Latitud { get; set; }
            public double? Longitud { get; set; }
            public int? BarrioId { get; set; }
    }
}

