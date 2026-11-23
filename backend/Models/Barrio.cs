using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("BARRIOS")]
    public class Barrio
    {
        [Key, Column("ID_BARRIO")]
        public int IdBarrio { get; set; }

        [Column("NOMBRE")]
        public string Nombre { get; set; } = null!;

        [Column("ID_COMUNA")]
        public int ComunaId { get; set; }

        [ForeignKey(nameof(ComunaId))]
        public Comuna Comuna { get; set; } = null!;

        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}