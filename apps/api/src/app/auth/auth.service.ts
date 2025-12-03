import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto, AuthResponse, Role } from '@app/data';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ 
      where: { username },
      relations: ['organization']
    });
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Don't strip password here if we return full user object for internal use
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password || '');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { username: user.username, sub: user.id, role: user.role, orgId: user.organization.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  // Helper to seed/create user for testing
  async register(username: string, pass: string, role: Role, orgName: string): Promise<User> {
    let org = await this.orgRepository.findOne({ where: { name: orgName } });
    if (!org) {
      org = this.orgRepository.create({ name: orgName });
      await this.orgRepository.save(org);
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      role,
      organization: org,
    });
    return this.usersRepository.save(user);
  }

  private sanitizeUser(user: User): User {
    const { password, ...result } = user;
    // Ensure organization is included if loaded
    return result as User;
  }
}
