
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using SalesModuleWebAPI.Configurations;
using SalesModuleWebAPI.Data;
using SalesModuleWebAPI.DTOs.Auth;
using SalesModuleWebAPI.Models;
using SalesModuleWebAPI.Services;

namespace SalesModuleWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ApplicationDbContext _context;
    private readonly TokenService _tokenService;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext context,
        TokenService tokenService,
        IOptions<JwtOptions> jwtOptions,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _tokenService = tokenService;
        _jwtOptions = jwtOptions.Value;
        _logger = logger;
    }

    // ==========================================
    // LOGIN
    // POST: api/Auth/login
    // ==========================================

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Email and password are required."
            });
        }

        var email = request.Email.Trim();

        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            _logger.LogWarning(
                "Login failed: account not found for {Email}", email);

            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        if (!user.IsActive)
        {
            _logger.LogWarning(
                "Login failed: inactive account {Email}", email);

            return Unauthorized(new
            {
                message = "This account is inactive. Contact your administrator."
            });
        }

        var passwordResult =
            await _signInManager.CheckPasswordSignInAsync(
                user,
                request.Password,
                lockoutOnFailure: true);

        if (passwordResult.IsLockedOut)
        {
            return Unauthorized(new
            {
                message = "Your account is temporarily locked. Please try again later."
            });
        }

        if (passwordResult.IsNotAllowed)
        {
            _logger.LogWarning(
                "Login not allowed for {Email}. Check Identity sign-in requirements.",
                email);

            return Unauthorized(new
            {
                message = "Login is not allowed. Check whether your account is confirmed."
            });
        }

        if (!passwordResult.Succeeded)
        {
            _logger.LogWarning(
                "Login failed: password verification failed for {Email}", email);

            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var response = await CreateAuthResponseAsync(user);

        return Ok(response);
    }

    // ==========================================
    // REFRESH TOKEN
    // POST: api/Auth/refresh
    // ==========================================

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequestDto request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new
            {
                message = "Refresh token is required."
            });
        }

        var tokenHash = _tokenService.HashRefreshToken(
            request.RefreshToken);

        var storedToken = await _context.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (storedToken == null ||
            storedToken.RevokedAtUtc != null ||
            storedToken.ExpiresAtUtc <= DateTime.UtcNow ||
            storedToken.User == null ||
            !storedToken.User.IsActive)
        {
            return Unauthorized(new
            {
                message = "Invalid or expired refresh token."
            });
        }

        var user = storedToken.User;

        // Revoke the previous refresh token.
        storedToken.RevokedAtUtc = DateTime.UtcNow;

        // Create a replacement token pair.
        // SaveChangesAsync inside this method persists the revocation
        // and the new refresh token together.
        var response = await CreateAuthResponseAsync(user);

        return Ok(response);
    }

    // ==========================================
    // LOGOUT
    // POST: api/Auth/logout
    // ==========================================

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] RefreshTokenRequestDto request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new
            {
                message = "Refresh token is required."
            });
        }

        var userIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var tokenHash = _tokenService.HashRefreshToken(
            request.RefreshToken);

        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(x =>
                x.TokenHash == tokenHash &&
                x.UserId == userId);

        if (storedToken != null &&
            storedToken.RevokedAtUtc == null)
        {
            storedToken.RevokedAtUtc = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }

    // ==========================================
    // CREATE AUTH RESPONSE
    // ==========================================

    private async Task<object> CreateAuthResponseAsync(
        ApplicationUser user)
    {
        var accessToken = await _tokenService
            .GenerateAccessTokenAsync(user);

        var refreshToken = _tokenService
            .GenerateRefreshToken();

        var now = DateTime.UtcNow;

        var accessTokenExpiresAtUtc =
            now.AddMinutes(_jwtOptions.AccessTokenMinutes);

        var refreshTokenExpiresAtUtc =
            now.AddDays(_jwtOptions.RefreshTokenDays);

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,

            TokenHash = _tokenService.HashRefreshToken(
                refreshToken),

            ExpiresAtUtc = refreshTokenExpiresAtUtc,

            CreatedAtUtc = now
        });

        var roles = await _userManager.GetRolesAsync(user);

        var dashboards = await GetUserDashboardsAsync(user.Id);

        await _context.SaveChangesAsync();

        // Response matches the React LoginResponse interface.
        return new
        {
            accessToken,

            refreshToken,

            expiresAtUtc = accessTokenExpiresAtUtc,

            user = new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email ?? string.Empty
            },

            roles,

            dashboards
        };
    }

    // ==========================================
    // GET USER DASHBOARDS
    // ==========================================

    private async Task<List<DashboardAssignmentDto>>
        GetUserDashboardsAsync(Guid userId)
    {
        var assignments = await _context.UserDepartmentPositions
            .AsNoTracking()
            .Include(a => a.Department)
            .Include(a => a.Position)
            .Where(a =>
                a.UserId == userId &&
                a.IsActive &&
                a.Department != null &&
                a.Department.IsActive &&
                a.Position != null &&
                a.Position.IsActive)
            .OrderByDescending(a => a.IsPrimary)
            .ThenBy(a => a.Department!.Name)
            .ThenBy(a => a.Position!.Name)
            .ToListAsync();

        return assignments.Select(a =>
        {
            var departmentCode = a.Department!.Code;
            var positionName = a.Position!.Name;

            return new DashboardAssignmentDto
            {
                DepartmentId = a.DepartmentId,

                DepartmentCode = departmentCode,

                DepartmentName = a.Department.Name,

                PositionId = a.PositionId,

                PositionName = positionName,

                DashboardKey = GetDepartmentSlug(departmentCode)
                    + "/"
                    + GetPositionSlug(positionName),

                IsPrimary = a.IsPrimary
            };
        }).ToList();
    }

    // ==========================================
    // DEPARTMENT ROUTE MAPPING
    // ==========================================

    private static string GetDepartmentSlug(string code)
    {
        return code.Trim().ToUpperInvariant() switch
        {
            "SALES" => "Sales",
            "DESIGN" => "Design",
            "IT" => "IT",
            "CSR" => "CSR",
            "MKT" => "Marketing",
            "EXEC" => "Executive",
            "PUR" => "Purchasing",
            "PMS" => "PMS",
            "ACC" => "Accounting",
            "INST" => "Installation",

            // Keep unknown department codes from breaking login.
            _ => code.Trim().ToUpperInvariant()
        };
    }

    // ==========================================
    // POSITION ROUTE MAPPING
    // ==========================================

    private static string GetPositionSlug(string positionName)
    {
        return positionName.Trim().ToLowerInvariant() switch
        {
            "account manager" => "AccountManager",
            "sales officer" => "SalesOfficer",
            "department head" => "DepartmentHead",
            "design specialist" => "DesignSpecialist",
            "it lead" => "ITLead",
            "it staff" => "ITStaff",

            // Generic fallback for positions without a custom mapping.
            _ => string.Concat(
                positionName
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Select(word =>
                        char.ToUpperInvariant(word[0]) +
                        word.Substring(1)))
        };
    }
}
