using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class PasoUno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alertas");

            migrationBuilder.CreateTable(
                name: "TiposAlerta",
                columns: table => new
                {
                    IdTipoAlerta = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Nombre = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    Prioridad = table.Column<string>(type: "NVARCHAR2(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposAlerta", x => x.IdTipoAlerta);
                });

            migrationBuilder.CreateTable(
                name: "AlertasTmp",
                columns: table => new
                {
                    IdAlerta = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Estado = table.Column<string>(type: "NVARCHAR2(30)", maxLength: 30, nullable: false),
                    Latitud = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    Descripcion = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Fecha = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    UsuarioId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    BarrioId = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    TipoAlertaId = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertasTmp", x => x.IdAlerta);
                    table.ForeignKey(
                        name: "FK_AlertasTmp_Barrios_BarrioId",
                        column: x => x.BarrioId,
                        principalTable: "Barrios",
                        principalColumn: "IdBarrio");
                    table.ForeignKey(
                        name: "FK_AlertasTmp_TiposAlerta_TipoAlertaId",
                        column: x => x.TipoAlertaId,
                        principalTable: "TiposAlerta",
                        principalColumn: "IdTipoAlerta",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlertasTmp_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertasTmp_BarrioId",
                table: "AlertasTmp",
                column: "BarrioId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertasTmp_TipoAlertaId",
                table: "AlertasTmp",
                column: "TipoAlertaId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertasTmp_UsuarioId",
                table: "AlertasTmp",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertasTmp");

            migrationBuilder.DropTable(
                name: "TiposAlerta");

            migrationBuilder.CreateTable(
                name: "Alertas",
                columns: table => new
                {
                    idTipoAlerta = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    nombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    prioridad = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alertas", x => x.idTipoAlerta);
                });
        }
    }
}
