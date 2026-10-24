using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Inicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Comunas",
                columns: table => new
                {
                    IdComuna = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comunas", x => x.IdComuna);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    IdRol = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.IdRol);
                });

            migrationBuilder.CreateTable(
                name: "Barrios",
                columns: table => new
                {
                    IdBarrio = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ComunaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Barrios", x => x.IdBarrio);
                    table.ForeignKey(
                        name: "FK_Barrios_Comunas_ComunaId",
                        column: x => x.ComunaId,
                        principalTable: "Comunas",
                        principalColumn: "IdComuna",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Cedula = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PrimerNombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SegundoNombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PrimerApellido = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SegundoApellido = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Correo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Calle = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Carrera = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Etapa = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Manzana = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Casa = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RolId = table.Column<int>(type: "int", nullable: false),
                    BarrioId = table.Column<int>(type: "int", nullable: true),
                    CreadoPorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.IdUsuario);
                    table.ForeignKey(
                        name: "FK_Usuarios_Barrios_BarrioId",
                        column: x => x.BarrioId,
                        principalTable: "Barrios",
                        principalColumn: "IdBarrio");
                    table.ForeignKey(
                        name: "FK_Usuarios_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "IdRol",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Usuarios_Usuarios_CreadoPorId",
                        column: x => x.CreadoPorId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario");
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "IdRol", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 1, null, "Admin" },
                    { 2, null, "Ciudadano" },
                    { 3, null, "Policia" },
                    { 4, null, "AdminPolicia" },
                    { 5, null, "CentralPolicia" },
                    { 6, null, "AgenteTransito" },
                    { 7, null, "CentralTransito" },
                    { 8, null, "DirectorTransito" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Barrios_ComunaId",
                table: "Barrios",
                column: "ComunaId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_BarrioId",
                table: "Usuarios",
                column: "BarrioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Cedula",
                table: "Usuarios",
                column: "Cedula",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Correo",
                table: "Usuarios",
                column: "Correo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_CreadoPorId",
                table: "Usuarios",
                column: "CreadoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_RolId",
                table: "Usuarios",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Barrios");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Comunas");
        }
    }
}
