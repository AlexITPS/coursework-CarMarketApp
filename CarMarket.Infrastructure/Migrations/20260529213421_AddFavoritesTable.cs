using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarMarket.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoritesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FavoriteAds_CarAds_CarAdId",
                table: "FavoriteAds");

            migrationBuilder.AlterColumn<int>(
                name: "CarAdId",
                table: "FavoriteAds",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "SparePartAdId",
                table: "FavoriteAds",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteAds_SparePartAdId",
                table: "FavoriteAds",
                column: "SparePartAdId");

            migrationBuilder.AddForeignKey(
                name: "FK_FavoriteAds_CarAds_CarAdId",
                table: "FavoriteAds",
                column: "CarAdId",
                principalTable: "CarAds",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_FavoriteAds_SparePartAds_SparePartAdId",
                table: "FavoriteAds",
                column: "SparePartAdId",
                principalTable: "SparePartAds",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FavoriteAds_CarAds_CarAdId",
                table: "FavoriteAds");

            migrationBuilder.DropForeignKey(
                name: "FK_FavoriteAds_SparePartAds_SparePartAdId",
                table: "FavoriteAds");

            migrationBuilder.DropIndex(
                name: "IX_FavoriteAds_SparePartAdId",
                table: "FavoriteAds");

            migrationBuilder.DropColumn(
                name: "SparePartAdId",
                table: "FavoriteAds");

            migrationBuilder.AlterColumn<int>(
                name: "CarAdId",
                table: "FavoriteAds",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FavoriteAds_CarAds_CarAdId",
                table: "FavoriteAds",
                column: "CarAdId",
                principalTable: "CarAds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
