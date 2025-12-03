import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from '@app/data';
import { Task } from './task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // Hashed

  @Column({
    type: 'text', // SQLite doesn't have native enum
    default: Role.VIEWER
  })
  role: Role;

  @ManyToOne(() => Organization, (org) => org.users)
  organization: Organization;

  @RelationId((user: User) => user.organization)
  organizationId: number;

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];
}
