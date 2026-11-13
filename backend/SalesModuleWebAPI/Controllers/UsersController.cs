
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalesModuleWebAPI.Data;
using SalesModuleWebAPI.DTOs.UserAssignments;
using SalesModuleWebAPI.DTOs.Users;
using SalesModuleWebAPI.Models;

namespace SalesModuleWebAPI.Controllers
{
    [Authorize(Roles = "System Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public UsersController(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        // ==========================================
        // GET ALL USERS
        // GET: api/users
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            var result = new List<UserResponseDto>();

            foreach (var user in users)
            {
                result.Add(await MapUser(user));
            }

            return Ok(result);
        }

        // ==========================================
        // GET USER BY ID
        // GET: api/users/{id}
        // ==========================================

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(await MapUser(user));
        }

        // ==========================================
        // GET USER DEPARTMENT ASSIGNMENTS
        // GET: api/users/{id}/department-assignments
        // ==========================================

        [HttpGet("{id:guid}/department-assignments")]
        public async Task<IActionResult> GetDepartmentAssignments(
            Guid id)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == id);

            if (!userExists)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            var assignments = await _context.UserDepartmentPositions
                .Where(x => x.UserId == id)
                .Include(x => x.Department)
                .Include(x => x.Position)
                .Select(x => new UserDepartmentPositionDto
                {
                    Id = x.Id,
                    DepartmentId = x.DepartmentId,
                    DepartmentCode = x.Department!.Code,
                    DepartmentName = x.Department.Name,
                    PositionId = x.PositionId,
                    PositionName = x.Position!.Name,
                    IsPrimary = x.IsPrimary,
                    IsActive = x.IsActive,
                    AssignedAtUtc = x.AssignedAtUtc
                })
                .ToListAsync();

            return Ok(assignments);
        }

        // ==========================================
        // CREATE USER
        // POST: api/users
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> CreateUser(
            [FromBody] CreateUserDto dto)
        {
            var email = dto.Email.Trim();

            // Check duplicate email.
            var existingUser = await _userManager
                .FindByEmailAsync(email);

            if (existingUser != null)
            {
                return Conflict(new
                {
                    message = "Email already exists."
                });
            }

            // Validate roles.
            var roleNames = (dto.Roles ?? new List<string>())
                .Select(r => r.Trim())
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var role in roleNames)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    return BadRequest(new
                    {
                        message = $"Role '{role}' does not exist."
                    });
                }
            }

            // Prepare user.
            var userId = Guid.NewGuid();

            var user = new ApplicationUser
            {
                Id = userId,
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                UserName = email,
                Email = email,
                IsActive = true,
                EmailConfirmed = false,
                LockoutEnabled = true,
                CreatedAt = DateTime.UtcNow
            };

            // Validate department and position assignments.
            var (assignments, assignmentError) =
                await ValidateAndBuildAssignments(
                    userId,
                    dto.Assignments);

            if (assignmentError != null)
            {
                return BadRequest(new
                {
                    message = assignmentError
                });
            }

            // Create user and assignments in one transaction.
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var createResult = await _userManager.CreateAsync(
                    user,
                    dto.Password);

                if (!createResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        errors = createResult.Errors.Select(
                            e => e.Description)
                    });
                }

                // Assign roles.
                if (roleNames.Any())
                {
                    var roleResult = await _userManager.AddToRolesAsync(
                        user,
                        roleNames);

                    if (!roleResult.Succeeded)
                    {
                        await transaction.RollbackAsync();

                        return BadRequest(new
                        {
                            errors = roleResult.Errors.Select(
                                e => e.Description)
                        });
                    }
                }

                // Save department assignments.
                if (assignments.Any())
                {
                    _context.UserDepartmentPositions.AddRange(
                        assignments);

                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                return CreatedAtAction(
                    nameof(GetUser),
                    new { id = user.Id },
                    await MapUser(user));
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ==========================================
        // UPDATE USER
        // PUT: api/users/{id}
        // ==========================================

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateUser(
            Guid id,
            [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(
                id.ToString());

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            var email = dto.Email.Trim();

            // Check duplicate email.
            var existingEmail = await _userManager
                .FindByEmailAsync(email);

            if (existingEmail != null &&
                existingEmail.Id != id)
            {
                return Conflict(new
                {
                    message = "Email already exists."
                });
            }

            // Protect the last active System Admin.
            if (!dto.IsActive && user.IsActive)
            {
                var roles = await _userManager.GetRolesAsync(user);

                if (roles.Contains(
                    "System Admin",
                    StringComparer.OrdinalIgnoreCase))
                {
                    var administrators = await _userManager
                        .GetUsersInRoleAsync("System Admin");

                    var otherActiveAdmins = administrators.Count(x =>
                        x.Id != user.Id && x.IsActive);

                    if (otherActiveAdmins == 0)
                    {
                        return Conflict(new
                        {
                            message =
                                "Cannot deactivate the last active System Admin."
                        });
                    }
                }
            }

            // Update email.
            if (user.Email != email)
            {
                var emailResult = await _userManager.SetEmailAsync(
                    user,
                    email);

                if (!emailResult.Succeeded)
                {
                    return BadRequest(new
                    {
                        errors = emailResult.Errors.Select(
                            e => e.Description)
                    });
                }
            }

            // Synchronize username with email.
            if (user.UserName != email)
            {
                var usernameResult = await _userManager
                    .SetUserNameAsync(user, email);

                if (!usernameResult.Succeeded)
                {
                    return BadRequest(new
                    {
                        errors = usernameResult.Errors.Select(
                            e => e.Description)
                    });
                }
            }

            // Update user details.
            user.FirstName = dto.FirstName.Trim();
            user.LastName = dto.LastName.Trim();
            user.IsActive = dto.IsActive;

            // Prevent inactive users from signing in.
            user.LockoutEnabled = true;

            user.LockoutEnd = dto.IsActive
                ? null
                : DateTimeOffset.MaxValue;

            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
            {
                return BadRequest(new
                {
                    errors = updateResult.Errors.Select(
                        e => e.Description)
                });
            }

            // Invalidate previously issued security-stamp-based sessions.
            await _userManager.UpdateSecurityStampAsync(user);

            return Ok(await MapUser(user));
        }

        // ==========================================
        // UPDATE USER ROLES
        // PUT: api/users/{id}/roles
        // ==========================================

        [HttpPut("{id:guid}/roles")]
        public async Task<IActionResult> UpdateUserRoles(
            Guid id,
            [FromBody] UpdateUserRolesDto dto)
        {
            var user = await _userManager.FindByIdAsync(
                id.ToString());

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            var requestedRoles = (dto.Roles ?? new List<string>())
                .Select(r => r.Trim())
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // Validate roles.
            foreach (var role in requestedRoles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    return BadRequest(new
                    {
                        message = $"Role '{role}' does not exist."
                    });
                }
            }

            var currentRoles = await _userManager.GetRolesAsync(user);

            // Prevent removal of the last System Admin.
            bool currentlyAdmin = currentRoles.Any(r =>
                r.Equals(
                    "System Admin",
                    StringComparison.OrdinalIgnoreCase));

            bool remainsAdmin = requestedRoles.Any(r =>
                r.Equals(
                    "System Admin",
                    StringComparison.OrdinalIgnoreCase));

            if (currentlyAdmin && !remainsAdmin)
            {
                var adminUsers = await _userManager
                    .GetUsersInRoleAsync("System Admin");

                if (adminUsers.Count <= 1)
                {
                    return Conflict(new
                    {
                        message = "Cannot remove the last System Admin."
                    });
                }
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var removeResult = await _userManager
                    .RemoveFromRolesAsync(user, currentRoles);

                if (!removeResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        errors = removeResult.Errors.Select(
                            e => e.Description)
                    });
                }

                var addResult = await _userManager
                    .AddToRolesAsync(user, requestedRoles);

                if (!addResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        errors = addResult.Errors.Select(
                            e => e.Description)
                    });
                }

                await _userManager.UpdateSecurityStampAsync(user);

                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "User roles updated successfully.",
                    roles = requestedRoles
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ==========================================
        // UPDATE DEPARTMENT ASSIGNMENTS
        // PUT: api/users/{id}/department-assignments
        // ==========================================

        [HttpPut("{id:guid}/department-assignments")]
        public async Task<IActionResult> UpdateDepartmentAssignments(
            Guid id,
            [FromBody] UpdateUserAssignmentsDto request)
        {
            var user = await _userManager.FindByIdAsync(
                id.ToString());

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            if (request.Assignments == null)
            {
                return BadRequest(new
                {
                    message = "Assignments are required."
                });
            }

            var (validatedAssignments, assignmentError) =
                await ValidateAndBuildAssignments(
                    id,
                    request.Assignments);

            if (assignmentError != null)
            {
                return BadRequest(new
                {
                    message = assignmentError
                });
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var existingAssignments = await _context
                    .UserDepartmentPositions
                    .Where(x => x.UserId == id)
                    .ToListAsync();

                _context.UserDepartmentPositions.RemoveRange(
                    existingAssignments);

                _context.UserDepartmentPositions.AddRange(
                    validatedAssignments);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    message =
                        "Department assignments updated successfully.",

                    assignmentCount = validatedAssignments.Count
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ==========================================
        // UPDATE USER STATUS
        // PATCH: api/users/{id}/status
        // ==========================================

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateUserStatus(
            Guid id,
            [FromBody] bool isActive)
        {
            var user = await _userManager.FindByIdAsync(
                id.ToString());

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            // Protect the last active System Admin.
            if (!isActive && user.IsActive)
            {
                var roles = await _userManager.GetRolesAsync(user);

                if (roles.Contains(
                    "System Admin",
                    StringComparer.OrdinalIgnoreCase))
                {
                    var administrators = await _userManager
                        .GetUsersInRoleAsync("System Admin");

                    var otherActiveAdmins = administrators.Count(x =>
                        x.Id != user.Id && x.IsActive);

                    if (otherActiveAdmins == 0)
                    {
                        return Conflict(new
                        {
                            message =
                                "Cannot deactivate the last active System Admin."
                        });
                    }
                }
            }

            user.IsActive = isActive;
            user.LockoutEnabled = true;

            user.LockoutEnd = isActive
                ? null
                : DateTimeOffset.MaxValue;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    errors = result.Errors.Select(
                        e => e.Description)
                });
            }

            await _userManager.UpdateSecurityStampAsync(user);

            return Ok(new
            {
                message = isActive
                    ? "User activated successfully."
                    : "User deactivated successfully."
            });
        }

        // ==========================================
        // RESET PASSWORD
        // POST: api/users/{id}/reset-password
        // ==========================================

        [HttpPost("{id:guid}/reset-password")]
        public async Task<IActionResult> ResetPassword(
            Guid id,
            [FromBody] string newPassword)
        {
            if (string.IsNullOrWhiteSpace(newPassword))
            {
                return BadRequest(new
                {
                    message = "New password is required."
                });
            }

            var user = await _userManager.FindByIdAsync(
                id.ToString());

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            var token = await _userManager
                .GeneratePasswordResetTokenAsync(user);

            var result = await _userManager.ResetPasswordAsync(
                user,
                token,
                newPassword);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    errors = result.Errors.Select(
                        e => e.Description)
                });
            }

            return Ok(new
            {
                message = "Password reset successfully."
            });
        }

        // ==========================================
        // VALIDATE AND BUILD ASSIGNMENTS
        // ==========================================

        private async Task<(
            List<UserDepartmentPosition> Assignments,
            string? Error)> ValidateAndBuildAssignments(
                Guid userId,
                List<UserAssignmentItemDto>? assignments)
        {
            var result = new List<UserDepartmentPosition>();

            assignments ??= new List<UserAssignmentItemDto>();

            // Prevent duplicate department-position combinations.
            if (assignments.GroupBy(x => new
            {
                x.DepartmentId,
                x.PositionId
            })
                .Any(group => group.Count() > 1))
            {
                return (result,
                    "Duplicate assignments are not allowed.");
            }

            // Require exactly one primary assignment.
            if (assignments.Any() &&
                assignments.Count(x => x.IsPrimary) != 1)
            {
                return (result,
                    "Exactly one primary department assignment is required.");
            }

            foreach (var item in assignments)
            {
                // Validate department.
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d =>
                        d.Id == item.DepartmentId &&
                        d.IsActive);

                if (department == null)
                {
                    return (result,
                        $"Department '{item.DepartmentId}' is invalid or inactive.");
                }

                // Validate position belongs to department.
                var position = await _context.Positions
                    .FirstOrDefaultAsync(p =>
                        p.Id == item.PositionId &&
                        p.DepartmentId == item.DepartmentId &&
                        p.IsActive);

                if (position == null)
                {
                    return (result,
                        $"Position does not belong to department " +
                        $"'{department.Name}' or is inactive.");
                }

                result.Add(new UserDepartmentPosition
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    DepartmentId = department.Id,
                    PositionId = position.Id,
                    IsPrimary = item.IsPrimary,
                    IsActive = true,
                    AssignedAtUtc = DateTime.UtcNow
                });
            }

            return (result, null);
        }

        // ==========================================
        // MAP USER TO RESPONSE DTO
        // SINGLE IMPLEMENTATION ONLY
        // ==========================================

        private async Task<UserResponseDto> MapUser(
            ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var assignments = await _context.UserDepartmentPositions
                .Where(x => x.UserId == user.Id)
                .Include(x => x.Department)
                .Include(x => x.Position)
                .OrderByDescending(x => x.IsPrimary)
                .Select(x => new UserDepartmentPositionDto
                {
                    Id = x.Id,
                    DepartmentId = x.DepartmentId,
                    DepartmentCode = x.Department!.Code,
                    DepartmentName = x.Department.Name,
                    PositionId = x.PositionId,
                    PositionName = x.Position!.Name,
                    IsPrimary = x.IsPrimary,
                    IsActive = x.IsActive,
                    AssignedAtUtc = x.AssignedAtUtc
                })
                .ToListAsync();

            return new UserResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email ?? string.Empty,
                Roles = roles.ToList(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                DepartmentAssignments = assignments
            };
        }
    }
}
