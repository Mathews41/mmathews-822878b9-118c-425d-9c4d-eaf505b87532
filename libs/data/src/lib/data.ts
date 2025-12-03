import { IsString, IsOptional, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export enum Permission {
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  VIEW_TASK = 'VIEW_TASK',
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
}

export interface User {
  id: number;
  username: string;
  password?: string; // Optional for frontend
  role: Role;
  organizationId: number;
  organization?: {
    id: number;
    name: string;
  };
}

export interface Organization {
  id: number;
  name: string;
  parentId?: number; // For hierarchy
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assigneeId?: number;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  // In real app, use a stronger Enum check, but simplified string literals here
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';

  @IsInt()
  @IsOptional()
  assigneeId?: number;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';

  @IsInt()
  @IsOptional()
  assigneeId?: number;
}

export interface LoginDto {
  username: string;
  password?: string; 
}

// Trigger rebuild
export interface AuthResponse {
  accessToken: string;
  user: User;
}
