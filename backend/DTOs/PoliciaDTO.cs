using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class PoliciaCreateDTO
    {
         public string PrimerNombre { get; set; } = null!;
         public string SegundoNombre { get; set; } = null!;
         public string PrimerApellido { get; set; } = null!;
         public string SegundoApellido { get; set; } = null!;

         public string Cedula { get; set; } = null!;
         public string Telefono { get; set; } = null!;
         public string Email { get; set; } = null!;

         public string Username { get; set; } = null!;
         public string Password { get; set; } = null!;

         public string Placa { get; set; } = null !;
         public string Rango { get; set; } = null !;

        public int IdUnidad { get; set; }
    }

    public class PoliciaDTO
    {
        public int IdUsuario { get; set; }
        public string NombreCompleto { get; set; } = null!;
        public string Cedula { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Activo { get; set; } = null!;
        public string Placa { get; set; } = null !;
        public string Rango { get; set; } = null !;
        public string Estado { get; set; } = null !;
        public int IdUnidad { get; set; }
        public string NombreUnidad { get; set; }
    }
}