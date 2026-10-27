namespace backend.DTOs
{
    
    public class PoliciaDTO
    {
        public int IdPolicia { get; set; }
        public int IdUsuario { get; set; }

        // Datos del usuario
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
        public string? EstadoUsuario { get; set; }
        public DateTime? FechaCreacion { get; set; }

        // Datos del policía
        public string Placa { get; set; } = null!;
        public string? Rango { get; set; }
        public string Estado { get; set; } = null!;

        // Datos de la unidad
        public int? IdUnidad { get; set; }
        public string? NombreUnidad { get; set; }
        public string? EstadoUnidad { get; set; }
    }

    // Listado de policías
    public class PoliciaListaDTO
    {
        public int IdPolicia { get; set; }
        public int IdUsuario { get; set; }
        public string? NombreUsuario { get; set; }
        public string? Cedula { get; set; }
        public string? Correo { get; set; }
        public string? Telefono { get; set; }
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