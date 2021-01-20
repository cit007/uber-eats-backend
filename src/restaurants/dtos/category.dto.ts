import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common-output.dto';
import { Category } from '../entities/category.entity';

@ArgsType()
export class CategoryInput {
  @Field((type) => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends CommonOutput {
  @Field((type) => Category, { nullable: true })
  category?: Category;
}
