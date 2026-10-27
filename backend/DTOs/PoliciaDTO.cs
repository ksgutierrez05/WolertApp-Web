namespace backend.DTOs
{
    public class PoliciaDTO
    {
        public int IdPolicia { get; set; }
        public int IdUsuario { get; set; }
        public string? NombreUsuario { get; set; }
        public string? Cedula { get; set; }
        public string Placa { get; set; } = null!;
        public string? Rango { get; set; }
        public string Estado { get; set; } = null!;
        public int? IdUnidad { get; set; }
        public string? NombreUnidad { get; set; }
    }

    public class PoliciaCreateDTO
    {
        public int IdUsuario { get; set; }
        public string Placa { get; set; } = null!;
        public string? Rango { get; set; }
        public string Estado { get; set; } = "DISPONIBLE";
        public int? IdUnidad { get; set; }
    }

    public class PoliciaUpdateDTO
    {
        public string Placa { get; set; } = null!;
        public string? Rango { get; set; }
        public string Estado { get; set; } = null!;
        public int? IdUnidad { get; set; }
    }
}