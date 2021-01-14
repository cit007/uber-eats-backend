import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verfication } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verfication)
    private readonly verifications: Repository<Verfication>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const { email, password, role } = createAccountInput;
    // check new user
    try {
      const isMail = await this.users.findOne({ email });
      console.log('login', isMail);
      if (isMail) {
        return { ok: false, error: 'user exists already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'could not create account' };
    }
    // hash password in user.entity.ts using @BeforeInsert
  }

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { email, password } = loginInput;
    console.log('login :', email, password);
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return { ok: false, error: 'user not found' };
      }

      const isPwdOk = await user.checkPassword(password);
      if (!isPwdOk) {
        return { ok: false, error: 'wrong password' };
      }

      // create token without passport package. use jsonwebtoken manually first
      // const token = jwt.sign({ id: user.id }, this.config.get('SECRET_KEY'));
      const token = this.jwtService.sign(user.id);
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findOneUserById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      if (user) {
        return {
          ok: true,
          user: user,
        };
      }
    } catch (error) {
      return { ok: false, error: 'user not Found' };
    }
  }

  async editProfile(
    userId: number,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    // @See if email or password is optional, use {...editProfileInput}. update cause error with undefined field.
    // @Bug update do not call hashPassword() because update do not concerned about entity. just send query. use save()
    // return await this.users.update({ id: userId }, { ...editProfileInput });
    try {
      const { email, password } = editProfileInput;
      const user = await this.users.findOne(userId);
      console.log('E---------------------------');
      if (email) {
        user.email = email;
        user.verified = false;
        //@TODO if data exist, delete it and insert or do not update verification
        // await this.verifications.delete({ user });
        // const verification = await this.verifications.save(
        //   this.verifications.create({ user }),
        // );
        const verification = await this.verifications.findOne(
          { user },
          { relations: ['user'] },
        );
        console.log('verification', verification);
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      password ? (user.password = password) : user.password;
      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        // @Bug save(user) have a problem. it hash password again with hashed password.
        //      -> so, use update function without hashing password again in hook
        // verification.user.verified = true;
        // await this.users.save(verification.user);

        console.log('verification info:', verification);
        await this.users.update(
          { id: verification.user.id },
          { verified: true },
        );
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'verification not found' };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
