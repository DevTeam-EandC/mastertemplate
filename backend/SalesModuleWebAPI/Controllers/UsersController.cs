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

        // GET: api/users

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.DepartmentAssignments)
                    .ThenInclude(assignment => assignment.Department)
                .Include(u => u.DepartmentAssignments)
                    .ThenInclude(assignment => assignment.Position)
                .OrderBy(u => u.FirstName)
                .ToListAsync();

            var result = new List<UserResponseDto>();

            foreach (var user in users)
            {
                result.Add(await MapUser(user));
            }

            return Ok(result);
        }

        // GET: api/users/{id}

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await _context.Users
                .Include(u => u.DepartmentAssignments)
                    .ThenInclude(assignment => assignment.Department)
                .Include(u => u.DepartmentAssignments)
                    .ThenInclude(assignment => assignment.Position)
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

        // GET: api/users/{id}/department-assignments

        [HttpGet("{id:guid}/department-assignments")]
        public async Task<IActionResult> GetDepartmentAssignments(Guid id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "User not found." });

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

        // POST: api/users

        [HttpPost]
        public async Task<IActionResult> CreateUser(
            CreateUserDto dto)
        {
            var email = dto.Email.Trim();

            if (await _userManager.FindByEmailAsync(email) != null)
            {
                return Conflict(new
                {
                    message = "Email already exists."
                });
            }

            var validation = await ValidateAssignment(
                dto.DepartmentId, dto.PositionId);

            if (validation != null)
                return BadRequest(new { message = validation });

            var roleNames = dto.Roles
                .Select(r => r.Trim())
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

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                UserName = email,
                Email = email,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(
                user, dto.Password);

            if (!createResult.Succeeded)
            {
                return BadRequest(new
                {
                    errors = createResult.Errors.Select(
                        e => e.Description)
                });
            }

            if (roleNames.Any())
            {
                var roleResult = await _userManager.AddToRolesAsync(
                    user, roleNames);

                if (!roleResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);

                    return BadRequest(new
                    {
                        errors = roleResult.Errors.Select(
                            e => e.Description)
                    });
                }
            }

            if (dto.DepartmentId.HasValue)
            {
                _context.UserDepartmentPositions.Add(
                    new UserDepartmentPosition
                    {
                        UserId = user.Id,
                        DepartmentId = dto.DepartmentId.Value,
                        PositionId = dto.PositionId!.Value,
                        IsPrimary = true
                    });

                await _context.SaveChangesAsync();
            }

            var createdUser = await _context.Users
                .Include(u => u.DepartmentAssignments)
                    .ThenInclude(assignment => assignment.Department)
                .Include(u => u.DepartmentAssignments)
                    .ThenInclude(assignment => assignment.Position)
                .FirstAsync(u => u.Id == user.Id);

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                await MapUser(createdUser));
        }

        // PUT: api/users/{id}

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateUser(
            Guid id,
            UpdateUserDto dto)
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

            var email = dto.Email.Trim();

            var existingEmail = await _userManager
                .FindByEmailAsync(email);

            if (existingEmail != null && existingEmail.Id != id)
            {
                return Conflict(new
                {
                    message = "Email already exists."
                });
            }

            var validation = await ValidateAssignment(
                dto.DepartmentId, dto.PositionId);

            if (validation != null)
                return BadRequest(new { message = validation });

            user.FirstName = dto.FirstName.Trim();
            user.LastName = dto.LastName.Trim();
            user.IsActive = dto.IsActive;

            var emailResult = await _userManager.SetEmailAsync(
                user, email);

            if (!emailResult.Succeeded)
                return BadRequest(new
                {
                    errors = emailResult.Errors.Select(e => e.Description)
                });

            var usernameResult = await _userManager.SetUserNameAsync(
                user, email);

            if (!usernameResult.Succeeded)
                return BadRequest(new
                {
                    errors = usernameResult.Errors.Select(e => e.Description)
                });

            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
                return BadRequest(new
                {
                    errors = updateResult.Errors.Select(e => e.Description)
                });

            var existingAssignments = await _context.UserDepartmentPositions
                .Where(assignment => assignment.UserId == user.Id)
                .ToListAsync();

            _context.UserDepartmentPositions.RemoveRange(existingAssignments);

            if (dto.DepartmentId.HasValue)
            {
                _context.UserDepartmentPositions.Add(
                    new UserDepartmentPosition
                    {
                        UserId = user.Id,
                        DepartmentId = dto.DepartmentId.Value,
                        PositionId = dto.PositionId!.Value,
                        IsPrimary = true
                    });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User updated successfully."
            });
        }

        // PUT: api/users/{id}/roles

        [HttpPut("{id:guid}/roles")]
        public async Task<IActionResult> UpdateUserRoles(
            Guid id,
            UpdateUserRolesDto dto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
                return NotFound(new { message = "User not found." });

            var requestedRoles = dto.Roles
                .Select(r => r.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

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

            bool currentlyAdmin = currentRoles.Any(r =>
                r.Equals("System Admin",
                    StringComparison.OrdinalIgnoreCase));

            bool remainsAdmin = requestedRoles.Any(r =>
                r.Equals("System Admin",
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

            var removeResult = await _userManager.RemoveFromRolesAsync(
                user, currentRoles);

            if (!removeResult.Succeeded)
            {
                return BadRequest(new
                {
                    errors = removeResult.Errors.Select(e => e.Description)
                });
            }

            var addResult = await _userManager.AddToRolesAsync(
                user, requestedRoles);

            if (!addResult.Succeeded)
            {
                await _userManager.AddToRolesAsync(user, currentRoles);

                return BadRequest(new
                {
                    errors = addResult.Errors.Select(e => e.Description)
                });
            }

            return Ok(new
            {
                message = "User roles updated successfully."
            });
        }

        // PUT: api/users/{id}/department-assignments

        [HttpPut("{id:guid}/department-assignments")]
        public async Task<IActionResult> UpdateDepartmentAssignments(
            Guid id,
            UpdateUserAssignmentsDto request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
                return NotFound("User not found.");

            if (request.Assignments == null)
                return BadRequest("Assignments are required.");

            var assignments = request.Assignments;

            if (assignments.GroupBy(x => new
            {
                x.DepartmentId,
                x.PositionId
            }).Any(g => g.Count() > 1))
            {
                return BadRequest("Duplicate assignments are not allowed.");
            }

            if (assignments.Count > 0 &&
                assignments.Count(x => x.IsPrimary) != 1)
            {
                return BadRequest(
                    "Exactly one primary assignment is required.");
            }

            var validatedAssignments =
                new List<UserDepartmentPosition>();

            foreach (var item in assignments)
            {
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d =>
                        d.Id == item.DepartmentId &&
                        d.IsActive);

                if (department == null)
                    return BadRequest("Invalid or inactive department.");

                var position = await _context.Positions
                    .FirstOrDefaultAsync(p =>
                        p.Id == item.PositionId &&
                        p.DepartmentId == item.DepartmentId &&
                        p.IsActive);

                if (position == null)
                {
                    return BadRequest(
                        $"The selected position does not belong to " +
                        $"{department.Name} or is inactive.");
                }

                validatedAssignments.Add(new UserDepartmentPosition
                {
                    UserId = id,
                    DepartmentId = item.DepartmentId,
                    PositionId = item.PositionId,
                    IsPrimary = item.IsPrimary,
                    IsActive = true
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
                    message = "Department assignments updated successfully.",
                    assignmentCount = validatedAssignments.Count
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // PATCH: api/users/{id}/status

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateUserStatus(
            Guid id,
            [FromBody] bool isActive)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (!isActive)
            {
                var roles = await _userManager.GetRolesAsync(user);

                if (roles.Contains("System Admin",
                    StringComparer.OrdinalIgnoreCase))
                {
                    var admins = await _userManager
                        .GetUsersInRoleAsync("System Admin");

                    if (admins.Count <= 1)
                        return Conflict(new
                        {
                            message = "Cannot deactivate the last System Admin."
                        });
                }
            }

            user.IsActive = isActive;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(new
                {
                    errors = result.Errors.Select(e => e.Description)
                });

            return Ok(new
            {
                message = isActive
                    ? "User activated successfully."
                    : "User deactivated successfully."
            });
        }

        // POST: api/users/{id}/reset-password

        [HttpPost("{id:guid}/reset-password")]
        public async Task<IActionResult> ResetPassword(
            Guid id,
            [FromBody] string newPassword)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
                return NotFound(new { message = "User not found." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(
                user);

            var result = await _userManager.ResetPasswordAsync(
                user, token, newPassword);

            if (!result.Succeeded)
                return BadRequest(new
                {
                    errors = result.Errors.Select(e => e.Description)
                });

            return Ok(new
            {
                message = "Password reset successfully."
            });
        }

        private async Task<string?> ValidateAssignment(
            Guid? departmentId,
            Guid? positionId)
        {
            if (positionId.HasValue && !departmentId.HasValue)
                return "A department is required when assigning a position.";

            if (departmentId.HasValue && !positionId.HasValue)
                return "A position is required when assigning a department.";

            if (departmentId.HasValue)
            {
                bool departmentExists = await _context.Departments
                    .AnyAsync(d =>
                        d.Id == departmentId.Value &&
                        d.IsActive);

                if (!departmentExists)
                    return "Department does not exist or is inactive.";
            }

            if (positionId.HasValue)
            {
                bool positionExists = await _context.Positions
                    .AnyAsync(p =>
                        p.Id == positionId.Value &&
                        p.DepartmentId == departmentId &&
                        p.IsActive);

                if (!positionExists)
                    return "Position does not belong to the selected department or is inactive.";
            }

            return null;
        }

        private async Task<UserResponseDto> MapUser(
            ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            return new UserResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email ?? "",
                DepartmentAssignments = user.DepartmentAssignments
                    .Select(assignment => new UserDepartmentPositionDto
                    {
                        Id = assignment.Id,
                        DepartmentId = assignment.DepartmentId,
                        DepartmentCode = assignment.Department!.Code,
                        DepartmentName = assignment.Department.Name,
                        PositionId = assignment.PositionId,
                        PositionName = assignment.Position!.Name,
                        IsPrimary = assignment.IsPrimary,
                        IsActive = assignment.IsActive,
                        AssignedAtUtc = assignment.AssignedAtUtc
                    })
                    .ToList(),
                Roles = roles.ToList(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
