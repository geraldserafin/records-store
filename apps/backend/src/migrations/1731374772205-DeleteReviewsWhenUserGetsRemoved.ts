import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteReviewsWhenUserGetsRemoved1731374772205
  implements MigrationInterface
{
  name = 'DeleteReviewsWhenUserGetsRemoved1731374772205';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
