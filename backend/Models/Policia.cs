using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Policia
    {
        [Key]
        public int IdPolicia { get; set; }
        [ForeignKey("Usuario")]
        public int IdUsuario { get; set; }
        public Usuario Usuario { get; set; }
        public string Placa { get; set; } = null!;
        public string Rango { get; set; }
        public string Estado { get; set; } = null!;
        [ForeignKey("Unidad")]
        public int? IdUnidad { get; set; }
        public Unidad? Unidad { get; set; }
    }
}
