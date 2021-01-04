import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<string | undefined> {
    const { email, password, role } = createAccountInput;
    // check new user
    try {
      const isMail = await this.users.findOne({ email });
      if (isMail) {
        return 'user exists already';
      }
      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      return 'could not create account';
    }
    // TODO : hash password
  }
}
