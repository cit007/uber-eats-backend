import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common-output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field((type) => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CommonOutput {}
