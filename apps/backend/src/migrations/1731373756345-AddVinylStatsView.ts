import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVinylStatsView1731373756345 implements MigrationInterface {
  name = 'AddVinylStatsView1731373756345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS vinyl_stats`);
    await queryRunner.query(`CREATE VIEW \`vinyl_stats\` AS 
    SELECT 
      v.id as vinylId,
      AVG(r.score), 0 as averageRating
    FROM vinyls v
    LEFT JOIN review r ON r.vinylId = v.id
    GROUP BY v.id
  `);
    await queryRunner.query(
      `INSERT INTO \`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`,
      [
        'vinyl_store',
        'VIEW',
        'vinyl_stats',
        'SELECT \n      v.id as vinylId,\n      AVG(r.score), 0) as averageRating\n    FROM vinyls v\n    LEFT JOIN review r ON r.vinylId = v.id\n    GROUP BY v.id',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM \`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`,
      ['VIEW', 'vinyl_stats', 'vinyl_store'],
    );
    await queryRunner.query(`DROP VIEW \`vinyl_stats\``);
  }
}
