import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(1000),
  completed: Joi.boolean(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(1000),
  completed: Joi.boolean(),
}).min(1);





