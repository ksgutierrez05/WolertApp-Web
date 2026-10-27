namespace backend.DTOs
{
   
        public class SemaforosDTO
        {
            public int IdSemaforo { get; set; }
            public string Codigo { get; set; }
            public string Direccion { get; set; }
            public string? Tipo { get; set; }
            public string Estado { get; set; }
            public double? Latitud { get; set; }
            public double? Longitud { get; set; }
            public string? Observacion { get; set; }
            public int? BarrioId { get; set; }
            public string? NombreBarrio { get; set; }
        }

        public class SemaforoCreateDTO
        {
            public string Codigo { get; set; }
            public string Direccion { get; set; }
            public string? Tipo { get; set; }
            public string Estado { get; set; } = "activo";
            public double? Latitud { get; set; }
            public double? Longitud { get; set; }
            public string? Observacion { get; set; }
            public int? BarrioId { get; set; }
        }

    }

