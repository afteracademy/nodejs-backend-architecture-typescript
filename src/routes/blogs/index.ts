import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import asyncHandler from '../../helpers/asyncHandler';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import { BadRequestError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import { Types } from 'mongoose';
import User from '../../database/model/User';
import BlogsCache from '../../cache/repository/BlogsCache';
import BlogTrendingCache from '../../cache/repository/BlogTrendingCache';

const router = express.Router();

router.get(
  '/tag/:tag',
  validator(schema.blogTag, ValidationSource.PARAM),
  validator(schema.pagination, ValidationSource.QUERY),
  asyncHandler(async (req, res) => {
    const blogs = await BlogRepo.findByTagAndPaginated(
      req.params.tag,
      parseInt(req.query.pageNumber as string),
      parseInt(req.query.pageItemCount as string),
    );
    return new SuccessResponse('success', blogs).send(res);
  }),
);

router.get(
  '/author/id/:id',
  validator(schema.authorId, ValidationSource.PARAM),
  asyncHandler(async (req, res) => {
    const blogs = await BlogRepo.findAllPublishedForAuthor({
      _id: new Types.ObjectId(req.params.id),
    } as User);
    return new SuccessResponse('success', blogs).send(res);
  }),
);

router.get(
  '/latest',
  validator(schema.pagination, ValidationSource.QUERY),
  asyncHandler(async (req, res) => {
    const blogs = await BlogRepo.findLatestBlogs(
      parseInt(req.query.pageNumber as string),
      parseInt(req.query.pageItemCount as string),
    );
    return new SuccessResponse('success', blogs).send(res);
  }),
);

router.get(
  '/similar/id/:id',
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req, res) => {
    const blogId = new Types.ObjectId(req.params.id);
    let blogs = await BlogsCache.fetchSimilarBlogs(blogId);

    if (!blogs) {
      const blog = await BlogRepo.findInfoForPublishedById(
        new Types.ObjectId(req.params.id),
      );
      if (!blog) throw new BadRequestError('Blog is not available');
      blogs = await BlogRepo.searchSimilarBlogs(blog, 6);

      if (blogs && blogs.length > 0)
        await BlogsCache.saveSimilarBlogs(blogId, blogs);
    }

    return new SuccessResponse('success', blogs ? blogs : []).send(res);
  }),
);

// GET /blogs/trending?limit=10&pageNumber=1
router.get(
  '/trending',
  validator(schema.trending, ValidationSource.QUERY),
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    // const pageNumber = req.query.pageNumber
    //   ? parseInt(req.query.pageNumber as string)
    //   : 1;

    const trending = await BlogTrendingCache.getTrendingBlogIds(limit);

    const blogIds = trending.map((oneItem) => {
      return oneItem.value;
    });

    const allBlogs = await BlogRepo.findAllBlogsByIds(blogIds);
    const blogMap = new Map(
      allBlogs.map((eachBlog) => [eachBlog._id.toString(), eachBlog]),
    );
    //Format the Obtained Data by Views counts for trending
    const formatedResponse = trending.map((oneItem) => {
      const blog = blogMap.get(oneItem.value);
      if (!blog) {
        return null;
      }
      return {
        ...blog,
        views: oneItem.score,
      };
    });
    const finalResponse = formatedResponse.filter((oneBlog) => {
      return oneBlog !== null;
    });
    return new SuccessResponse('success', finalResponse).send(res);
  }),
);

export default router;
