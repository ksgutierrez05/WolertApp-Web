using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarUnidad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Unidades",
                columns: table => new
                {
                    IdUnidad = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitud = table.Column<int>(type: "int", nullable: false),
                    Longitud = table.Column<int>(type: "int", nullable: false),
                    idBarrio = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unidades", x => x.IdUnidad);
                    table.ForeignKey(
                        name: "FK_Unidades_Barrios_idBarrio",
                        column: x => x.idBarrio,
                        principalTable: "Barrios",
                        principalColumn: "IdBarrio",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Policias",
                columns: table => new
                {
                    IdPolicia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdUsuario = table.Column<int>(type: "int", nullable: false),
                    Placa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rango = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdUnidad = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Policias", x => x.IdPolicia);
                    table.ForeignKey(
                        name: "FK_Policias_Unidades_IdUnidad",
                        column: x => x.IdUnidad,
                        principalTable: "Unidades",
                        principalColumn: "IdUnidad");
                    table.ForeignKey(
                        name: "FK_Policias_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Policias_IdUnidad",
                table: "Policias",
                column: "IdUnidad");

            migrationBuilder.CreateIndex(
                name: "IX_Policias_IdUsuario",
                table: "Policias",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Unidades_idBarrio",
                table: "Unidades",
                column: "idBarrio");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Policias");

            migrationBuilder.DropTable(
                name: "Unidades");
        }
    }
}
