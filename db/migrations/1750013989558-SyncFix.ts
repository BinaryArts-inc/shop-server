import { MigrationInterface, QueryRunner } from "typeorm"

export class SyncFix1750013989558 implements MigrationInterface {
  name = "SyncFix1750013989558"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bank" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bankName" character varying NOT NULL, "accountNumber" character varying NOT NULL, "accountName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_90c0c48a76481f77c68569ab627" UNIQUE ("accountNumber"), CONSTRAINT "PK_7651eaf705126155142947926e8" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('customer', 'vendor', 'admin')`)
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer', "email" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE TYPE "public"."product_status_enum" AS ENUM('draft', 'published')`)
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" character varying NOT NULL, "description" character varying NOT NULL, "price" double precision NOT NULL, "discountPrice" double precision, "stockCount" integer NOT NULL, "images" text array NOT NULL, "status" "public"."product_status_enum" NOT NULL DEFAULT 'draft', "storeId" uuid NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "store" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "logo" character varying NOT NULL, "category" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "businessId" uuid, CONSTRAINT "REL_bc7ec2c93335da88571ae84fbe" UNIQUE ("businessId"), CONSTRAINT "PK_f3172007d4de5ae8e7692759d79" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "business" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "businessRegNumber" text, "contactNumber" character varying NOT NULL, "address" character varying NOT NULL, "country" character varying NOT NULL, "state" character varying NOT NULL, "kycVerificationType" character varying NOT NULL, "identificationNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_dba98cd5cf972f69e1e066b398a" UNIQUE ("businessRegNumber"), CONSTRAINT "UQ_8778888f4b7f4185a24db2c823b" UNIQUE ("identificationNumber"), CONSTRAINT "REL_ac8ad696f6731c86b52c058c0c" UNIQUE ("userId"), CONSTRAINT "PK_0bd850da8dafab992e2e9b058e5" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" integer NOT NULL, "expireAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_463cf01e0ea83ad57391fd4e1d7" UNIQUE ("email"), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "bank" ADD CONSTRAINT "FK_f023abe054fcf7b1d67cd4c8a13" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_32eaa54ad96b26459158464379a" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_329b8ae12068b23da547d3b4798" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "store" ADD CONSTRAINT "FK_bc7ec2c93335da88571ae84fbe9" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "business" ADD CONSTRAINT "FK_ac8ad696f6731c86b52c058c0c6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "business" DROP CONSTRAINT "FK_ac8ad696f6731c86b52c058c0c6"`)
    await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_bc7ec2c93335da88571ae84fbe9"`)
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_329b8ae12068b23da547d3b4798"`)
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_32eaa54ad96b26459158464379a"`)
    await queryRunner.query(`ALTER TABLE "bank" DROP CONSTRAINT "FK_f023abe054fcf7b1d67cd4c8a13"`)
    await queryRunner.query(`DROP TABLE "otp"`)
    await queryRunner.query(`DROP TABLE "business"`)
    await queryRunner.query(`DROP TABLE "store"`)
    await queryRunner.query(`DROP TABLE "product"`)
    await queryRunner.query(`DROP TYPE "public"."product_status_enum"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`)
    await queryRunner.query(`DROP TABLE "bank"`)
  }
}
