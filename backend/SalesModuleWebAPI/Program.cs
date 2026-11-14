
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using SalesModuleWebAPI.Configurations;
using SalesModuleWebAPI.Data;
using SalesModuleWebAPI.Models;
using SalesModuleWebAPI.Services;

using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONTROLLERS
// ==========================================
builder.Services.AddControllers();

// ==========================================
// 2. DATABASE CONFIGURATION
// ==========================================
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string 'DefaultConnection' is missing.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);

    options.ConfigureWarnings(w =>
        w.Ignore(RelationalEventId.PendingModelChangesWarning));
});

// ==========================================
// 3. ASP.NET CORE IDENTITY
// ==========================================
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;

    options.User.RequireUniqueEmail = true;

    options.Lockout.AllowedForNewUsers = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan =
        TimeSpan.FromMinutes(15);
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ==========================================
// 4. JWT CONFIGURATION
// ==========================================
var jwtSection = builder.Configuration.GetSection("Jwt");

var jwtOptions = jwtSection.Get<JwtOptions>()
    ?? throw new InvalidOperationException(
        "JWT configuration is missing.");

var jwtKey = jwtSection["Key"];

if (string.IsNullOrWhiteSpace(jwtKey) ||
    Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "JWT signing key must contain at least 32 bytes.");
}

if (string.IsNullOrWhiteSpace(jwtOptions.Issuer) ||
    string.IsNullOrWhiteSpace(jwtOptions.Audience))
{
    throw new InvalidOperationException(
        "JWT Issuer or Audience configuration is missing.");
}

jwtOptions.Key = jwtKey;

builder.Services.Configure<JwtOptions>(jwtSection);

// ==========================================
// 5. AUTHENTICATION
// ==========================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultForbidScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.Key)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),

            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var principal = context.Principal;

            var userIdValue = principal?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            var securityStamp = principal?
                .FindFirstValue("security_stamp");

            if (string.IsNullOrWhiteSpace(userIdValue) ||
                !Guid.TryParse(userIdValue, out var userId))
            {
                context.Fail("Invalid user token.");
                return;
            }

            if (string.IsNullOrWhiteSpace(securityStamp))
            {
                context.Fail("Token security stamp is missing.");
                return;
            }

            var userManager = context.HttpContext.RequestServices
                .GetRequiredService<UserManager<ApplicationUser>>();

            var user = await userManager.FindByIdAsync(
                userId.ToString());

            if (user is null ||
                !user.IsActive ||
                !string.Equals(
                    user.SecurityStamp,
                    securityStamp,
                    StringComparison.Ordinal))
            {
                context.Fail(
                    "User is inactive or token is invalid.");
            }
        }
    };
});

// ==========================================
// 6. AUTHORIZATION
// ==========================================
builder.Services.AddAuthorization();

// ==========================================
// 7. SWAGGER CONFIGURATION
// ==========================================
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sales Module API",
        Version = "v1",
        Description = "Company Management System API"
    });

    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT access token."
        });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference(
                    "Bearer",
                    document,
                    null),
                new List<string>()
            }
        });
});

// ==========================================
// 8. APPLICATION SERVICES
// ==========================================
builder.Services.AddScoped<TokenService>();

// ==========================================
// 9. CORS CONFIGURATION
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ==========================================
// 10. BUILD APPLICATION
// ==========================================
var app = builder.Build();

// ==========================================
// 11. SWAGGER MIDDLEWARE
// ==========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "Sales Module API V1");

        options.RoutePrefix = "swagger";
    });
}

// ==========================================
// 12. DATABASE INITIALIZATION
// ==========================================
await DbSeeder.SeedAsync(app.Services);

// ==========================================
// 13. DEVELOPMENT SAMPLE DATA
// ==========================================
if (app.Environment.IsDevelopment())
{
    await DbSeeder.SeedSampleUsersAsync(
        app.Services,
        app.Configuration);

    using var scope = app.Services.CreateScope();

    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<ApplicationUser>>();

    var email = "maria.sales@company.local";
    var password = app.Configuration["SampleUsers:Password"];

    var user = await userManager.FindByEmailAsync(email);

    if (user != null && !string.IsNullOrWhiteSpace(password))
    {
        var token = await userManager
            .GeneratePasswordResetTokenAsync(user);

        var result = await userManager.ResetPasswordAsync(
            user,
            token,
            password);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                string.Join(
                    "; ",
                    result.Errors.Select(e => e.Description)));
        }

        Console.WriteLine(
            $"Sample password reset for {email}");
    }
}

// ==========================================
// 14. MIDDLEWARE PIPELINE
// ==========================================
app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.UseAuthentication();

app.UseAuthorization();

// ==========================================
// 15. MAP CONTROLLERS
// ==========================================
app.MapControllers();

// ==========================================
// 16. RUN APPLICATION
// ==========================================
await app.RunAsync();
