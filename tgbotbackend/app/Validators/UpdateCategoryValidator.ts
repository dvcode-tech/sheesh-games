import { z } from 'zod';

export default class UpdateCategoryValidator {
  static schema = z.object({
    name: z.string().min(1),
  });

  static validate = this.schema.safeParse;
}
