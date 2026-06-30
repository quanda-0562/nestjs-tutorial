import { MigrationInterface, QueryRunner } from "typeorm";

export class ArticleMigration1782803674654 implements MigrationInterface {
    name = 'ArticleMigration1782803674654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_e2ca248e177bef642adcdb65a65"`);
        await queryRunner.query(`ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_c7cd65fc74f170833d3d9c81c3a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1123ff6815c5b8fec0ba9fec37"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65d9ccc1b02f4d904e90bd76a3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_59ef48cb90fe79792157a78411"`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "tagList" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
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
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "tagList" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_59ef48cb90fe79792157a78411" ON "articles" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_65d9ccc1b02f4d904e90bd76a3" ON "articles" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1123ff6815c5b8fec0ba9fec37" ON "articles" ("slug") `);
        await queryRunner.query(`ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_c7cd65fc74f170833d3d9c81c3a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_e2ca248e177bef642adcdb65a65" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
