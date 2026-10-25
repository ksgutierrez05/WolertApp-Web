public class Unidad
{
    [Key]   
    public int IdUnidad  { get; set; }
    public string Nombre { get; set; }
    public string Estado { get; set; }
    public int Latitud    { get; set; }
    public int Longitud { get; set; }
    public int idBarrio { get; set; }
    [ForeignKey(nameof(idBarrio))]
    public Barrio Barrio { get; set; }
    public ICollection<Policia> Policias { get; set; } = new List<Policia>();
}