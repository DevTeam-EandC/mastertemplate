using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyModuleApi.Data;
using CompanyModuleApi.DTOs.ClientProfiles;
using CompanyModuleApi.Models;

namespace CompanyModuleApi.Controllers;

// Clients and their projects, captured by Sales Account Managers and read by Design Specialists.
// A client is registered once; each project for that client is added separately.
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientProfilesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ClientProfilesController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET api/ClientProfiles/options
    [HttpGet("options")]
    public async Task<ActionResult<ClientProfileOptionsDto>> GetOptions(
        CancellationToken cancellationToken)
    {
        if (!await IsAccountManagerAsync(cancellationToken))
        {
            return Forbid();
        }

        // Distinct runs in the database. A DTO has no value equality, so
        // a client-side Distinct would keep duplicate officers.
        var officerRows = await _db.UserDepartmentPositions
            .AsNoTracking()
            .Where(a =>
                a.IsActive &&
                a.Department!.Code == ClientProfileOptions.SalesDepartmentCode &&
                a.Position!.Name == ClientProfileOptions.SalesOfficerPosition &&
                a.User != null &&
                a.User.IsActive)
            .Select(a => new { a.UserId, a.User!.FirstName, a.User.LastName })
            .Distinct()
            .ToListAsync(cancellationToken);

        var salesOfficers = officerRows
            .Select(o => new SalesOfficerOptionDto
            {
                UserId = o.UserId,
                FullName = $"{o.FirstName} {o.LastName}".Trim()
            })
            .OrderBy(o => o.FullName)
            .ToList();

        return Ok(new ClientProfileOptionsDto
        {
            SalesOfficers = salesOfficers,
            LeadSources = ClientProfileOptions.LeadSources,
            QuotationTypes = ClientProfileOptions.QuotationTypes,
            DoorTypes = ClientProfileOptions.DoorTypes,
            ControlSystems = ClientProfileOptions.ControlSystems,
            ElevatorTypes = ClientProfileOptions.ElevatorTypes,
            MachineRoomTypes = ClientProfileOptions.MachineRoomTypes,
            ProjectType = ClientProfileOptions.ProjectTypePrivate,
            DefaultTypeOfUnit = ClientProfileOptions.DefaultTypeOfUnit,
        });
    }

    // GET api/ClientProfiles/clients/mine
    // Clients owned by the logged-in Account Manager, each with its projects.
    [HttpGet("clients/mine")]
    public async Task<ActionResult<List<ClientDto>>> GetMyClients(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        if (!await IsAccountManagerAsync(cancellationToken))
        {
            return Forbid();
        }

        var clients = await ClientQuery()
            .Where(c => c.AccountManagerUserId == userId.Value)
            .OrderByDescending(c => c.UpdatedAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(clients.Select(ToClientDto).ToList());
    }

    // GET api/ClientProfiles/clients/lookup?email=
    // Checks whether the logged-in Account Manager already has this client.
    [HttpGet("clients/lookup")]
    public async Task<ActionResult<ClientLookupDto>> LookupClient(
        [FromQuery] string? email,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        if (!await IsAccountManagerAsync(cancellationToken))
        {
            return Forbid();
        }

        var normalized = NormalizeEmail(email);
        if (normalized.Length == 0)
        {
            return Ok(new ClientLookupDto { Exists = false });
        }

        var client = await ClientQuery()
            .FirstOrDefaultAsync(c =>
                c.AccountManagerUserId == userId.Value &&
                c.EmailAddress == normalized,
                cancellationToken);

        return Ok(new ClientLookupDto
        {
            Exists = client is not null,
            Client = client is null ? null : ToClientDto(client),
        });
    }

    // GET api/ClientProfiles/clients/{clientId}
    [HttpGet("clients/{clientId:guid}")]
    public async Task<ActionResult<ClientDto>> GetClient(
        Guid clientId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var client = await ClientQuery()
            .FirstOrDefaultAsync(c => c.Id == clientId, cancellationToken);

        if (client is null)
        {
            return NotFound(new { message = "Client not found." });
        }

        if (client.AccountManagerUserId != userId.Value)
        {
            return Forbid();
        }

        return Ok(ToClientDto(client));
    }

    // POST api/ClientProfiles/clients
    // Registers a new client together with its first project.
    [HttpPost("clients")]
    public async Task<ActionResult<ProjectDto>> CreateClient(
        [FromBody] CreateClientProfileDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        if (!await IsAccountManagerAsync(cancellationToken))
        {
            return Forbid();
        }

        var clientError = ValidateClient(dto.Client);
        if (clientError is not null)
        {
            return clientError;
        }

        var projectError = await ValidateProjectAsync(dto.Project, cancellationToken);
        if (projectError is not null)
        {
            return projectError;
        }

        var email = NormalizeEmail(dto.Client.EmailAddress);
        var alreadyExists = await _db.Clients.AnyAsync(c =>
            c.AccountManagerUserId == userId.Value &&
            c.EmailAddress == email,
            cancellationToken);

        if (alreadyExists)
        {
            return Conflict(new
            {
                message = "This client already exists. Add a project to the existing client instead.",
                clientExists = true,
            });
        }

        var now = DateTime.UtcNow;

        var client = new Client
        {
            Id = Guid.NewGuid(),
            // Auto-assigned from the logged-in user. Never taken from the request body.
            AccountManagerUserId = userId.Value,
            ClientName = dto.Client.ClientName.Trim(),
            ContactNumber = dto.Client.ContactNumber.Trim(),
            EmailAddress = email,
            LeadSource = dto.Client.LeadSource,
            ReferralBy = dto.Client.ReferralBy?.Trim(),
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        var project = BuildProject(dto.Project, client.Id, now);

        _db.Clients.Add(client);
        _db.Projects.Add(project);
        await _db.SaveChangesAsync(cancellationToken);

        var saved = await ProjectQuery()
            .FirstAsync(p => p.Id == project.Id, cancellationToken);

        return CreatedAtAction(nameof(GetProject), new { projectId = saved.Id }, ToProjectDto(saved));
    }

    // PUT api/ClientProfiles/clients/{clientId}
    // Updates client details. Only the owning Account Manager can edit.
    [HttpPut("clients/{clientId:guid}")]
    public async Task<ActionResult<ClientDto>> UpdateClient(
        Guid clientId,
        [FromBody] SaveClientDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var client = await _db.Clients
            .FirstOrDefaultAsync(c => c.Id == clientId, cancellationToken);

        if (client is null)
        {
            return NotFound(new { message = "Client not found." });
        }

        if (client.AccountManagerUserId != userId.Value)
        {
            return Forbid();
        }

        var clientError = ValidateClient(dto);
        if (clientError is not null)
        {
            return clientError;
        }

        var email = NormalizeEmail(dto.EmailAddress);
        var emailTaken = await _db.Clients.AnyAsync(c =>
            c.AccountManagerUserId == userId.Value &&
            c.EmailAddress == email &&
            c.Id != clientId,
            cancellationToken);

        if (emailTaken)
        {
            return Conflict(new
            {
                message = "Another client already uses this email address.",
            });
        }

        client.ClientName = dto.ClientName.Trim();
        client.ContactNumber = dto.ContactNumber.Trim();
        client.EmailAddress = email;
        client.LeadSource = dto.LeadSource;
        client.ReferralBy = dto.ReferralBy?.Trim();
        client.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        var saved = await ClientQuery()
            .FirstAsync(c => c.Id == clientId, cancellationToken);

        return Ok(ToClientDto(saved));
    }

    // POST api/ClientProfiles/clients/{clientId}/projects
    // Adds a project to a client that already exists.
    [HttpPost("clients/{clientId:guid}/projects")]
    public async Task<ActionResult<ProjectDto>> AddProject(
        Guid clientId,
        [FromBody] SaveProjectDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        if (!await IsAccountManagerAsync(cancellationToken))
        {
            return Forbid();
        }

        var client = await _db.Clients
            .FirstOrDefaultAsync(c => c.Id == clientId, cancellationToken);

        if (client is null)
        {
            return NotFound(new { message = "Client not found." });
        }

        if (client.AccountManagerUserId != userId.Value)
        {
            return Forbid();
        }

        var projectError = await ValidateProjectAsync(dto, cancellationToken);
        if (projectError is not null)
        {
            return projectError;
        }

        var now = DateTime.UtcNow;
        var project = BuildProject(dto, clientId, now);

        // Bring the client to the top of the list when it gets a new project.
        client.UpdatedAtUtc = now;
        _db.Projects.Add(project);
        await _db.SaveChangesAsync(cancellationToken);

        var saved = await ProjectQuery()
            .FirstAsync(p => p.Id == project.Id, cancellationToken);

        return CreatedAtAction(nameof(GetProject), new { projectId = saved.Id }, ToProjectDto(saved));
    }

    // GET api/ClientProfiles/projects/{projectId}
    [HttpGet("projects/{projectId:guid}")]
    public async Task<ActionResult<ProjectDto>> GetProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var project = await ProjectQuery()
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project is null)
        {
            return NotFound(new { message = "Project not found." });
        }

        if (!await CanReadAsync(project, cancellationToken))
        {
            return Forbid();
        }

        return Ok(ToProjectDto(project));
    }

    // PUT api/ClientProfiles/projects/{projectId}
    // Only the owning Account Manager can edit, and only before the project is sent to design.
    [HttpPut("projects/{projectId:guid}")]
    public async Task<ActionResult<ProjectDto>> UpdateProject(
        Guid projectId,
        [FromBody] SaveProjectDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var project = await _db.Projects
            .Include(p => p.Client)
            .Include(p => p.Elevators)
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project is null)
        {
            return NotFound(new { message = "Project not found." });
        }

        if (project.Client is null || project.Client.AccountManagerUserId != userId.Value)
        {
            return Forbid();
        }

        if (project.IsSentToDesign)
        {
            return Conflict(new
            {
                message = "This project was already sent to design and can no longer be edited.",
            });
        }

        var projectError = await ValidateProjectAsync(dto, cancellationToken);
        if (projectError is not null)
        {
            return projectError;
        }

        project.BuildingType = dto.BuildingType.Trim();
        project.SalesOfficerUserId = dto.SalesOfficerUserId;
        project.QuotationType = dto.QuotationType;
        project.SpecialInstructions = dto.SpecialInstructions?.Trim();
        project.NumberOfElevators = dto.NumberOfElevators;
        project.UpdatedAtUtc = DateTime.UtcNow;

        // Remove old rows and save first, so the new rows do not clash with the
        // unique (ProjectId, SequenceNumber) index.
        var replacement = BuildElevators(dto.Elevators, project.Id);
        _db.ElevatorUnits.RemoveRange(project.Elevators);
        await _db.SaveChangesAsync(cancellationToken);

        _db.ElevatorUnits.AddRange(replacement);
        await _db.SaveChangesAsync(cancellationToken);

        var saved = await ProjectQuery()
            .FirstAsync(p => p.Id == projectId, cancellationToken);

        return Ok(ToProjectDto(saved));
    }

    // POST api/ClientProfiles/projects/{projectId}/send-to-design
    [HttpPost("projects/{projectId:guid}/send-to-design")]
    public async Task<ActionResult<ProjectDto>> SendToDesign(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var project = await _db.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project is null)
        {
            return NotFound(new { message = "Project not found." });
        }

        if (project.Client is null || project.Client.AccountManagerUserId != userId.Value)
        {
            return Forbid();
        }

        if (!project.IsSentToDesign)
        {
            var now = DateTime.UtcNow;
            project.IsSentToDesign = true;
            project.SentToDesignAtUtc = now;
            project.UpdatedAtUtc = now;
            await _db.SaveChangesAsync(cancellationToken);
        }

        var saved = await ProjectQuery()
            .FirstAsync(p => p.Id == projectId, cancellationToken);

        return Ok(ToProjectDto(saved));
    }

    // GET api/ClientProfiles/for-design
    // Projects sent to design, for Design Specialists to reference.
    [HttpGet("for-design")]
    public async Task<ActionResult<List<ProjectDto>>> GetForDesign(
        CancellationToken cancellationToken)
    {
        if (!await IsDesignSpecialistAsync(cancellationToken))
        {
            return Forbid();
        }

        var projects = await ProjectQuery()
            .Where(p => p.IsSentToDesign)
            .OrderByDescending(p => p.SentToDesignAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(projects.Select(ToProjectDto).ToList());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private IQueryable<Client> ClientQuery() =>
        _db.Clients
            .AsNoTracking()
            .Include(c => c.AccountManagerUser)
            .Include(c => c.Projects)
                .ThenInclude(p => p.SalesOfficerUser)
            .Include(c => c.Projects)
                .ThenInclude(p => p.Elevators);

    private IQueryable<Project> ProjectQuery() =>
        _db.Projects
            .AsNoTracking()
            .Include(p => p.Client)
                .ThenInclude(c => c!.AccountManagerUser)
            .Include(p => p.SalesOfficerUser)
            .Include(p => p.Elevators);

    private Guid? GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }

    // Account Manager: the logged-in user has an active Sales / Account Manager assignment.
    private Task<bool> IsAccountManagerAsync(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Task.FromResult(false);
        }

        return _db.UserDepartmentPositions
            .AsNoTracking()
            .AnyAsync(a =>
                a.UserId == userId.Value &&
                a.IsActive &&
                a.Department!.Code == ClientProfileOptions.SalesDepartmentCode &&
                a.Position!.Name == ClientProfileOptions.AccountManagerPosition &&
                a.User != null &&
                a.User.IsActive,
                cancellationToken);
    }

    // Design Specialist: the logged-in user has an active Design / Design Specialist assignment.
    private Task<bool> IsDesignSpecialistAsync(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Task.FromResult(false);
        }

        return _db.UserDepartmentPositions
            .AsNoTracking()
            .AnyAsync(a =>
                a.UserId == userId.Value &&
                a.IsActive &&
                a.Department!.Code == ClientProfileOptions.DesignDepartmentCode &&
                a.Position!.Name == ClientProfileOptions.DesignSpecialistPosition &&
                a.User != null &&
                a.User.IsActive,
                cancellationToken);
    }

    // Account Managers read their own projects. Design Specialists read projects sent to design.
    private async Task<bool> CanReadAsync(Project project, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return false;
        }

        if (project.Client?.AccountManagerUserId == userId.Value)
        {
            return true;
        }

        return project.IsSentToDesign &&
               await IsDesignSpecialistAsync(cancellationToken);
    }

    // Checks the client form on the server. The client's checks can be bypassed.
    private static ActionResult? ValidateClient(SaveClientDto dto)
    {
        if (!ClientProfileOptions.LeadSources.Contains(dto.LeadSource))
        {
            return new BadRequestObjectResult(new { message = "Lead source is not valid." });
        }

        return null;
    }

    // Checks the project form on the server. The client's checks can be bypassed.
    private async Task<ActionResult?> ValidateProjectAsync(
        SaveProjectDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.NumberOfElevators != dto.Elevators.Count)
        {
            return BadRequest(new
            {
                message = "Number of elevators must match the elevator details entered.",
            });
        }

        var officerIsValid = await _db.UserDepartmentPositions
            .AsNoTracking()
            .AnyAsync(a =>
                a.UserId == dto.SalesOfficerUserId &&
                a.IsActive &&
                a.Department!.Code == ClientProfileOptions.SalesDepartmentCode &&
                a.Position!.Name == ClientProfileOptions.SalesOfficerPosition &&
                a.User != null &&
                a.User.IsActive,
                cancellationToken);

        if (!officerIsValid)
        {
            return BadRequest(new { message = "Selected Sales Officer is not valid." });
        }

        if (!ClientProfileOptions.QuotationTypes.Contains(dto.QuotationType))
        {
            return BadRequest(new { message = "Quotation type is not valid." });
        }

        foreach (var elevator in dto.Elevators)
        {
            if (!ClientProfileOptions.ElevatorTypes.Contains(elevator.ElevatorType) ||
                !ClientProfileOptions.MachineRoomTypes.Contains(elevator.MachineRoomType) ||
                !ClientProfileOptions.DoorTypes.Contains(elevator.TypeOfDoor) ||
                !ClientProfileOptions.ControlSystems.Contains(elevator.ElevatorControlSystem))
            {
                return BadRequest(new
                {
                    message = "One or more elevator selections are not valid.",
                });
            }
        }

        return null;
    }

    private static Project BuildProject(SaveProjectDto dto, Guid clientId, DateTime now)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            ClientId = clientId,
            BuildingType = dto.BuildingType.Trim(),
            ProjectType = ClientProfileOptions.ProjectTypePrivate,
            SalesOfficerUserId = dto.SalesOfficerUserId,
            TypeOfUnit = ClientProfileOptions.DefaultTypeOfUnit,
            QuotationType = dto.QuotationType,
            SpecialInstructions = dto.SpecialInstructions?.Trim(),
            NumberOfElevators = dto.NumberOfElevators,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        project.Elevators = BuildElevators(dto.Elevators, project.Id);
        return project;
    }

    private static List<ElevatorUnit> BuildElevators(
        IEnumerable<ElevatorUnitDto> dtos,
        Guid projectId)
    {
        return dtos
            .Select((e, index) => new ElevatorUnit
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                SequenceNumber = index + 1,
                ElevatorType = e.ElevatorType,
                RatedCapacity = e.RatedCapacity.Trim(),
                NumberOfFloors = e.NumberOfFloors,
                NumberOfStops = e.NumberOfStops,
                NumberOfOpenings = e.NumberOfOpenings,
                MachineRoomType = e.MachineRoomType,
                TypeOfDoor = e.TypeOfDoor,
                ElevatorControlSystem = e.ElevatorControlSystem,
                ShaftExisting = e.ShaftExisting,
            })
            .ToList();
    }

    private static string NormalizeEmail(string? email) =>
        (email ?? string.Empty).Trim().ToLowerInvariant();

    private static ClientDto ToClientDto(Client c) => new()
    {
        Id = c.Id,
        ClientName = c.ClientName,
        ContactNumber = c.ContactNumber,
        EmailAddress = c.EmailAddress,
        LeadSource = c.LeadSource,
        ReferralBy = c.ReferralBy,
        AccountManagerUserId = c.AccountManagerUserId,
        AccountManagerName = FullName(c.AccountManagerUser),
        CreatedAtUtc = c.CreatedAtUtc,
        UpdatedAtUtc = c.UpdatedAtUtc,
        Projects = c.Projects
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => ToProjectDto(p, c))
            .ToList(),
    };

    private static ProjectDto ToProjectDto(Project p) =>
        ToProjectDto(p, p.Client ?? new Client { ClientName = string.Empty, ContactNumber = string.Empty, EmailAddress = string.Empty, LeadSource = string.Empty });

    private static ProjectDto ToProjectDto(Project p, Client c) => new()
    {
        Id = p.Id,
        ClientId = c.Id,
        ClientName = c.ClientName,
        ContactNumber = c.ContactNumber,
        EmailAddress = c.EmailAddress,
        LeadSource = c.LeadSource,
        ReferralBy = c.ReferralBy,
        AccountManagerName = FullName(c.AccountManagerUser),
        BuildingType = p.BuildingType,
        ProjectType = p.ProjectType,
        SalesOfficerUserId = p.SalesOfficerUserId,
        SalesOfficerName = FullName(p.SalesOfficerUser),
        TypeOfUnit = p.TypeOfUnit,
        QuotationType = p.QuotationType,
        SpecialInstructions = p.SpecialInstructions,
        NumberOfElevators = p.NumberOfElevators,
        IsSentToDesign = p.IsSentToDesign,
        SentToDesignAtUtc = p.SentToDesignAtUtc,
        CreatedAtUtc = p.CreatedAtUtc,
        UpdatedAtUtc = p.UpdatedAtUtc,
        Elevators = p.Elevators
            .OrderBy(e => e.SequenceNumber)
            .Select(e => new ElevatorUnitDto
            {
                ElevatorType = e.ElevatorType,
                RatedCapacity = e.RatedCapacity,
                NumberOfFloors = e.NumberOfFloors,
                NumberOfStops = e.NumberOfStops,
                NumberOfOpenings = e.NumberOfOpenings,
                MachineRoomType = e.MachineRoomType,
                TypeOfDoor = e.TypeOfDoor,
                ElevatorControlSystem = e.ElevatorControlSystem,
                ShaftExisting = e.ShaftExisting,
            })
            .ToList(),
    };

    private static string FullName(ApplicationUser? user) =>
        user is null ? string.Empty : $"{user.FirstName} {user.LastName}".Trim();
}
