using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyModuleApi.DTOs.ClientProfiles;
using CompanyModuleApi.Models;
using CompanyModuleApi.Data;

namespace CompanyModuleApi.Controllers;

// Client profiles captured by Sales Account Managers and read by Design Specialists.
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
    // Dropdown values and the Sales Officer list for the form.
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

    // GET api/ClientProfiles/mine
    // Profiles created by the logged-in Account Manager.
    [HttpGet("mine")]
    public async Task<ActionResult<List<ClientProfileResponseDto>>> GetMine(
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

        var profiles = await Query()
            .Where(c => c.AccountManagerUserId == userId.Value)
            .OrderByDescending(c => c.UpdatedAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(profiles.Select(ToResponse).ToList());
    }

    // GET api/ClientProfiles/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClientProfileResponseDto>> GetOne(
        Guid id,
        CancellationToken cancellationToken)
    {
        var profile = await Query()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (profile is null)
        {
            return NotFound(new { message = "Client profile not found." });
        }

        // Account Managers see their own profiles. Design Specialists see profiles sent to design.
        if (!await CanReadAsync(profile, cancellationToken))
        {
            return Forbid();
        }

        return Ok(ToResponse(profile));
    }

    // GET api/ClientProfiles/for-design
    // Profiles sent to design, for Design Specialists to reference.
    [HttpGet("for-design")]
    public async Task<ActionResult<List<ClientProfileResponseDto>>> GetForDesign(
        CancellationToken cancellationToken)
    {
        if (!await IsDesignSpecialistAsync(cancellationToken))
        {
            return Forbid();
        }

        var profiles = await Query()
            .Where(c => c.IsSentToDesign)
            .OrderByDescending(c => c.SentToDesignAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(profiles.Select(ToResponse).ToList());
    }

    // POST api/ClientProfiles
    [HttpPost]
    public async Task<ActionResult<ClientProfileResponseDto>> Create(
        [FromBody] SaveClientProfileDto dto,
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

        var validationError = await ValidateAsync(dto, cancellationToken);
        if (validationError is not null)
        {
            return validationError;
        }

        var now = DateTime.UtcNow;

        var profile = new ClientProfile
        {
            Id = Guid.NewGuid(),
            ClientName = dto.ClientName.Trim(),
            ContactNumber = dto.ContactNumber.Trim(),
            EmailAddress = dto.EmailAddress.Trim(),
            BuildingType = dto.BuildingType.Trim(),
            ProjectType = ClientProfileOptions.ProjectTypePrivate,
            SalesOfficerUserId = dto.SalesOfficerUserId,
            // Auto-assigned from the logged-in user. Never taken from the request body.
            AccountManagerUserId = userId.Value,
            LeadSource = dto.LeadSource,
            TypeOfUnit = ClientProfileOptions.DefaultTypeOfUnit,
            ReferralBy = dto.ReferralBy?.Trim(),
            SpecialInstructions = dto.SpecialInstructions?.Trim(),
            QuotationType = dto.QuotationType,
            NumberOfElevators = dto.NumberOfElevators,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        profile.Elevators = BuildElevators(dto.Elevators, profile.Id);

        _db.ClientProfiles.Add(profile);
        await _db.SaveChangesAsync(cancellationToken);

        var saved = await Query()
            .FirstAsync(c => c.Id == profile.Id, cancellationToken);

        return CreatedAtAction(nameof(GetOne), new { id = saved.Id }, ToResponse(saved));
    }

    // PUT api/ClientProfiles/{id}
    // Only the owning Account Manager can edit, and only before the profile is sent to design.
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ClientProfileResponseDto>> Update(
        Guid id,
        [FromBody] SaveClientProfileDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await _db.ClientProfiles
            .Include(c => c.Elevators)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (profile is null)
        {
            return NotFound(new { message = "Client profile not found." });
        }

        if (profile.AccountManagerUserId != userId.Value)
        {
            return Forbid();
        }

        if (profile.IsSentToDesign)
        {
            return Conflict(new
            {
                message = "This profile was already sent to design and can no longer be edited.",
            });
        }

        var validationError = await ValidateAsync(dto, cancellationToken);
        if (validationError is not null)
        {
            return validationError;
        }

        profile.ClientName = dto.ClientName.Trim();
        profile.ContactNumber = dto.ContactNumber.Trim();
        profile.EmailAddress = dto.EmailAddress.Trim();
        profile.BuildingType = dto.BuildingType.Trim();
        profile.SalesOfficerUserId = dto.SalesOfficerUserId;
        profile.LeadSource = dto.LeadSource;
        profile.ReferralBy = dto.ReferralBy?.Trim();
        profile.SpecialInstructions = dto.SpecialInstructions?.Trim();
        profile.QuotationType = dto.QuotationType;
        profile.NumberOfElevators = dto.NumberOfElevators;
        profile.UpdatedAtUtc = DateTime.UtcNow;

        // Remove old rows and save first, so the new rows do not clash with the
        // unique (ClientProfileId, SequenceNumber) index.
        var replacement = BuildElevators(dto.Elevators, profile.Id);
        _db.ElevatorUnits.RemoveRange(profile.Elevators);
        await _db.SaveChangesAsync(cancellationToken);

        _db.ElevatorUnits.AddRange(replacement);
        await _db.SaveChangesAsync(cancellationToken);

        var saved = await Query()
            .FirstAsync(c => c.Id == profile.Id, cancellationToken);

        return Ok(ToResponse(saved));
    }

    // POST api/ClientProfiles/{id}/send-to-design
    [HttpPost("{id:guid}/send-to-design")]
    public async Task<ActionResult<ClientProfileResponseDto>> SendToDesign(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await _db.ClientProfiles
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (profile is null)
        {
            return NotFound(new { message = "Client profile not found." });
        }

        if (profile.AccountManagerUserId != userId.Value)
        {
            return Forbid();
        }

        if (profile.IsSentToDesign)
        {
            return Ok(ToResponse(await Query()
                .FirstAsync(c => c.Id == id, cancellationToken)));
        }

        profile.IsSentToDesign = true;
        profile.SentToDesignAtUtc = DateTime.UtcNow;
        profile.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(await Query()
            .FirstAsync(c => c.Id == id, cancellationToken)));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private IQueryable<ClientProfile> Query() =>
        _db.ClientProfiles
            .AsNoTracking()
            .Include(c => c.SalesOfficerUser)
            .Include(c => c.AccountManagerUser)
            .Include(c => c.Elevators);

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

    private async Task<bool> CanReadAsync(
        ClientProfile profile,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return false;
        }

        if (profile.AccountManagerUserId == userId.Value)
        {
            return true;
        }

        return profile.IsSentToDesign &&
               await IsDesignSpecialistAsync(cancellationToken);
    }

    // Checks the form on the server. The client's checks can be bypassed.
    private async Task<ActionResult?> ValidateAsync(
        SaveClientProfileDto dto,
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

        if (!ClientProfileOptions.LeadSources.Contains(dto.LeadSource))
        {
            return BadRequest(new { message = "Lead source is not valid." });
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

    private static List<ElevatorUnit> BuildElevators(
        IEnumerable<ElevatorUnitDto> dtos,
        Guid profileId)
    {
        return dtos
            .Select((e, index) => new ElevatorUnit
            {
                Id = Guid.NewGuid(),
                ClientProfileId = profileId,
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

    private static ClientProfileResponseDto ToResponse(ClientProfile c) => new()
    {
        Id = c.Id,
        ClientName = c.ClientName,
        ContactNumber = c.ContactNumber,
        EmailAddress = c.EmailAddress,
        BuildingType = c.BuildingType,
        ProjectType = c.ProjectType,
        SalesOfficerUserId = c.SalesOfficerUserId,
        SalesOfficerName = FullName(c.SalesOfficerUser),
        AccountManagerUserId = c.AccountManagerUserId,
        AccountManagerName = FullName(c.AccountManagerUser),
        LeadSource = c.LeadSource,
        TypeOfUnit = c.TypeOfUnit,
        ReferralBy = c.ReferralBy,
        SpecialInstructions = c.SpecialInstructions,
        QuotationType = c.QuotationType,
        NumberOfElevators = c.NumberOfElevators,
        IsSentToDesign = c.IsSentToDesign,
        SentToDesignAtUtc = c.SentToDesignAtUtc,
        CreatedAtUtc = c.CreatedAtUtc,
        UpdatedAtUtc = c.UpdatedAtUtc,
        Elevators = c.Elevators
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
