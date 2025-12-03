import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'OPEN' })
  status: string; // OPEN, IN_PROGRESS, DONE

  @ManyToOne(() => Organization, (org) => org.tasks)
  organization: Organization;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  assignee: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

