import { Schema, model, Types } from 'mongoose';
import User from './User';

export const DOCUMENT_NAME = 'Blog';
export const COLLECTION_NAME = 'blogs';

export default interface Blog {
  _id: Types.ObjectId;
  title: string;
  description: string;
  text?: string;
  draftText?: string;
  tags: string[];
  author: User;
  imgUrl?: string;
  blogUrl: string;
  likes?: number;
  score: number;
  isSubmitted: boolean;
  isDraft: boolean;
  isPublished: boolean;
  status?: boolean;
  publishedAt?: Date;
  createdBy?: User;
  updatedBy?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Blog>(
  {
    title: {
      type: Schema.Types.String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    text: {
      type: Schema.Types.String,
      required: false,
      select: false,
    },
    draftText: {
      type: Schema.Types.String,
      required: true,
      select: false,
    },
    tags: [
      {
        type: Schema.Types.String,
        trim: true,
        uppercase: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imgUrl: {
      type: Schema.Types.String,
      required: false,
      maxlength: 500,
      trim: true,
    },
    blogUrl: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      maxlength: 200,
      trim: true,
    },
    likes: {
      type: Schema.Types.Number,
      default: 0,
    },
    score: {
      type: Schema.Types.Number,
      default: 0.01,
      max: 1,
      min: 0,
    },
    isSubmitted: {
      type: Schema.Types.Boolean,
      default: false,
      select: false,
      index: true,
    },
    isDraft: {
      type: Schema.Types.Boolean,
      default: true,
      select: false,
      index: true,
    },
    isPublished: {
      type: Schema.Types.Boolean,
      default: false,
      select: false,
      index: true,
    },
    publishedAt: {
      type: Schema.Types.Date,
      required: false,
      index: true,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
    },
    createdAt: {
      type: Date,
      required: true,
      select: false,
    },
    updatedAt: {
      type: Date,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

schema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 3, description: 1 }, background: false },
);
schema.index({ _id: 1, status: 1 });
schema.index({ blogUrl: 1, status: 1 });
schema.index({ isPublished: 1, status: 1 });
schema.index({ _id: 1, isPublished: 1, status: 1 });
schema.index({ tags: 1, isPublished: 1, status: 1 });

export const BlogModel = model<Blog>(DOCUMENT_NAME, schema, COLLECTION_NAME);
