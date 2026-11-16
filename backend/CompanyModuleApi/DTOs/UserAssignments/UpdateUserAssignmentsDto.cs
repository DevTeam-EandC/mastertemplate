using System.ComponentModel.DataAnnotations;

namespace CompanyModuleApi.DTOs.UserAssignments
{
    public class UpdateUserAssignmentsDto
    {
        [Required]
        public List<UserAssignmentItemDto> Assignments { get; set; }
            = new();
    }
}
