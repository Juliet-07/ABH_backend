import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/base.entity";

@Entity()
export class Category extends BaseEntity {
    @Column({unique: true})
    name: string;

    @Column()
    description: string;
}
