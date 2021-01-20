import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;

      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'could not create restaurant' };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        // { loadRelationIds: true },
      );
      console.log('edit restaurant target:', restaurant);
      if (!restaurant) {
        return { ok: false, error: 'not found restaurant' };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'you can not edit restaurant that you do not own',
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'can not edit restaurnat' };
    }
  }

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        id: deleteRestaurantInput.restaurantId,
      });
      if (!restaurant) {
        return { ok: false, error: 'do not exist restaurant' };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'you can not delete restaurant that you do not own',
        };
      }
      await this.restaurants.delete({ id: deleteRestaurantInput.restaurantId });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'can not delete restaurnat' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      console.log('all categories:', categories);
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return { ok: false, error: 'can not find all categories' };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug(
    categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    try {
      const { slug } = categoryInput;
      const category = await this.categories.findOne(
        { slug },
        { relations: ['restaurants'] },
      );
      if (!category) {
        return { ok: false, error: 'can not find category' };
      }
      return { ok: true, category };
    } catch (error) {
      return { ok: false, error: 'can not load category' };
    }
  }
}
