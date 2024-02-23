import Joi from 'joi';
import joi from 'joi';

export function validationSignup(obj: Object) {
  const schema = joi.object({
    email: joi.string().trim().required().email(),
    userName: joi.string().trim().required().min(2).max(15),
    password: joi.string().required().min(8),
    passwordConfirm: joi.string().required().min(8).valid(joi.ref('password')),
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

export function validationChangePassword(obj: Object) {
  const schema = joi.object({
    currentPassword: joi.string().required(),
    password: joi.string().required().min(8),
    passwordConfirm: joi.string().required().min(8).valid(joi.ref('password')),
  });

  return schema.validate(obj);
}

export function validationresetPassword(obj: Object) {
  const schema = joi.object({
    password: joi.string().required().min(8),
    passwordConfirm: joi.string().required().min(8).valid(joi.ref('password')),
  });

  return schema.validate(obj);
}
