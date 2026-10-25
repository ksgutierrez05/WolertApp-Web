using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Permite que el programa de WolertApp (en localhost, cualquier puerto) llame a la API
builder.Services.AddCors(options =>
{
	options.AddPolicy("Frontend", policy =>
		policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
			  .AllowAnyHeader()
			  .AllowAnyMethod());
});

builder.Services.AddDbContext<AppDBContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.MapControllers();
app.Run();