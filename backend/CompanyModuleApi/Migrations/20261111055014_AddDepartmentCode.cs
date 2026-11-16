using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesModuleWebAPI.Migrations;

/// <inheritdoc />
public partial class _20261111055014_AddDepartmentCode : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Departments_Name",
            table: "Departments");

        migrationBuilder.AlterColumn<string>(
            name: "Name",
            table: "Departments",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            collation: "und-x-icu",
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100);

        migrationBuilder.AddColumn<string>(
            name: "Code",
            table: "Departments",
            type: "character varying(20)",
            maxLength: 20,
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateIndex(
            name: "IX_Departments_Name",
            table: "Departments",
            column: "Name",
            unique: true)
            .Annotation("Npgsql:IndexMethod", "btree");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Departments_Name",
            table: "Departments");

        migrationBuilder.DropColumn(
            name: "Code",
            table: "Departments");

        migrationBuilder.AlterColumn<string>(
            name: "Name",
            table: "Departments",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldCollation: "und-x-icu");

        migrationBuilder.CreateIndex(
            name: "IX_Departments_Name",
            table: "Departments",
            column: "Name",
            unique: true);
    }
}
