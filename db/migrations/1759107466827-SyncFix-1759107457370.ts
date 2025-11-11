import { MigrationInterface, QueryRunner } from "typeorm"

export class SyncFix17591074573701759107466827 implements MigrationInterface {
  name = "SyncFix17591074573701759107466827"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawal" ADD "processedById" uuid`)
    await queryRunner.query(`ALTER TABLE "withdrawal" ADD "dateApproved" TIMESTAMP`)
    await queryRunner.query(
      `ALTER TABLE "withdrawal" ADD CONSTRAINT "FK_706704814617d1915dbd564c5b9" FOREIGN KEY ("processedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawal" DROP CONSTRAINT "FK_706704814617d1915dbd564c5b9"`)
    await queryRunner.query(`ALTER TABLE "withdrawal" DROP COLUMN "dateApproved"`)
    await queryRunner.query(`ALTER TABLE "withdrawal" DROP COLUMN "processedById"`)
  }
}
