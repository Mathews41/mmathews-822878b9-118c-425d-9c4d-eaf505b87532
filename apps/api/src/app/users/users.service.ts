import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '@app/data';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(currentUser: User): Promise<User[]> {
    // We remove 'organizationId' from select because it's a virtual property in TypeORM 
    // when using @RelationId, and 'find' select works on columns.
    // Instead, we load the organization relation or just the user columns we need.
    // Since we need to exclude password, we can just select the columns we know exist.
    
    const users = await this.usersRepository.find({
      where: { organization: { id: currentUser.organizationId } },
      relations: ['organization']
    });

    // Manually sanitize to avoid exposing password hash
    return users.map(user => {
      const { password, ...rest } = user;
      return rest as User;
    });
  }

  async updateRole(id: number, newRole: Role, currentUser: User): Promise<void> {
    const targetUser = await this.usersRepository.findOne({
      where: { id, organization: { id: currentUser.organizationId } }
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Prevent modifying self
    if (targetUser.id === currentUser.id) {
      throw new ForbiddenException('Cannot modify your own role');
    }

    // Role hierarchy checks
    if (currentUser.role === Role.ADMIN && targetUser.role === Role.OWNER) {
      throw new ForbiddenException('Admins cannot modify Owners');
    }
    
    if (currentUser.role === Role.ADMIN && newRole === Role.OWNER) {
      throw new ForbiddenException('Admins cannot promote to Owner');
    }

    targetUser.role = newRole;
    await this.usersRepository.save(targetUser);
  }
}
