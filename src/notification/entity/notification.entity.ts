import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
     @PrimaryGeneratedColumn()
     id: string;

     @Column()
     message: string;


     @Column()
     receiverId: string;


     @Column({ default: false })
     read: boolean;

     @CreateDateColumn()
     createdAt: Date;
}