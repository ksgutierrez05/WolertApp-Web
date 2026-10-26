namespace backend.DTOs
{
   
        public class AgentesTransitoDTO
        {
            public int IdAgenteTransito { get; set; }
            public int UsuarioId { get; set; }
            public string? NombreUsuario { get; set; }
            public string? Cedula { get; set; }
            public string Placa { get; set; }
            public string? Rango { get; set; }
            public string Estado { get; set; }
            public int? UnidadTransitoId { get; set; }
            public string? NombreUnidad { get; set; }
        }

        public class AgenteTransitoCreateDTO
        {
            public string Placa { get; set; }
            public string? Rango { get; set; }
            public string Estado { get; set; } = "disponible";
            public int? UnidadTransitoId { get; set; }
        }

    public class AgenteTransitoUpdateDTO
    {
        public string Placa { get; set; }
        public string? Rango { get; set; }
        public string Estado { get; set; }
        public int? UnidadTransitoId { get; set; }
    }
}
