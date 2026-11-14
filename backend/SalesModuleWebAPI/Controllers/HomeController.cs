
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SalesModuleWebAPI.Data;
using SalesModuleWebAPI.DTOs.Dashboard;

namespace SalesModuleWebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public DashboardController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(
        [FromQuery] Guid departmentId,
        [FromQuery] Guid positionId,
        CancellationToken cancellationToken)
    {
        // Get the authenticated user's ID from the JWT.
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        // Confirm that the department and position are valid and active.
        var position = await _db.Positions
            .AsNoTracking()
            .FirstOrDefaultAsync(
                p => p.Id == positionId
                     && p.DepartmentId == departmentId
                     && p.IsActive
                     && p.Department != null
                     && p.Department.IsActive,
                cancellationToken);

        if (position == null)
        {
            return NotFound(new
            {
                message = "The requested department or position was not found or is inactive."
            });
        }

        // Never trust departmentId and positionId supplied by the frontend.
        // Verify the authenticated user has this exact active assignment.
        var hasAssignment = await _db.UserDepartmentPositions
            .AsNoTracking()
            .AnyAsync(
                a => a.UserId == userId
                     && a.DepartmentId == departmentId
                     && a.PositionId == positionId
                     && a.IsActive
                     && a.User != null
                     && a.User.IsActive,
                cancellationToken);

        if (!hasAssignment)
        {
            return Forbid();
        }

        // Count distinct active users assigned to this department.
        var employeeCount = await _db.UserDepartmentPositions
            .AsNoTracking()
            .Where(a =>
                a.DepartmentId == departmentId
                && a.IsActive
                && a.User != null
                && a.User.IsActive)
            .Select(a => a.UserId)
            .Distinct()
            .CountAsync(cancellationToken);

        var dashboardKey = GetDashboardKey(
            position.Department!.Code,
            position.Name);

        var result = new DashboardSummaryDto
        {
            Metrics = BuildMetrics(dashboardKey, employeeCount),
            RecentActivities = new List<DashboardActivityDto>()
        };

        return Ok(result);
    }

    private static Dictionary<string, int> BuildMetrics(
        string dashboardKey,
        int employeeCount)
    {
        return dashboardKey switch
        {
            "Sales/AccountManager" => new()
            {
                ["myCustomers"] = 0,
                ["activeAccounts"] = 0,
                ["pendingQuotations"] = 0,
                ["salesActivities"] = 0
            },

            "Sales/SalesOfficer" => new()
            {
                ["myActivities"] = 0,
                ["customerFollowUps"] = 0,
                ["salesRecords"] = 0,
                ["pendingTasks"] = 0
            },

            "Design/DepartmentHead" => new()
            {
                ["designEmployees"] = employeeCount,
                ["designProjects"] = 0,
                ["pendingApprovals"] = 0,
                ["departmentTasks"] = 0
            },

            "Design/DesignSpecialist" => new()
            {
                ["myProjects"] = 0,
                ["myTasks"] = 0,
                ["pendingRevisions"] = 0,
                ["completedDesigns"] = 0
            },

            "IT/DepartmentHead" => new()
            {
                ["itEmployees"] = employeeCount,
                ["itRequests"] = 0,
                ["pendingTasks"] = 0,
                ["equipmentRecords"] = 0
            },

            "IT/ITLead" => new()
            {
                ["teamTasks"] = 0,
                ["technicalRequests"] = 0,
                ["systemIssues"] = 0,
                ["pendingAssignments"] = 0
            },

            _ => new()
        };
    }

    private static string GetDashboardKey(
        string departmentCode,
        string positionName)
    {
        var department = departmentCode.ToUpperInvariant() switch
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
            _ => departmentCode
        };

        var position = positionName.Trim().ToLowerInvariant() switch
        {
            "account manager" => "AccountManager",
            "sales officer" => "SalesOfficer",
            "department head" => "DepartmentHead",
            "design specialist" => "DesignSpecialist",
            "it lead" => "ITLead",
            "it staff" => "ITStaff",
            _ => string.Empty
        };

        return string.IsNullOrEmpty(position)
            ? string.Empty
            : $"{department}/{position}";
    }
}
