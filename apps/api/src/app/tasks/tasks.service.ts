import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, Role } from '@app/data';
import { User } from '../entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // Viewers cannot create tasks
    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot create tasks');
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      organization: { id: user.organizationId } as any, // Partial org object
      assignee: createTaskDto.assigneeId
        ? ({ id: createTaskDto.assigneeId } as any)
        : undefined,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(user: User): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { organization: { id: user.organizationId } },
      relations: ['assignee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, user: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, organization: { id: user.organizationId } },
      relations: ['assignee'],
    });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user: User
  ): Promise<Task> {
    // Viewers cannot update tasks
    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot update tasks');
    }

    const task = await this.findOne(id, user);

    if (updateTaskDto.assigneeId) {
      task.assignee = { id: updateTaskDto.assigneeId } as any;
    }
    if (updateTaskDto.title) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      task.description = updateTaskDto.description;
    if (updateTaskDto.status) task.status = updateTaskDto.status;

    return this.tasksRepository.save(task);
  }

  async remove(id: number, user: User): Promise<void> {
    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }
    const task = await this.findOne(id, user);
    await this.tasksRepository.remove(task);
  }

  async removeBulk(status: string, user: User): Promise<void> {
    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }
    if (!status) {
      throw new BadRequestException('Status is required');
    }

    await this.tasksRepository.delete({
      status,
      organization: { id: user.organizationId },
    });
  }
}
