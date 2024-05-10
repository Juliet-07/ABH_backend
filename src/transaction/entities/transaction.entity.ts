import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    item: string;

    @Column({ type: 'numeric' })
    price: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}