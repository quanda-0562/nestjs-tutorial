import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateArticleTable1782464400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'articles',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'slug',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'body',
            type: 'text',
          },
          {
            name: 'tagList',
            type: 'text',
            isNullable: true,
            default: "''",
          },
          {
            name: 'favoritesCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'authorId',
            type: 'integer',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'articles',
      new TableForeignKey({
        columnNames: ['authorId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'articles',
      new TableIndex({
        columnNames: ['slug'],
      }),
    );

    await queryRunner.createIndex(
      'articles',
      new TableIndex({
        columnNames: ['authorId'],
      }),
    );

    await queryRunner.createIndex(
      'articles',
      new TableIndex({
        columnNames: ['createdAt'],
      }),
    );

    // Create favorites junction table
    await queryRunner.createTable(
      new Table({
        name: 'article_favorites',
        columns: [
          {
            name: 'articleId',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'integer',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'article_favorites',
      new TableForeignKey({
        columnNames: ['articleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'articles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'article_favorites',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('article_favorites');
    await queryRunner.dropTable('articles');
  }
}
