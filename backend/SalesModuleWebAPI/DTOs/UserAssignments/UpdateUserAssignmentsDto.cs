using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.UserAssignments
{
    public class UpdateUserAssignmentsDto
    {
        [Required]
        public List<UserAssignmentItemDto> Assignments { get; set; }
            = new();
    }
}
