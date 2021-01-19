import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common-output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field((type) => Number)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CommonOutput {}
