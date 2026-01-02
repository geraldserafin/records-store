import { MigrationInterface, QueryRunner } from "typeorm";

export class DropPurchasesTable1767316145467 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE IF EXISTS `purchases` ");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
