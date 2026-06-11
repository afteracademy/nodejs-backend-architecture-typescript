import Blog, { BlogModel } from '../model/Blog';
import { Types } from 'mongoose';
import User from '../model/User';

const AUTHOR_DETAIL = 'name profilePicUrl';

async function create(blog: Blog): Promise<Blog> {
  const now = new Date();
  blog.createdAt = now;
  blog.updatedAt = now;
  const createdBlog = await BlogModel.create(blog);
  return createdBlog.toObject();
}

async function update(blog: Blog): Promise<Blog | null> {
  blog.updatedAt = new Date();
  return BlogModel.findByIdAndUpdate(blog._id, blog, { new: true })
    .lean()
    .exec();
}

async function findInfoById(id: Types.ObjectId): Promise<Blog | null> {
  return BlogModel.findOne({ _id: id, status: true })
    .populate('author', AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findInfoForPublishedById(
  id: Types.ObjectId,
): Promise<Blog | null> {
  return BlogModel.findOne({ _id: id, isPublished: true, status: true })
    .select('+text')
    .populate('author', AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findBlogAllDataById(id: Types.ObjectId): Promise<Blog | null> {
  return BlogModel.findOne({ _id: id, status: true })
    .select(
      '+text +draftText +isSubmitted +isDraft +isPublished +status +createdBy +updatedBy',
    )
    .populate('author', AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findPublishedByUrl(blogUrl: string): Promise<Blog | null> {
  return BlogModel.findOne({
    blogUrl: blogUrl,
    isPublished: true,
    status: true,
  })
    .select('+text')
    .populate('author', AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findUrlIfExists(blogUrl: string): Promise<Blog | null> {
  return BlogModel.findOne({ blogUrl: blogUrl }).lean().exec();
}

async function findByTagAndPaginated(
  tag: string,
  pageNumber: number,
  limit: number,
): Promise<Blog[]> {
  return BlogModel.find({ tags: tag, status: true, isPublished: true })
    .skip(limit * (pageNumber - 1))
    .limit(limit)
    .populate('author', AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllPublishedForAuthor(user: User): Promise<Blog[]> {
  return BlogModel.find({ author: user, status: true, isPublished: true })
    .populate('author', AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllDrafts(): Promise<Blog[]> {
  return findDetailedBlogs({ isDraft: true, status: true });
}

async function findAllSubmissions(): Promise<Blog[]> {
  return findDetailedBlogs({ isSubmitted: true, status: true });
}

async function findAllPublished(): Promise<Blog[]> {
  return findDetailedBlogs({ isPublished: true, status: true });
}

async function findAllSubmissionsForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({ author: user, status: true, isSubmitted: true });
}

async function findAllPublishedForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({ author: user, status: true, isPublished: true });
}

async function findAllDraftsForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({ author: user, status: true, isDraft: true });
}

async function findDetailedBlogs(
  query: Record<string, unknown>,
): Promise<Blog[]> {
  return BlogModel.find(query)
    .select('+isSubmitted +isDraft +isPublished +createdBy +updatedBy')
    .populate('author', AUTHOR_DETAIL)
    .populate('createdBy', AUTHOR_DETAIL)
    .populate('updatedBy', AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findLatestBlogs(
  pageNumber: number,
  limit: number,
): Promise<Blog[]> {
  return BlogModel.find({ status: true, isPublished: true })
    .skip(limit * (pageNumber - 1))
    .limit(limit)
    .populate('author', AUTHOR_DETAIL)
    .sort({ publishedAt: -1 })
    .lean()
    .exec();
}

async function searchSimilarBlogs(blog: Blog, limit: number): Promise<Blog[]> {
  return BlogModel.find(
    {
      $text: { $search: blog.title, $caseSensitive: false },
      status: true,
      isPublished: true,
      _id: { $ne: blog._id },
    },
    {
      similarity: { $meta: 'textScore' },
    },
  )
    .populate('author', AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .sort({ similarity: { $meta: 'textScore' } })
    .lean()
    .exec();
}

async function search(query: string, limit: number): Promise<Blog[]> {
  return BlogModel.find(
    {
      $text: { $search: query, $caseSensitive: false },
      status: true,
      isPublished: true,
    },
    {
      similarity: { $meta: 'textScore' },
    },
  )
    .select('-status -description')
    .limit(limit)
    .sort({ similarity: { $meta: 'textScore' } })
    .lean()
    .exec();
}

async function searchLike(query: string, limit: number): Promise<Blog[]> {
  return BlogModel.find({
    title: { $regex: `.*${query}.*`, $options: 'i' },
    status: true,
    isPublished: true,
  })
    .select('-status -description')
    .limit(limit)
    .sort({ score: -1 })
    .lean()
    .exec();
}

async function findTrendingBlogs(
  pageNumber: number,
  limit: number,
): Promise<Blog[]> {
  return BlogModel.find({ status: true, isPublished: true })
    .skip(limit * (pageNumber - 1))
    .limit(limit)
    .sort({ score: -1 })
    .populate('author', AUTHOR_DETAIL)
    .lean()
    .exec();
}
async function findAllBlogsByIds(ids: string[]): Promise<Blog[]> {
  return BlogModel.find({ _id: { $in: ids }, status: true, isPublished: true })
    .select('-status -description')
    .lean()
    .exec();
}
export default {
  create,
  update,
  findInfoById,
  findInfoForPublishedById,
  findBlogAllDataById,
  findPublishedByUrl,
  findUrlIfExists,
  findByTagAndPaginated,
  findAllPublishedForAuthor,
  findAllDrafts,
  findAllSubmissions,
  findAllPublished,
  findAllSubmissionsForWriter,
  findAllPublishedForWriter,
  findAllDraftsForWriter,
  findLatestBlogs,
  searchSimilarBlogs,
  search,
  searchLike,
  findTrendingBlogs,
  findAllBlogsByIds,
};
