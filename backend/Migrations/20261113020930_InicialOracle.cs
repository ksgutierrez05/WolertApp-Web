using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InicialOracle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "Comunas",
                columns: table => new
                {
                    IdComuna = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Nombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comunas", x => x.IdComuna);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    IdRol = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Nombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Descripcion = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.IdRol);
                });

            migrationBuilder.CreateTable(
                name: "Barrios",
                columns: table => new
                {
                    IdBarrio = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Nombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    ComunaId = table.Column<int>(type: "NUMBER(10)", nullable: false)
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
                name: "Unidades",
                columns: table => new
                {
                    IdUnidad = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Nombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Estado = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Latitud = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    Longitud = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    idBarrio = table.Column<int>(type: "NUMBER(10)", nullable: false)
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
                name: "UnidadesTransito",
                columns: table => new
                {
                    IdUnidadTransito = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Nombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Estado = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Latitud = table.Column<double>(type: "BINARY_DOUBLE", nullable: true),
                    Longitud = table.Column<double>(type: "BINARY_DOUBLE", nullable: true),
                    BarrioId = table.Column<int>(type: "NUMBER(10)", nullable: true)
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
                name: "Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Cedula = table.Column<string>(type: "NVARCHAR2(450)", nullable: false),
                    PrimerNombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    SegundoNombre = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    PrimerApellido = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    SegundoApellido = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Correo = table.Column<string>(type: "NVARCHAR2(450)", nullable: false),
                    Telefono = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Username = table.Column<string>(type: "NVARCHAR2(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Calle = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Carrera = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Etapa = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Manzana = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Casa = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Estado = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    RolId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    BarrioId = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    CreadoPorId = table.Column<int>(type: "NUMBER(10)", nullable: true)
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

            migrationBuilder.CreateTable(
                name: "AgentesTransito",
                columns: table => new
                {
                    IdAgenteTransito = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    UsuarioId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    Placa = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Rango = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    Estado = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    UnidadTransitoId = table.Column<int>(type: "NUMBER(10)", nullable: true)
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

            migrationBuilder.CreateTable(
                name: "Policias",
                columns: table => new
                {
                    IdPolicia = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    IdUsuario = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    Placa = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Rango = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Estado = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    IdUnidad = table.Column<int>(type: "NUMBER(10)", nullable: true)
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
                name: "IX_AgentesTransito_UnidadTransitoId",
                table: "AgentesTransito",
                column: "UnidadTransitoId");

            migrationBuilder.CreateIndex(
                name: "IX_AgentesTransito_UsuarioId",
                table: "AgentesTransito",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Barrios_ComunaId",
                table: "Barrios",
                column: "ComunaId");

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

            migrationBuilder.CreateIndex(
                name: "IX_UnidadesTransito_BarrioId",
                table: "UnidadesTransito",
                column: "BarrioId");

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
                name: "AgentesTransito");

            migrationBuilder.DropTable(
                name: "Alertas");

            migrationBuilder.DropTable(
                name: "Policias");

            migrationBuilder.DropTable(
                name: "UnidadesTransito");

            migrationBuilder.DropTable(
                name: "Unidades");

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
