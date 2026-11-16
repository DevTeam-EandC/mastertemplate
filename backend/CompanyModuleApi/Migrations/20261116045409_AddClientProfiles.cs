using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesModuleWebAPI.Migrations;

/// <inheritdoc />
public partial class _20261116045409_AddClientProfiles : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "ClientProfiles",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ClientName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                ContactNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                EmailAddress = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                BuildingType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                ProjectType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                SalesOfficerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                AccountManagerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                LeadSource = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                TypeOfUnit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                ReferralBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                SpecialInstructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                QuotationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                NumberOfElevators = table.Column<int>(type: "integer", nullable: false),
                IsSentToDesign = table.Column<bool>(type: "boolean", nullable: false),
                SentToDesignAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ClientProfiles", x => x.Id);
                table.ForeignKey(
                    name: "FK_ClientProfiles_AspNetUsers_AccountManagerUserId",
                    column: x => x.AccountManagerUserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_ClientProfiles_AspNetUsers_SalesOfficerUserId",
                    column: x => x.SalesOfficerUserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "ElevatorUnits",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ClientProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                SequenceNumber = table.Column<int>(type: "integer", nullable: false),
                ElevatorType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                RatedCapacity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                NumberOfFloors = table.Column<int>(type: "integer", nullable: false),
                NumberOfStops = table.Column<int>(type: "integer", nullable: false),
                NumberOfOpenings = table.Column<int>(type: "integer", nullable: false),
                MachineRoomType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                TypeOfDoor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                ElevatorControlSystem = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                ShaftExisting = table.Column<bool>(type: "boolean", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ElevatorUnits", x => x.Id);
                table.ForeignKey(
                    name: "FK_ElevatorUnits_ClientProfiles_ClientProfileId",
                    column: x => x.ClientProfileId,
                    principalTable: "ClientProfiles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_ClientProfiles_AccountManagerUserId",
            table: "ClientProfiles",
            column: "AccountManagerUserId");

        migrationBuilder.CreateIndex(
            name: "IX_ClientProfiles_IsSentToDesign",
            table: "ClientProfiles",
            column: "IsSentToDesign");

        migrationBuilder.CreateIndex(
            name: "IX_ClientProfiles_SalesOfficerUserId",
            table: "ClientProfiles",
            column: "SalesOfficerUserId");

        migrationBuilder.CreateIndex(
            name: "IX_ElevatorUnits_ClientProfileId_SequenceNumber",
            table: "ElevatorUnits",
            columns: new[] { "ClientProfileId", "SequenceNumber" },
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "ElevatorUnits");

        migrationBuilder.DropTable(
            name: "ClientProfiles");
    }
}
