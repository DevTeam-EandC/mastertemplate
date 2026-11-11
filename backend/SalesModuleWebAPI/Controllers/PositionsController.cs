
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalesModuleWebAPI.Data;
using SalesModuleWebAPI.DTOs.Positions;
using SalesModuleWebAPI.Models;
using SalesModuleWebAPI.DTOs.UserAssignments;

namespace SalesModuleWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PositionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PositionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/positions
        // GET: api/positions?departmentId={guid}
        // GET: api/positions?departmentId={guid}&activeOnly=true

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PositionResponseDto>>>
            GetPositions(
                [FromQuery] Guid? departmentId,
                [FromQuery] bool activeOnly = false)
        {
            var query = _context.Positions
                .Include(p => p.Department)
                .AsQueryable();

            if (departmentId.HasValue)
            {
                query = query.Where(p =>
                    p.DepartmentId == departmentId.Value);
            }

            if (activeOnly)
            {
                query = query.Where(p => p.IsActive);
            }

            var positions = await query
                .OrderBy(p => p.Department!.Name)
                .ThenBy(p => p.Name)
                .Select(p => new PositionResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    DepartmentId = p.DepartmentId,
                    DepartmentCode = p.Department!.Code,
                    DepartmentName = p.Department.Name,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(positions);
        }

        // GET: api/positions/{id}

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<PositionResponseDto>>
            GetPosition(Guid id)
        {
            var position = await _context.Positions
                .Where(p => p.Id == id)
                .Select(p => new PositionResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    DepartmentId = p.DepartmentId,
                    DepartmentCode = p.Department!.Code,
                    DepartmentName = p.Department.Name,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (position == null)
            {
                return NotFound(new
                {
                    message = "Position not found."
                });
            }

            return Ok(position);
        }

        // POST: api/positions

        [HttpPost]
        public async Task<IActionResult> CreatePosition(
            CreatePositionDto dto)
        {
            var name = dto.Name.Trim();

            var department = await _context.Departments
                .FirstOrDefaultAsync(d =>
                    d.Id == dto.DepartmentId &&
                    d.IsActive);

            if (department == null)
            {
                return BadRequest(new
                {
                    message = "Department does not exist or is inactive."
                });
            }

            bool exists = await _context.Positions.AnyAsync(p =>
                p.DepartmentId == dto.DepartmentId &&
                p.Name.ToLower() == name.ToLower());

            if (exists)
            {
                return Conflict(new
                {
                    message = "Position already exists in this department."
                });
            }

            var position = new Position
            {
                Name = name,
                Description = dto.Description?.Trim(),
                DepartmentId = dto.DepartmentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Positions.Add(position);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPosition),
                new { id = position.Id },
                new PositionResponseDto
                {
                    Id = position.Id,
                    Name = position.Name,
                    Description = position.Description,
                    DepartmentId = department.Id,
                    DepartmentCode = department.Code,
                    DepartmentName = department.Name,
                    IsActive = position.IsActive,
                    CreatedAt = position.CreatedAt
                });
        }

        // PUT: api/positions/{id}

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdatePosition(
            Guid id,
            UpdatePositionDto dto)
        {
            var position = await _context.Positions
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null)
            {
                return NotFound(new
                {
                    message = "Position not found."
                });
            }

            var department = await _context.Departments
                .FirstOrDefaultAsync(d =>
                    d.Id == dto.DepartmentId &&
                    d.IsActive);

            if (department == null)
            {
                return BadRequest(new
                {
                    message = "Department does not exist or is inactive."
                });
            }

            var name = dto.Name.Trim();

            bool exists = await _context.Positions.AnyAsync(p =>
                p.Id != id &&
                p.DepartmentId == dto.DepartmentId &&
                p.Name.ToLower() == name.ToLower());

            if (exists)
            {
                return Conflict(new
                {
                    message = "Position already exists in this department."
                });
            }

            position.Name = name;
            position.Description = dto.Description?.Trim();
            position.DepartmentId = dto.DepartmentId;
            position.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Position updated successfully."
            });
        }

        // DELETE: api/positions/{id}

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeletePosition(Guid id)
        {
            var position = await _context.Positions
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null)
            {
                return NotFound(new
                {
                    message = "Position not found."
                });
            }

            bool assignedToUsers = await _context.UserDepartmentPositions
                .AnyAsync(assignment => assignment.PositionId == id);

            if (assignedToUsers)
            {
                return Conflict(new
                {
                    message = "Position is assigned to users. Deactivate it instead."
                });
            }

            _context.Positions.Remove(position);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Position deleted successfully."
            });
        }
    }
}
