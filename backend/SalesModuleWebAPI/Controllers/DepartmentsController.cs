
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalesModuleWebAPI.Data;
using SalesModuleWebAPI.DTOs.Departments;
using SalesModuleWebAPI.Models;


namespace SalesModuleWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DepartmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentResponseDto>>>
            GetDepartments()
        {
            var departments = await _context.Departments
                .Select(d => new DepartmentResponseDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    PositionCount = d.Positions.Count()
                })
                .OrderBy(d => d.Name)
                .ToListAsync();

            return Ok(departments);
        }

        // GET: api/departments/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<DepartmentResponseDto>>
            GetDepartment(Guid id)
        {
            var department = await _context.Departments
                .Where(d => d.Id == id)
                .Select(d => new DepartmentResponseDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    PositionCount = d.Positions.Count()
                })
                .FirstOrDefaultAsync();

            if (department == null)
                return NotFound(new
                {
                    message = "Department not found."
                });

            return Ok(department);
        }

        // POST: api/departments
        [HttpPost]
        public async Task<IActionResult> CreateDepartment(
            CreateDepartmentDto dto)
        {
            var code = dto.Code.Trim().ToUpperInvariant();

            bool codeExists = await _context.Departments
                .AnyAsync(d => d.Code == code);

            if (codeExists)
            {
                return Conflict(new
                {
                    message = "Department code already exists."
                });
            }

            var name = dto.Name.Trim();

            bool exists = await _context.Departments
                .AnyAsync(d => d.Name.ToLower() == name.ToLower());

            if (exists)
                return Conflict(new
                {
                    message = "Department already exists."
                });

            var department = new Department
            {
                Name = name,
                Description = dto.Description?.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Departments.Add(department);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetDepartment),
                new { id = department.Id },
                new DepartmentResponseDto
                {
                    Id = department.Id,
                    Name = department.Name,
                    Description = department.Description,
                    IsActive = department.IsActive,
                    CreatedAt = department.CreatedAt,
                    PositionCount = 0
                });
        }

        // PUT: api/departments/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateDepartment(
            Guid id,
            UpdateDepartmentDto dto)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
                return NotFound(new
                {
                    message = "Department not found."
                });

            var name = dto.Name.Trim();

            bool exists = await _context.Departments.AnyAsync(d =>
                d.Id != id &&
                d.Name.ToLower() == name.ToLower());

            if (exists)
                return Conflict(new
                {
                    message = "Department name already exists."
                });

            department.Name = name;
            department.Description = dto.Description?.Trim();
            department.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Department updated successfully."
            });
        }

        // DELETE: api/departments/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            var department = await _context.Departments
                .Include(d => d.Positions)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
                return NotFound(new
                {
                    message = "Department not found."
                });

            if (department.Positions.Any())
                return Conflict(new
                {
                    message = "Cannot delete department with existing positions. Deactivate it instead."
                });

            _context.Departments.Remove(department);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Department deleted successfully."
            });
        }
    }
}
