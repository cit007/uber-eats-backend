import { Module } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver, RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantResolver, RestaurantService, CategoryResolver],
})
export class RestaurantsModule {}
