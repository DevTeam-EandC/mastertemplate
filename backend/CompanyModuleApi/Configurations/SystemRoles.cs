namespace CompanyModuleApi.Configurations;

/// <summary>
/// The only Identity roles allowed in the system.
/// Departments and positions control dashboard routing, not roles.
/// </summary>
public static class SystemRoles
{
    // Administrative permissions: users, departments, positions, roles, settings.
    public const string SystemAdmin = "System Admin";

    // Normal company employee with access to assigned dashboards.
    public const string SystemUser = "System User";

    public static readonly IReadOnlyList<string> All =
        new[] { SystemAdmin, SystemUser };

    public static bool IsAllowed(string roleName)
    {
        return All.Contains(roleName, StringComparer.OrdinalIgnoreCase);
    }
}
