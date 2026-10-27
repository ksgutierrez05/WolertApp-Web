using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class AgentesTransito
    {

        [Key]
        public int IdAgenteTransito { get; set; }
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; }
        public string Placa { get; set; }
        public string? Rango { get; set; }
        public string Estado { get; set; }
        [ForeignKey("UnidadTransito")]
        public int? UnidadTransitoId { get; set; }
        public UnidadTransito? UnidadTransito { get; set; }

    }
}
