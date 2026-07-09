import Blog from '../../../../src/database/model/Blog';
import { Types } from 'mongoose';

jest.unmock('../../../../src/database/repository/BlogRepo');

export const BLOG_ID = new Types.ObjectId();
export const BLOG_2_ID = new Types.ObjectId();

export const BLOG_URL = 'abc';
export const BLOG_2_URL = 'abc2';

export const mockBlogCacheFetchByUrl = jest.fn(
  async (blogUrl: string): Promise<Blog | null> => {
    if (blogUrl === BLOG_URL)
      return {
        _id: BLOG_ID,
        blogUrl: blogUrl,
      } as Blog;
    return null;
  },
);

export const mockBlogCacheFetchById = jest.fn(
  async (id: Types.ObjectId): Promise<Blog | null> => {
    if (BLOG_ID.equals(id))
      return {
        _id: BLOG_ID,
        blogUrl: BLOG_URL,
      } as Blog;
    return null;
  },
);

export const mockBlogCacheSave = jest.fn(
  async (blog: Blog): Promise<string> => {
    return JSON.stringify(blog);
  },
);

export const mockPublishedBlogFindByUrl = jest.fn(
  async (blogUrl: string): Promise<Blog | null> => {
    if (blogUrl === BLOG_URL)
      return {
        _id: BLOG_ID,
        blogUrl: blogUrl,
      } as Blog;

    if (blogUrl === BLOG_2_URL)
      return {
        _id: BLOG_2_ID,
        blogUrl: blogUrl,
      } as Blog;

    return null;
  },
);

export const mockPublishedBlogFindById = jest.fn(
  async (id: Types.ObjectId): Promise<Blog | null> => {
    if (BLOG_ID.equals(id))
      return {
        _id: BLOG_ID,
        blogUrl: BLOG_URL,
      } as Blog;

    if (BLOG_2_ID.equals(id))
      return {
        _id: BLOG_2_ID,
        blogUrl: BLOG_2_URL,
      } as Blog;

    return null;
  },
);

jest.mock('../../../../src/cache/repository/BlogCache', () => ({
  save: mockBlogCacheSave,
  fetchByUrl: mockBlogCacheFetchByUrl,
  fetchById: mockBlogCacheFetchById,
}));

jest.mock('../../../../src/database/repository/BlogRepo', () => ({
  findPublishedByUrl: mockPublishedBlogFindByUrl,
  findInfoForPublishedById: mockPublishedBlogFindById,
}));

jest.mock('../../../../src/cache/repository/BlogTrendingCache', () => ({
  __esModule: true,
  default: {
    incrementBlogView: jest.fn().mockResolvedValue(1),
    getTrendingBlogIds: jest.fn().mockResolvedValue([]),
  },
}));