import joi from 'joi';

export function createPostValidation(obj: Object) {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200).required(),

    content: joi.string().min(10).required(),
    categoryIds: joi.required(),
  });

  return schema.validate(obj);
}

export function updatePostValidation(obj: Object) {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200),
    content: joi.string().trim().min(10),
    categoryIds: joi.array(),
  });
  return schema.validate(obj);
}
