using Microsoft.EntityFrameworkCore;
using SIBAM.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Servicios
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Conexión con SQL Server
builder.Services.AddDbContext<SibamDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("SibamConnection")
    ));

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();