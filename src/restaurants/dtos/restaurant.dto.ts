import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common-output.dto';
import { Restaurant } from '../entities/restaurants.entity';

@ArgsType()
export class RestaurantInput {
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CommonOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
