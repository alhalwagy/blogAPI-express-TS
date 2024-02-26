import joi from 'joi';

export function createCategoryValidation(obj: Object) {
  const schema = joi.object({
    name: joi.string().trim().min(2).max(50).required(),
  });

  return schema.validate(obj);
}
