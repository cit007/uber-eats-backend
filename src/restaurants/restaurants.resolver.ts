import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((returns) => [Restaurant])
  myRestaurant(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    return [];
  }
}
