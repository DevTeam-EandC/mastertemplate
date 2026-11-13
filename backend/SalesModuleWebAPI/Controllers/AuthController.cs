
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SalesModuleWebAPI.Configurations;
using SalesModuleWebAPI.Data;
using SalesModuleWebAPI.DTOs;
using SalesModuleWebAPI.DTOs.Auth;
using SalesModuleWebAPI.Models;
using SalesModuleWebAPI.Services;
using System.Security.Claims;

namespace SalesModuleWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;
        private readonly JwtOptions _jwtOptions;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ApplicationDbContext context,
            TokenService tokenService,
            IOptions<JwtOptions> jwtOptions)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _tokenService = tokenService;
            _jwtOptions = jwtOptions.Value;
        }

        // ==========================================
        // LOGIN
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

            var user = await _userManager.FindByEmailAsync(
                request.Email.Trim());

            if (user == null || !user.IsActive)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(
                user,
                request.Password,
                lockoutOnFailure: true);

            if (!result.Succeeded)
            {
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
                .FirstOrDefaultAsync(
                    x => x.TokenHash == tokenHash);

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

            // Revoke previous refresh token.
            storedToken.RevokedAtUtc = DateTime.UtcNow;

            // Create replacement access and refresh tokens.
            var response = await CreateAuthResponseAsync(user);

            return Ok(response);
        }

        // ==========================================
        // LOGOUT
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

            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userId, out var parsedUserId))
            {
                return Unauthorized();
            }

            var tokenHash = _tokenService.HashRefreshToken(
                request.RefreshToken);

            var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(x =>
                    x.TokenHash == tokenHash &&
                    x.UserId == parsedUserId);

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

        private async Task<AuthResponseDto> CreateAuthResponseAsync(
            ApplicationUser user)
        {
            var accessToken = await _tokenService
                .GenerateAccessTokenAsync(user);

            var refreshToken = _tokenService
                .GenerateRefreshToken();

            var refreshTokenExpires = DateTime.UtcNow.AddDays(
                _jwtOptions.RefreshTokenDays);

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,

                TokenHash = _tokenService.HashRefreshToken(
                    refreshToken),

                ExpiresAtUtc = refreshTokenExpires
            });

            var roles = await _userManager.GetRolesAsync(user);

            var dashboards = await GetUserDashboardsAsync(user.Id);

            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                AccessToken = accessToken,

                AccessTokenExpiresAtUtc =
                    DateTime.UtcNow.AddMinutes(
                        _jwtOptions.AccessTokenMinutes),

                RefreshToken = refreshToken,

                RefreshTokenExpiresAtUtc = refreshTokenExpires,

                FullName =
                    $"{user.FirstName} {user.LastName}".Trim(),

                Email = user.Email ?? string.Empty,

                Roles = roles.ToList(),

                Dashboards = dashboards
            };
        }

        // ==========================================
        // GET USER DASHBOARDS
        // ==========================================

        private async Task<List<DashboardAssignmentDto>>
            GetUserDashboardsAsync(Guid userId)
        {
            var assignments = await _context.UserDepartmentPositions
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
                new DashboardAssignmentDto
                {
                    DepartmentId = a.DepartmentId,

                    DepartmentCode = a.Department!.Code,

                    DepartmentName = a.Department.Name,

                    PositionId = a.PositionId,

                    PositionName = a.Position!.Name,

                    DashboardKey = GetDepartmentSlug(
                        a.Department.Code) + "/" +
                        GetPositionSlug(a.Position.Name),

                    IsPrimary = a.IsPrimary

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
                _ => throw new InvalidOperationException(
                    $"No dashboard route configured for department: {code}")
            };
        }

        // ==========================================
        // POSITION ROUTE MAPPING
        // ==========================================

        private static string GetPositionSlug(string positionName)
        {
            return positionName.Trim().ToLowerInvariant() switch
            {
                "account manager" => "accountmanager",
                "sales officer" => "salesofficer",
                "department head" => "departmenthead",
                "design specialist" => "designspecialist",
                "it lead" => "itlead",
                "it staff" => "itstaff",

                _ => throw new InvalidOperationException(
                    $"No dashboard route configured for position: {positionName}")
            };
        }
    }
}
