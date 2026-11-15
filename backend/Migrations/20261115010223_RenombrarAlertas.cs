using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RenombrarAlertas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertasTmp");

            migrationBuilder.CreateTable(
                name: "Alertas",
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
                    table.PrimaryKey("PK_Alertas", x => x.IdAlerta);
                    table.ForeignKey(
                        name: "FK_Alertas_Barrios_BarrioId",
                        column: x => x.BarrioId,
                        principalTable: "Barrios",
                        principalColumn: "IdBarrio",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Alertas_TiposAlerta_TipoAlertaId",
                        column: x => x.TipoAlertaId,
                        principalTable: "TiposAlerta",
                        principalColumn: "IdTipoAlerta",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Alertas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TiposAlerta_Nombre",
                table: "TiposAlerta",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alertas_BarrioId",
                table: "Alertas",
                column: "BarrioId");

            migrationBuilder.CreateIndex(
                name: "IX_Alertas_Fecha",
                table: "Alertas",
                column: "Fecha");

            migrationBuilder.CreateIndex(
                name: "IX_Alertas_TipoAlertaId",
                table: "Alertas",
                column: "TipoAlertaId");

            migrationBuilder.CreateIndex(
                name: "IX_Alertas_UsuarioId",
                table: "Alertas",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alertas");

            migrationBuilder.DropIndex(
                name: "IX_TiposAlerta_Nombre",
                table: "TiposAlerta");

            migrationBuilder.CreateTable(
                name: "AlertasTmp",
                columns: table => new
                {
                    IdAlerta = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    BarrioId = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    TipoAlertaId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    UsuarioId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    Descripcion = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Estado = table.Column<string>(type: "NVARCHAR2(30)", maxLength: 30, nullable: false),
                    Fecha = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    Latitud = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(10,6)", nullable: true)
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
    }
}
