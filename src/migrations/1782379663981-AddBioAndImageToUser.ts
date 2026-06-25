import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBioAndImageToUser1782379663981 implements MigrationInterface {
    name = 'AddBioAndImageToUser1782379663981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "bio" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
    }

}
