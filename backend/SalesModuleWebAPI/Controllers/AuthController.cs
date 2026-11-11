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

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginRequestDto request)
        {
            var user = await _userManager.FindByEmailAsync(
                request.Email.Trim());

            if (user == null || !user.IsActive)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var result = await _signInManager
                .CheckPasswordSignInAsync(
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

            return Ok(await CreateAuthResponseAsync(user));
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(
            RefreshTokenRequestDto request)
        {
            var tokenHash = _tokenService.HashRefreshToken(
                request.RefreshToken);

            var storedToken = await _context.RefreshTokens
                .Include(x => x.User)
                .FirstOrDefaultAsync(x =>
                    x.TokenHash == tokenHash);

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

            // Rotate the refresh token.
            storedToken.RevokedAtUtc = DateTime.UtcNow;

            var response = await CreateAuthResponseAsync(user);

            await _context.SaveChangesAsync();

            return Ok(response);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(
            RefreshTokenRequestDto request)
        {
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

        private async Task<AuthResponseDto> CreateAuthResponseAsync(
            ApplicationUser user)
        {
            var accessToken = await _tokenService
                .GenerateAccessTokenAsync(user);

            var refreshToken = _tokenService
                .GenerateRefreshToken();

            var refreshTokenExpires =
                DateTime.UtcNow.AddDays(
                    _jwtOptions.RefreshTokenDays);

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = _tokenService.HashRefreshToken(
                    refreshToken),
                ExpiresAtUtc = refreshTokenExpires
            });

            var roles = await _userManager.GetRolesAsync(user);

            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                AccessTokenExpiresAtUtc =
                    DateTime.UtcNow.AddMinutes(
                        _jwtOptions.AccessTokenMinutes),

                RefreshToken = refreshToken,
                RefreshTokenExpiresAtUtc = refreshTokenExpires,

                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email ?? string.Empty,
                Roles = roles.ToList()
            };
        }
    }
}
