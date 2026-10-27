using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class tablas_transito : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Semaforos",
                columns: table => new
                {
                    IdSemaforo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitud = table.Column<double>(type: "float", nullable: true),
                    Longitud = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BarrioId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Semaforos", x => x.IdSemaforo);
                    table.ForeignKey(
                        name: "FK_Semaforos_Barrios_BarrioId",
                        column: x => x.BarrioId,
                        principalTable: "Barrios",
                        principalColumn: "IdBarrio");
                });

            migrationBuilder.CreateTable(
                name: "UnidadesTransito",
                columns: table => new
                {
                    IdUnidadTransito = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitud = table.Column<double>(type: "float", nullable: true),
                    Longitud = table.Column<double>(type: "float", nullable: true),
                    BarrioId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnidadesTransito", x => x.IdUnidadTransito);
                    table.ForeignKey(
                        name: "FK_UnidadesTransito_Barrios_BarrioId",
                        column: x => x.BarrioId,
                        principalTable: "Barrios",
                        principalColumn: "IdBarrio");
                });

            migrationBuilder.CreateTable(
                name: "AgentesTransito",
                columns: table => new
                {
                    IdAgenteTransito = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    Placa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rango = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnidadTransitoId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgentesTransito", x => x.IdAgenteTransito);
                    table.ForeignKey(
                        name: "FK_AgentesTransito_UnidadesTransito_UnidadTransitoId",
                        column: x => x.UnidadTransitoId,
                        principalTable: "UnidadesTransito",
                        principalColumn: "IdUnidadTransito");
                    table.ForeignKey(
                        name: "FK_AgentesTransito_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgentesTransito_UnidadTransitoId",
                table: "AgentesTransito",
                column: "UnidadTransitoId");

            migrationBuilder.CreateIndex(
                name: "IX_AgentesTransito_UsuarioId",
                table: "AgentesTransito",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Semaforos_BarrioId",
                table: "Semaforos",
                column: "BarrioId");

            migrationBuilder.CreateIndex(
                name: "IX_UnidadesTransito_BarrioId",
                table: "UnidadesTransito",
                column: "BarrioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgentesTransito");

            migrationBuilder.DropTable(
                name: "Semaforos");

            migrationBuilder.DropTable(
                name: "UnidadesTransito");
        }
    }
}
