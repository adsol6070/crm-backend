import Joi from "joi";

const register = {
  body: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required(),
  }),
};

export default { register };
