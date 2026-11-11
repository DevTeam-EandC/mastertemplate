
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SalesModuleWebAPI.DTOs.Roles;
using SalesModuleWebAPI.Models;


namespace SalesModuleWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "System Admin")]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private const string ProtectedRole = "System Admin";

        public RolesController(
            RoleManager<ApplicationRole> roleManager,
            UserManager<ApplicationUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        // GET: api/roles

        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = _roleManager.Roles
                .OrderBy(r => r.Name ?? string.Empty)
                .ToList();

            var result = new List<RoleResponseDto>();

            foreach (var role in roles)
            {
                if (string.IsNullOrEmpty(role.Name))
                    continue;

                var users = await _userManager.GetUsersInRoleAsync(role.Name);

                result.Add(new RoleResponseDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = role.Description,
                    UserCount = users.Count
                });
            }

            return Ok(result);
        }

        // GET: api/roles/{id}

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetRole(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role == null)
            {
                return NotFound(new
                {
                    message = "Role not found."
                });
            }

            var users = await _userManager.GetUsersInRoleAsync(role.Name!);

            return Ok(new RoleResponseDto
            {
                Id = role.Id,
                Name = role.Name!,
                Description = role.Description,
                UserCount = users.Count
            });
        }

        // POST: api/roles

        [HttpPost]
        public async Task<IActionResult> CreateRole(
            CreateRoleDto dto)
        {
            var name = dto.Name.Trim();

            var existing = await _roleManager
                .FindByNameAsync(name);

            if (existing != null)
            {
                return Conflict(new
                {
                    message = "Role already exists."
                });
            }

            var role = new ApplicationRole
            {
                Name = name,
                Description = dto.Description?.Trim()
            };

            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return CreatedAtAction(
                nameof(GetRole),
                new { id = role.Id },
                new RoleResponseDto
                {
                    Id = role.Id,
                    Name = role.Name!,
                    Description = role.Description,
                    UserCount = 0
                });
        }

        // PUT: api/roles/{id}

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateRole(
            Guid id,
            UpdateRoleDto dto)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role == null)
            {
                return NotFound(new
                {
                    message = "Role not found."
                });
            }

            if (string.Equals(
                role.Name,
                ProtectedRole,
                StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "System Admin role cannot be modified."
                });
            }

            var name = dto.Name.Trim();

            var existing = await _roleManager.FindByNameAsync(name);

            if (existing != null && existing.Id != id)
            {
                return Conflict(new
                {
                    message = "Role name already exists."
                });
            }

            role.Name = name;
            role.Description = dto.Description?.Trim();

            var result = await _roleManager.UpdateAsync(role);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return Ok(new
            {
                message = "Role updated successfully."
            });
        }

        // DELETE: api/roles/{id}

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role == null)
            {
                return NotFound(new
                {
                    message = "Role not found."
                });
            }

            if (string.Equals(
                role.Name,
                ProtectedRole,
                StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "System Admin role cannot be deleted."
                });
            }

            var users = await _userManager.GetUsersInRoleAsync(role.Name!);

            if (users.Any())
            {
                return Conflict(new
                {
                    message = "Cannot delete a role assigned to users. Reassign users first."
                });
            }

            var result = await _roleManager.DeleteAsync(role);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return Ok(new
            {
                message = "Role deleted successfully."
            });
        }
    }
}
