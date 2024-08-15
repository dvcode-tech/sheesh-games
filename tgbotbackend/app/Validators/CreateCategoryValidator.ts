import { z } from 'zod';

export default class CreateCategoryValidator {
  static schema = z.object({
    name: z.string().min(1),
  });

  static validate = this.schema.safeParse;
}
