
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
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"))
    .ConfigureWarnings(w =>
        w.Ignore(RelationalEventId.PendingModelChangesWarning)));

// ==========================================
// 3. ASP.NET CORE IDENTITY
// ==========================================
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    // Password requirements
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;

    // User requirements
    options.User.RequireUniqueEmail = true;

    // Account lockout
    options.Lockout.AllowedForNewUsers = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan =
        TimeSpan.FromMinutes(15);
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ==========================================
// 4. AUTHORIZATION
// ==========================================
builder.Services.AddAuthorization();

// ==========================================
// 5. JWT CONFIGURATION
// ==========================================
var jwtSection = builder.Configuration.GetSection("Jwt");

builder.Services.Configure<JwtOptions>(jwtSection);

var jwtOptions = jwtSection.Get<JwtOptions>()
    ?? throw new InvalidOperationException(
        "JWT configuration is missing.");

var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey) ||
    Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "JWT signing key must contain at least 32 bytes.");
}

jwtOptions.Key = jwtKey;

// ==========================================
// 6. AUTHENTICATION
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

    // Validate user status and security stamp.
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var userIdValue = context.Principal?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            var securityStamp = context.Principal?
                .FindFirstValue("security_stamp");

            if (string.IsNullOrWhiteSpace(userIdValue) ||
                !Guid.TryParse(userIdValue, out var userId))
            {
                context.Fail("Invalid user token.");
                return;
            }

            var userManager = context.HttpContext.RequestServices
                .GetRequiredService<UserManager<ApplicationUser>>();

            var user = await userManager.FindByIdAsync(
                userId.ToString());

            if (user is null ||
                !user.IsActive ||
                string.IsNullOrWhiteSpace(securityStamp) ||
                user.SecurityStamp != securityStamp)
            {
                context.Fail(
                    "User is inactive or token is invalid.");
            }
        }
    };
});

// ==========================================
// 7. SWAGGER CONFIGURATION
// ==========================================
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
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
                    "Bearer", document, null),
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
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ==========================================
// 10. BUILD APPLICATION
// ==========================================
var app = builder.Build();

// ==========================================
// 11. DATABASE INITIALIZATION
// ==========================================

// Apply pending database migrations.
await DbSeeder.SeedAsync(app.Services);

// ==========================================
// 12. DEVELOPMENT CONFIGURATION
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
        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        var result = await userManager.ResetPasswordAsync(
            user,
            token,
            password);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(
                "; ",
                result.Errors.Select(e => e.Description)));
        }

        Console.WriteLine($"Sample password reset for {email}");
    }
}

// ==========================================
// 13. MIDDLEWARE PIPELINE
// ==========================================
app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.UseAuthentication();

app.UseAuthorization();

// ==========================================
// 14. MAP CONTROLLERS
// ==========================================
app.MapControllers();

// ==========================================
// 15. RUN APPLICATION
// ==========================================
await app.RunAsync();
