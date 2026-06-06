import '../../../database/mock';
import '../../../cache/mock';
import { addHeaders } from '../../../auth/authentication/mock';

import {
  mockBlogCacheFetchById,
  mockBlogCacheFetchByUrl,
  mockBlogCacheSave,
  mockPublishedBlogFindByUrl,
  mockPublishedBlogFindById,
  BLOG_ID,
  BLOG_URL,
  BLOG_2_URL,
  BLOG_2_ID,
} from './mock';

import supertest from 'supertest';
import app from '../../../../src/app';
import { Types } from 'mongoose';

describe('BlogDetail by URL route', () => {
  beforeEach(() => {
    mockBlogCacheFetchByUrl.mockClear();
    mockBlogCacheSave.mockClear();
    mockPublishedBlogFindByUrl.mockClear();
  });

  const request = supertest(app);
  const endpoint = '/blog/url';

  it('Should send error when endpoint query is not passed', async () => {
    const response = await addHeaders(request.get(endpoint));
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/endpoint/);
    expect(response.body.message).toMatch(/required/);
    expect(mockPublishedBlogFindByUrl).not.toHaveBeenCalled();
  });

  it('Should send error when url endpoint is more that 200 chars', async () => {
    const param = new Array(201).fill('a').join('');
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: param }),
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/length must/);
    expect(response.body.message).toMatch(/200/);
    expect(mockPublishedBlogFindByUrl).not.toHaveBeenCalled();
  });

  it('Should send error when blog do not exists for url', async () => {
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: 'xyz' }),
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(mockBlogCacheFetchByUrl).toHaveBeenCalledTimes(1);
    expect(mockBlogCacheFetchByUrl).toHaveBeenCalledWith('xyz');
    expect(mockBlogCacheSave).not.toHaveBeenCalled();
    expect(mockPublishedBlogFindByUrl).toHaveBeenCalledTimes(1);
    expect(mockPublishedBlogFindByUrl).toHaveBeenCalledWith('xyz');
  });

  it('Should send cache data when blog exists for url in cache', async () => {
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: BLOG_URL }),
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/success/);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('_id');

    expect(mockBlogCacheFetchByUrl).toHaveBeenCalledTimes(1);
    expect(mockBlogCacheFetchByUrl).toHaveBeenCalledWith(BLOG_URL);
    expect(mockBlogCacheFetchByUrl).toHaveReturnedTimes(1);

    expect(mockPublishedBlogFindByUrl).not.toHaveBeenCalled();
    expect(mockBlogCacheSave).not.toHaveBeenCalled();
  });

  it('Should send database data when blog dont exists for url in cache', async () => {
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: BLOG_2_URL }),
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/success/);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('_id');

    expect(mockBlogCacheFetchByUrl).toHaveBeenCalledTimes(1);
    expect(mockBlogCacheFetchByUrl).toHaveBeenCalledWith(BLOG_2_URL);
    expect(mockBlogCacheFetchByUrl).toHaveReturnedTimes(1);

    expect(mockPublishedBlogFindByUrl).toHaveBeenCalledTimes(1);
    expect(mockPublishedBlogFindByUrl).toHaveBeenCalledWith(BLOG_2_URL);
    expect(mockPublishedBlogFindByUrl).toHaveReturnedTimes(1);

    expect(mockBlogCacheSave).toHaveBeenCalledTimes(1);
    expect(mockBlogCacheSave).toHaveReturnedTimes(1);
  });
});

describe('BlogDetail by id route', () => {
  beforeEach(() => {
    mockBlogCacheFetchById.mockClear();
    mockBlogCacheSave.mockClear();
    mockPublishedBlogFindById.mockClear();
  });

  const request = supertest(app);
  const endpoint = '/blog/id/';

  it('Should send error when invalid id is passed', async () => {
    const response = await addHeaders(request.get(endpoint + 'abc'));
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/invalid/);
    expect(mockPublishedBlogFindById).not.toHaveBeenCalled();
  });

  it('Should send error when blog do not exists for id', async () => {
    const response = await addHeaders(
      request.get(endpoint + new Types.ObjectId().toHexString()),
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(mockPublishedBlogFindById).toHaveBeenCalledTimes(1);
  });

  it('Should send cache data when blog exists for id in cache', async () => {
    const response = await addHeaders(
      request.get(endpoint + BLOG_ID.toHexString()),
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/success/);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('_id');

    expect(mockBlogCacheFetchById).toHaveBeenCalledTimes(1);
    expect(mockBlogCacheFetchById).toHaveBeenCalledWith(BLOG_ID);
    expect(mockBlogCacheFetchById).toHaveReturnedTimes(1);

    expect(mockPublishedBlogFindById).not.toHaveBeenCalled();
    expect(mockBlogCacheSave).not.toHaveBeenCalled();
  });

  it('Should send database data when blog dont exists for url in cache', async () => {
    const response = await addHeaders(
      request.get(endpoint + BLOG_2_ID.toHexString()),
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/success/);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('_id');

    expect(mockBlogCacheFetchById).toHaveBeenCalledTimes(1);
    expect(mockBlogCacheFetchById).toHaveBeenCalledWith(BLOG_2_ID);
    expect(mockBlogCacheFetchById).toHaveReturnedTimes(1);

    expect(mockPublishedBlogFindById).toHaveBeenCalledTimes(1);
    expect(mockPublishedBlogFindById).toHaveBeenCalledWith(BLOG_2_ID);
    expect(mockPublishedBlogFindById).toHaveReturnedTimes(1);

    expect(mockBlogCacheSave).toHaveBeenCalledTimes(1);
    expect(mockBlogCacheSave).toHaveReturnedTimes(1);
  });
});
