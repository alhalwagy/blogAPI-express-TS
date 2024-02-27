import joi from 'joi';

export function validateCreateComment(obj: Object) {
  const schema = joi.object({
    postId: joi.number().required(),
    content: joi.string().required(),
  });
  return schema.validate(obj);
}
