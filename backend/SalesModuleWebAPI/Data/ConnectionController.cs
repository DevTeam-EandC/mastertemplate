using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalesModuleWebAPI.Data;

namespace SalesModuleWebAPI.Data
{
    [ApiController]
[Route("api/[controller]")]
public class ConnectionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ConnectionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var databaseConnected =
                    await _context.Database.CanConnectAsync();

                return Ok(new
                {
                    api = "Connected",
                    database = databaseConnected
                        ? "Connected"
                        : "Disconnected",
                    databaseName = databaseConnected
                        ? _context.Database.GetDbConnection().Database
                        : null
                });
            }
            catch
            {
                return Ok(new
                {
                    api = "Connected",
                    database = "Disconnected",
                    databaseName = (string?)null
                });
            }
        }
    }
}
