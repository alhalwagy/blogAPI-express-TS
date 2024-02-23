import joi from 'joi';

export function validationSignup(obj: Object) {
  const schema = joi.object({
    email: joi.string().trim().required().email(),

    userName: joi.string().trim().required().min(2).max(15),
    password: joi.string().required().min(8),
    firstName: joi.string().required().max(30),
    lastName: joi.string().required().max(30),
  });

  return schema.validate(obj);
}

export function validationSignin(obj: Object) {
  const schema = joi.object({
    email: joi.string().required().trim(),
    password: joi.string().required(),
  });

  return schema.validate(obj);
}
