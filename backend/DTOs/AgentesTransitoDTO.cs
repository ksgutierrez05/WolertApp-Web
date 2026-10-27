namespace backend.DTOs
{
  
    public class AgentesTransitoDTO
    {
        public int IdAgenteTransito { get; set; }
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
        public DateTime? FechaCreacion { get; set; }
        public string? Placa { get; set; }
        public string? Rango { get; set; }
        public string? EstadoUsuario { get; set; }
        public string? EstadoAgente { get; set; }
        public int? UnidadTransitoId { get; set; }
        public string? NombreUnidad { get; set; }
        public string? EstadoUnidad { get; set; }
    }

  
    public class AgenteTransitoListaDTO
    {
        public int IdAgenteTransito { get; set; }
        public string? NombreUsuario { get; set; }
        public string? Cedula { get; set; }
        public string? Correo { get; set; }
        public string? Telefono { get; set; }
        public string? Username { get; set; }
        public string? BarrioNombre { get; set; }
        public string? Placa { get; set; }
        public string? Rango { get; set; }
        public string? EstadoUsuario { get; set; }
        public string? EstadoAgente { get; set; }
        public int? UnidadTransitoId { get; set; }
        public string? NombreUnidad { get; set; }
        public string? EstadoUnidad { get; set; }
    }

   
    public class AgenteTransitoCreateDTO
    {
        
        public string Cedula { get; set; }
        public string PrimerNombre { get; set; }
        public string? SegundoNombre { get; set; }
        public string PrimerApellido { get; set; }
        public string? SegundoApellido { get; set; }
        public string Correo { get; set; }
        public string? Telefono { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string? Calle { get; set; }
        public string? Carrera { get; set; }
        public string? Etapa { get; set; }
        public string? Manzana { get; set; }
        public string? Casa { get; set; }
        public int? BarrioId { get; set; }

        public string Placa { get; set; }
        public string? Rango { get; set; }
        public int? UnidadTransitoId { get; set; }
    }

    
    public class AgenteTransitoUpdateDTO
    {
        public string Placa { get; set; }
        public string? Rango { get; set; }
        public string EstadoAgente { get; set; }
        public int? UnidadTransitoId { get; set; }
    }
}