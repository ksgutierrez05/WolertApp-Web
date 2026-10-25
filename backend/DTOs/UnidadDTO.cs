using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UnidadCreateDTO
    {
         public string Nombre { get; set; } = null !;
         public int IdBarrio { get; set; }
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
    }

    public class UnidadDTO
    {
        public int IdUnidad { get; set; }
        public string Nombre { get; set; } = null !;
        public string Estado { get; set; } = null !;
        public int IdBarrio { get; set; }
        public string Barrio { get; set; } = null !;
        public string Comuna { get; set; } = null !;
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
    }
}