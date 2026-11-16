using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesModuleWebAPI.Migrations;

/// <inheritdoc />
public partial class _20261112001107_AddMultipleUserDepartmentAssignments : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_AspNetUsers_Departments_DepartmentId",
            table: "AspNetUsers");

        migrationBuilder.DropForeignKey(
            name: "FK_AspNetUsers_Positions_PositionId",
            table: "AspNetUsers");

        migrationBuilder.DropIndex(
            name: "IX_AspNetUsers_DepartmentId",
            table: "AspNetUsers");

        migrationBuilder.DropIndex(
            name: "IX_AspNetUsers_PositionId",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "DepartmentId",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "PositionId",
            table: "AspNetUsers");

        migrationBuilder.CreateTable(
            name: "UserDepartmentPositions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                PositionId = table.Column<Guid>(type: "uuid", nullable: false),
                IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                AssignedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserDepartmentPositions", x => x.Id);
                table.ForeignKey(
                    name: "FK_UserDepartmentPositions_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_UserDepartmentPositions_Departments_DepartmentId",
                    column: x => x.DepartmentId,
                    principalTable: "Departments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_UserDepartmentPositions_Positions_PositionId",
                    column: x => x.PositionId,
                    principalTable: "Positions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_UserDepartmentPositions_DepartmentId",
            table: "UserDepartmentPositions",
            column: "DepartmentId");

        migrationBuilder.CreateIndex(
            name: "IX_UserDepartmentPositions_PositionId",
            table: "UserDepartmentPositions",
            column: "PositionId");

        migrationBuilder.CreateIndex(
            name: "IX_UserDepartmentPositions_UserId_DepartmentId_PositionId",
            table: "UserDepartmentPositions",
            columns: new[] { "UserId", "DepartmentId", "PositionId" },
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "UserDepartmentPositions");

        migrationBuilder.AddColumn<Guid>(
            name: "DepartmentId",
            table: "AspNetUsers",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "PositionId",
            table: "AspNetUsers",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_AspNetUsers_DepartmentId",
            table: "AspNetUsers",
            column: "DepartmentId");

        migrationBuilder.CreateIndex(
            name: "IX_AspNetUsers_PositionId",
            table: "AspNetUsers",
            column: "PositionId");

        migrationBuilder.AddForeignKey(
            name: "FK_AspNetUsers_Departments_DepartmentId",
            table: "AspNetUsers",
            column: "DepartmentId",
            principalTable: "Departments",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "FK_AspNetUsers_Positions_PositionId",
            table: "AspNetUsers",
            column: "PositionId",
            principalTable: "Positions",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }
}
