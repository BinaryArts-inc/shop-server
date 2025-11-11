import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncFix17604283363581760428346385 implements MigrationInterface {
    name = 'SyncFix17604283363581760428346385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "fcmToken" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "fcmToken"`);
    }

}
