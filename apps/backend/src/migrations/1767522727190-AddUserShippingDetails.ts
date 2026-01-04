import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserShippingDetails1767522727190 implements MigrationInterface {
    name = 'AddUserShippingDetails1767522727190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_city\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_postal_code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`shipping_country\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_6b0fec3b872668e2fa58e643d93\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`recordId\` \`recordId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`authorId\` \`authorId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`artists\` CHANGE \`bio\` \`bio\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`artists\` CHANGE \`image\` \`image\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`genres\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_29e75323cebfdf2e54ac44e5a35\``);
        await queryRunner.query(`ALTER TABLE \`records\` CHANGE \`shortDescription\` \`shortDescription\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`records\` DROP COLUMN \`images\``);
        await queryRunner.query(`ALTER TABLE \`records\` ADD \`images\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`records\` CHANGE \`mainArtistId\` \`mainArtistId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_bd76f6fdabb49e6582a07b08e75\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`orderId\` \`orderId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`recordId\` \`recordId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`guestEmail\` \`guestEmail\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`photo_url\` \`photo_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`birth_date\` \`birth_date\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_6b0fec3b872668e2fa58e643d93\` FOREIGN KEY (\`recordId\`) REFERENCES \`records\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_29e75323cebfdf2e54ac44e5a35\` FOREIGN KEY (\`mainArtistId\`) REFERENCES \`artists\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_bd76f6fdabb49e6582a07b08e75\` FOREIGN KEY (\`recordId\`) REFERENCES \`records\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_bd76f6fdabb49e6582a07b08e75\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_29e75323cebfdf2e54ac44e5a35\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_6b0fec3b872668e2fa58e643d93\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`birth_date\` \`birth_date\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`photo_url\` \`photo_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`guestEmail\` \`guestEmail\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`recordId\` \`recordId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`orderId\` \`orderId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_bd76f6fdabb49e6582a07b08e75\` FOREIGN KEY (\`recordId\`) REFERENCES \`records\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` CHANGE \`mainArtistId\` \`mainArtistId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`records\` DROP COLUMN \`images\``);
        await queryRunner.query(`ALTER TABLE \`records\` ADD \`images\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`records\` CHANGE \`shortDescription\` \`shortDescription\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_29e75323cebfdf2e54ac44e5a35\` FOREIGN KEY (\`mainArtistId\`) REFERENCES \`artists\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`genres\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`artists\` CHANGE \`image\` \`image\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`artists\` CHANGE \`bio\` \`bio\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`authorId\` \`authorId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`recordId\` \`recordId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_6b0fec3b872668e2fa58e643d93\` FOREIGN KEY (\`recordId\`) REFERENCES \`records\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_country\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_postal_code\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_city\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`shipping_address\``);
    }

}
