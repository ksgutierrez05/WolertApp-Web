using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("COMUNAS")]
    public class Comuna
    {
        [Key, Column("ID_COMUNA")]
        public int IdComuna { get; set; }

        [Column("NOMBRE")]
        public string Nombre { get; set; } = null!;

        public ICollection<Barrio> Barrios { get; set; } = new List<Barrio>();
    }
}