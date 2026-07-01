import { MigrationInterface, QueryRunner } from "typeorm";

export class ArticleMigration1782897478639 implements MigrationInterface {
    name = 'ArticleMigration1782897478639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "articles" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "body" text NOT NULL, "tagList" text NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "favoritesCount" integer NOT NULL DEFAULT '0', "authorId" integer NOT NULL, CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE ("slug"), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "article_favorites" ("articleId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_64cd929025cfaf6dc570ed9e9d2" PRIMARY KEY ("articleId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e2ca248e177bef642adcdb65a6" ON "article_favorites" ("articleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c7cd65fc74f170833d3d9c81c3" ON "article_favorites" ("userId") `);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_e2ca248e177bef642adcdb65a65" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_c7cd65fc74f170833d3d9c81c3a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_c7cd65fc74f170833d3d9c81c3a"`);
        await queryRunner.query(`ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_e2ca248e177bef642adcdb65a65"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7cd65fc74f170833d3d9c81c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e2ca248e177bef642adcdb65a6"`);
        await queryRunner.query(`DROP TABLE "article_favorites"`);
        await queryRunner.query(`DROP TABLE "articles"`);
    }

}
