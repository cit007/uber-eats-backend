import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Like, Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurants.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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

  async allRestaurants(
    restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    try {
      const { page } = restaurantsInput;
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });
      console.log(
        'allRestaurants:',
        restaurants,
        'total counts:',
        totalResults,
      );
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: 'could not find all restaurants' };
    }
  }

  async findRestaurantById(
    restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    try {
      const { restaurantId } = restaurantInput;
      const restaurant = await this.restaurants.findOne(
        { id: restaurantId },
        { relations: ['menu'] },
      );
      if (!restaurant) {
        return { ok: false, error: 'not found restaurant' };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return { ok: false, error: 'could not find one restaurant' };
    }
  }

  async searchRestaurantByName(
    searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    try {
      const { query, page } = searchRestaurantInput;
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          // name: Raw((name) => `${name} ILIKE '%${query}%'`),
          name: ILike(`%${query}%`),
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return { ok: false, error: 'could not search restaurant' };
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
      const { slug, page } = categoryInput;
      const category = await this.categories.findOne(
        { slug },
        // { relations: ['restaurants'] },
      );
      if (!category) {
        return { ok: false, error: 'can not find category' };
      }

      const restaurants = await this.restaurants.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25,
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);

      return { ok: true, category, totalPages: Math.ceil(totalResults / 25) };
    } catch (error) {
      return { ok: false, error: 'can not load category' };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(
        { id: editDishInput.dishId },
        { relations: ['restaurant'] },
      );
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You can not do that because owner id is not matched',
        };
      }

      await this.dishes.save({
        id: editDishInput.dishId,
        ...editDishInput,
      });

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(
        { id: deleteDishInput.dishId },
        { relations: ['restaurant'] },
      );
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      console.log('deleteDish :', dish);
      console.log('deleteDish-ownerId :', dish.restaurant);
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You can not do that because owner id is not matched',
        };
      }
      await this.dishes.delete(deleteDishInput.dishId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }
}
