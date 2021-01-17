import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common-output.dto';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImage',
  'address',
]) {
  @Field((Type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CommonOutput {}
