import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782460766537 implements MigrationInterface {
    name = 'Migration1782460766537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_follows" ("userId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "PK_cafb7fc34e0be16223035610c92" PRIMARY KEY ("userId", "followingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b7f2b8513928996a07198bdd1d" ON "user_follows" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7c6c27f12c4e972eab4b3aaccb" ON "user_follows" ("followingId") `);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_b7f2b8513928996a07198bdd1db" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf"`);
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_b7f2b8513928996a07198bdd1db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7c6c27f12c4e972eab4b3aaccb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7f2b8513928996a07198bdd1d"`);
        await queryRunner.query(`DROP TABLE "user_follows"`);
    }

}
