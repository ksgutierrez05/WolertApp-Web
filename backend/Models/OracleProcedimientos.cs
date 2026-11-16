using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using System.Security.Claims;
using System.Text.RegularExpressions;


namespace WolertApp.Helpers
{
    public static class OracleProcedimientos
    {
        /// <summary>
        /// Ejecuta un procedimiento del paquete dentro de una transacción:
        /// COMMIT si sale bien, ROLLBACK si falla.
        /// Devuelve null si todo salió bien, o el mensaje de negocio (ORA-20xxx) si el procedimiento lo rechazó.
        /// Cualquier otro error (conexión, SQL, etc.) se deja subir.
        /// </summary>
        public static async Task<string?> EjecutarAsync(
            AppDBContext ctx, string procedimiento, Action<OracleParameterCollection> parametros)
        {
            var conn = (OracleConnection)ctx.Database.GetDbConnection();
            await using var tx = await ctx.Database.BeginTransactionAsync();
            try
            {
                using var cmd = conn.CreateCommand();
                cmd.CommandText = procedimiento;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.BindByName = true;
                cmd.Transaction = (OracleTransaction)tx.GetDbTransaction();
                parametros(cmd.Parameters);
                await cmd.ExecuteNonQueryAsync();
                await tx.CommitAsync();
                return null;
            }
            catch (OracleException ex) when (ex.Number >= 20000 && ex.Number <= 20999)
            {
                await tx.RollbackAsync();
                return LimpiarMensaje(ex.Message);
            }
        }

        // "ORA-20103: La alerta ya esta cerrada.\nORA-06512: ..." -> "La alerta ya esta cerrada."
        private static string LimpiarMensaje(string mensaje)
        {
            var primera = mensaje.Split('\n', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? mensaje;
            return Regex.Replace(primera, @"^ORA-\d+:\s*", "").Trim();
        }

        // p.Agregar("p_id", OracleDbType.Int32, id)  (null se envía como NULL de Oracle)
        public static OracleParameter Agregar(this OracleParameterCollection p, string nombre, OracleDbType tipo, object? valor)
            => p.Add(new OracleParameter(nombre, tipo) { Value = valor ?? DBNull.Value });
    }

    public static class UsuarioActualExtensions
    {
        // ID del usuario logueado. Ajusta el claim si tu token lo guarda con otro nombre.
        public static int? IdUsuario(this ClaimsPrincipal user)
            => int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
    }
}