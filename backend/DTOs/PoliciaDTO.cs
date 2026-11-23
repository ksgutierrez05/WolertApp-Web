using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class PoliciaDTO
    {
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

        // Datos del policía
        public string? Placa { get; set; }
        public string? Rango { get; set; }
        public string? Estado { get; set; }

        // Datos de la unidad
        public int? IdUnidad { get; set; }
        public string? NombreUnidad { get; set; }
        public string? EstadoUnidad { get; set; }
    }

    // Listado de policías
    public class PoliciaListaDTO
    {
        public int IdUsuario { get; set; }
        public string? NombreUsuario { get; set; }
        public string? Cedula { get; set; }
        public string? Correo { get; set; }
        public string? Telefono { get; set; }
        public string? Placa { get; set; }
        public string? Rango { get; set; }
        public string? Estado { get; set; }
        public int? IdUnidad { get; set; }
        public string? NombreUnidad { get; set; }
    }

    public class PoliciaCreateDTO
    {
        [Range(1, int.MaxValue)]
        public int IdUsuario { get; set; }

        [Required, StringLength(10)]
        public string Placa { get; set; } = null!;

        [StringLength(25)]
        public string? Rango { get; set; }

        [Required, StringLength(15)]
        public string Estado { get; set; } = "ACTIVO";

        public int? IdUnidad { get; set; }
    }

    public class PoliciaUpdateDTO
    {
        [Required, StringLength(10)]
        public string Placa { get; set; } = null!;

        [StringLength(25)]
        public string? Rango { get; set; }

        [Required, StringLength(15)]
        public string Estado { get; set; } = null!;

        public int? IdUnidad { get; set; }
    }
}