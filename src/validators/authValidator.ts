import joi from 'joi';

export function validationsignup(obj: Object) {
  const schema = joi.object({
    email: joi.string().trim().required().email(),

    userName: joi.string().trim().required().min(2).max(15),
    password: joi.string().required().min(8),
    firstName: joi.string().required().max(30),
    lastName: joi.string().required().max(30),
  });

  return schema.validate(obj);
}
