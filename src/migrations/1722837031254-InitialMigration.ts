import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductTableAddJsonbColumns implements MigrationInterface {
    name = 'UpdateProductTableAddJsonbColumns'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the product table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE "product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "createdBy" character varying,
                "updatedBy" character varying,
                "color" jsonb NOT NULL DEFAULT '[]',
                "discount" jsonb NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_product_id" PRIMARY KEY ("id")
            )
        `);

        // If the table already exists, alter the table to add the columns
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD COLUMN "color" jsonb NOT NULL DEFAULT '[]',
            ADD COLUMN "discount" jsonb NOT NULL DEFAULT '[]';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the columns if rolling back
        await queryRunner.query(`
            ALTER TABLE "product"
            DROP COLUMN "color",
            DROP COLUMN "discount";
        `);
    }
}
