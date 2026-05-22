import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator';

export default {
  blogId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  blogTag: Joi.object().keys({
    tag: Joi.string().required(),
  }),
  pagination: Joi.object().keys({
    pageNumber: Joi.number().required().integer().min(1),
    pageItemCount: Joi.number().required().integer().min(1),
  }),
  authorId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  trending: Joi.object().keys({
    limit: Joi.number().optional().integer().min(1),
  }),
};
