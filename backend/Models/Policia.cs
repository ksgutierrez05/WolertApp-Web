using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Policia : Usuario{

        
       public string Placa     { get; set; }
       public string  Rango { get; set; }
       public string Estado { get; set; }
       
        [ForeignKey("Unidad")]
        public int idUnidad { get; set; }
        public Unidad Unidad { get; set; }
    

}
}
