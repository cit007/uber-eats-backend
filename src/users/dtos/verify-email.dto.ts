import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common-output.dto';
import { Verfication } from '../entities/verification.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verfication, ['code']) {}

@ObjectType()
export class VerifyEmailOutput extends CommonOutput {}
