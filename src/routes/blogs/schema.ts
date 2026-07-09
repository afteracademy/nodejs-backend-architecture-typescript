import z from 'zod';
import { zObjectId } from '../../helpers/validator';

export default {
  blogId: z.object({
    id: zObjectId(),
  }),
  blogTag: z.object({
    tag: z.string(),
  }),
  pagination: z.object({
    pageNumber: z.coerce.number().int().min(1),
    pageItemCount: z.coerce.number().int().min(1),
  }),
  authorId: z.object({
    id: zObjectId(),
  }),
  trending: Joi.object().keys({
    limit: Joi.number().optional().integer().min(1),
  }),
};
