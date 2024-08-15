import { Article, ArticleStatus } from 'Database/entities/article';
import { z } from 'zod';

export default class UpdateArticleValidator {
  static schema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    slug: z.string().min(1),
    body: z.string().min(1),
    categoryId: z.number(),
    status: z.nativeEnum(ArticleStatus),
  });

  static validate = this.schema.safeParse;
}
