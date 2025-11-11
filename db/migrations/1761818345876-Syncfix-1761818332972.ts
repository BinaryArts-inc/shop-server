import { MigrationInterface, QueryRunner } from "typeorm";

export class Syncfix17618183329721761818345876 implements MigrationInterface {
    name = 'Syncfix17618183329721761818345876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profileImage" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileImage"`);
    }

}
