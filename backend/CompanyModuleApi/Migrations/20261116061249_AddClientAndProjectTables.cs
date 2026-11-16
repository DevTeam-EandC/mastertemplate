   using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesModuleWebAPI.Migrations;

/// <inheritdoc />
public partial class _20261116061249_AddClientAndProjectTables : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_ElevatorUnits_ClientProfiles_ClientProfileId",
            table: "ElevatorUnits");

        migrationBuilder.DropTable(
            name: "ClientProfiles");

        migrationBuilder.RenameColumn(
            name: "ClientProfileId",
            table: "ElevatorUnits",
            newName: "ProjectId");

        migrationBuilder.RenameIndex(
            name: "IX_ElevatorUnits_ClientProfileId_SequenceNumber",
            table: "ElevatorUnits",
            newName: "IX_ElevatorUnits_ProjectId_SequenceNumber");

        migrationBuilder.CreateTable(
            name: "Clients",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                AccountManagerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                ClientName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                ContactNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                EmailAddress = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                LeadSource = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                ReferralBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Clients", x => x.Id);
                table.ForeignKey(
                    name: "FK_Clients_AspNetUsers_AccountManagerUserId",
                    column: x => x.AccountManagerUserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Projects",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                BuildingType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                ProjectType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                SalesOfficerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                TypeOfUnit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                QuotationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                SpecialInstructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                NumberOfElevators = table.Column<int>(type: "integer", nullable: false),
                IsSentToDesign = table.Column<bool>(type: "boolean", nullable: false),
                SentToDesignAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Projects", x => x.Id);
                table.ForeignKey(
                    name: "FK_Projects_AspNetUsers_SalesOfficerUserId",
                    column: x => x.SalesOfficerUserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Projects_Clients_ClientId",
                    column: x => x.ClientId,
                    principalTable: "Clients",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Clients_AccountManagerUserId_EmailAddress",
            table: "Clients",
            columns: new[] { "AccountManagerUserId", "EmailAddress" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Projects_ClientId",
            table: "Projects",
            column: "ClientId");

        migrationBuilder.CreateIndex(
            name: "IX_Projects_IsSentToDesign",
            table: "Projects",
            column: "IsSentToDesign");

        migrationBuilder.CreateIndex(
            name: "IX_Projects_SalesOfficerUserId",
            table: "Projects",
            column: "SalesOfficerUserId");

        migrationBuilder.AddForeignKey(
            name: "FK_ElevatorUnits_Projects_ProjectId",
            table: "ElevatorUnits",
            column: "ProjectId",
            principalTable: "Projects",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_ElevatorUnits_Projects_ProjectId",
            table: "ElevatorUnits");

        migrationBuilder.DropTable(
            name: "Projects");

        migrationBuilder.DropTable(
            name: "Clients");

        migrationBuilder.RenameColumn(
            name: "ProjectId",
            table: "ElevatorUnits",
            newName: "ClientProfileId");

        migrationBuilder.RenameIndex(
            name: "IX_ElevatorUnits_ProjectId_SequenceNumber",
            table: "ElevatorUnits",
            newName: "IX_ElevatorUnits_ClientProfileId_SequenceNumber");

        migrationBuilder.CreateTable(
            name: "ClientProfiles",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                AccountManagerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                SalesOfficerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                BuildingType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                ClientName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                ContactNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                EmailAddress = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                IsSentToDesign = table.Column<bool>(type: "boolean", nullable: false),
                LeadSource = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                NumberOfElevators = table.Column<int>(type: "integer", nullable: false),
                ProjectType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                QuotationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                ReferralBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                SentToDesignAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                SpecialInstructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                TypeOfUnit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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

        migrationBuilder.AddForeignKey(
            name: "FK_ElevatorUnits_ClientProfiles_ClientProfileId",
            table: "ElevatorUnits",
            column: "ClientProfileId",
            principalTable: "ClientProfiles",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }
}
