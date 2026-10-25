namespace backend.Models
{
    public class Policia : Usuario

    public string Placa     { get; set; }
    public string  Rango { get; set; }
    public string Estado { get; set; }
    public int idUnidad { get; set; }
    [ForeignKey(nameof(idUnidad))]
    public Unidad Unidad { get; set; }
    

}
}
