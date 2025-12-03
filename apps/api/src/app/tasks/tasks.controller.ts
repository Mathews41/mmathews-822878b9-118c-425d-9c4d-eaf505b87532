import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, Role } from '@app/data';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN) // Owner and Admin can create
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  @Roles(Role.VIEWER) // All roles can view
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.VIEWER)
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(+id, req.user);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req
  ) {
    return this.tasksService.update(+id, updateTaskDto, req.user);
  }

  @Delete()
  @Roles(Role.ADMIN)
  removeBulk(@Query('status') status: string, @Request() req) {
    return this.tasksService.removeBulk(status, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(+id, req.user);
  }
}
