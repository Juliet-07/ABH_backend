import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     message: string;


     @Column()
     receiverId: string;


     @Column({ default: false })
     read: boolean;

     @CreateDateColumn()
     createdAt: Date;
}