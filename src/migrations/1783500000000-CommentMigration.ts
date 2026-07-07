import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommentMigration1783500000000 implements MigrationInterface {
  name = 'CommentMigration1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "articleId" integer NOT NULL, "authorId" integer NOT NULL, CONSTRAINT "PK_2fd19a7f1d0dbe3f4ef4e1f8a5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_0c4f0d4d03c9b4f1b4e8f6c0c8f" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4f0b8b5f8d0f2d7f6a0f7f1d2a0" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_4f0b8b5f8d0f2d7f6a0f7f1d2a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_0c4f0d4d03c9b4f1b4e8f6c0c8f"`,
    );
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
