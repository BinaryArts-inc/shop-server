import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncFix17542450369531754245059178 implements MigrationInterface {
    name = 'SyncFix17542450369531754245059178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ad" ALTER COLUMN "startDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ad" ALTER COLUMN "endDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "startDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "endDate" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "endDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "startDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ad" ALTER COLUMN "endDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ad" ALTER COLUMN "startDate" SET NOT NULL`);
    }

}
