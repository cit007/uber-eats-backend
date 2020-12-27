import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((returns) => [Restaurant])
  myRestaurant(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    return [];
  }
  @Mutation((returns) => Boolean)
  createRestaurant(
    @Args('name') name: string,
    @Args('isVegan') name: boolean,
    @Args('address') name: string,
    @Args('ownerName') name: string,
  ): boolean {
    return true;
  }
}
