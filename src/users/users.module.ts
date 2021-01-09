import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ConfigService } from '@nestjs/config';
import { Verfication } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verfication]), ConfigService],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
