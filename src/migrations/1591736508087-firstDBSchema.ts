import {MigrationInterface, QueryRunner} from "typeorm";

export class firstDBSchema1591736508087 implements MigrationInterface {
    name = 'firstDBSchema1591736508087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_3390c489b151845e5f652233cb"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "age" TO "email"`, undefined);
        await queryRunner.query(`CREATE TABLE "objectives" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_c54846771e6a2db24c2b886eca0" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" integer NOT NULL`, undefined);
        await queryRunner.query(`DROP TABLE "objectives"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "email" TO "age"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_3390c489b151845e5f652233cb" CHECK ((age > 0))`, undefined);
    }

}
