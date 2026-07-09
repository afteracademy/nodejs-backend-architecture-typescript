import cache from '..';
import { Key } from '../keys';

async function incrementBlogView(blogId: string) {
  return cache.zIncrBy(Key.BLOGS_TRENDING, 1, blogId);
}

async function getTrendingBlogIds(limit: number) {
  return cache.zRangeWithScores(Key.BLOGS_TRENDING, 0, limit - 1, {
    REV: true,
  });
}

export default {
  incrementBlogView,
  getTrendingBlogIds,
};
