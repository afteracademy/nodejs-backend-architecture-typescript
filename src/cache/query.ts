import cache from '.';
import { DynamicKeyType, Key } from './keys';

export enum TYPES {
  LIST = 'list',
  STRING = 'string',
  HASH = 'hash',
  ZSET = 'zset',
  SET = 'set',
}

export async function keyExists(...keys: string[]) {
  return (await cache.exists(keys)) ? true : false;
}

export async function setValue(
  key: Key | DynamicKeyType,
  value: string | number,
  expireAt: Date | null = null,
) {
  if (expireAt) return cache.pSetEx(key, expireAt.getTime(), `${value}`);
  else return cache.set(key, `${value}`);
}

export async function getValue(key: Key | DynamicKeyType) {
  return cache.get(key);
}

export async function delByKey(key: Key | DynamicKeyType) {
  return cache.del(key);
}

export async function setJson(
  key: Key | DynamicKeyType,
  value: Record<string, unknown>,
  expireAt: Date | null = null,
) {
  const json = JSON.stringify(value);
  return await setValue(key, json, expireAt);
}

export async function getJson<T>(key: Key | DynamicKeyType) {
  const type = await cache.type(key);
  if (type !== TYPES.STRING) return null;

  const json = await getValue(key);
  if (json) return JSON.parse(json) as T;

  return null;
}

export async function setList(
  key: Key | DynamicKeyType,
  list: any[],
  expireAt: Date | null = null,
) {
  const multi = cache.multi();
  const values: any[] = [];
  for (const i in list) {
    values[i] = JSON.stringify(list[i]);
  }
  multi.del(key);
  multi.rPush(key, values);
  if (expireAt) multi.pExpireAt(key, expireAt.getTime());
  return await multi.exec();
}

export async function addToList(key: Key | DynamicKeyType, value: any) {
  const type = await cache.type(key);
  if (type !== TYPES.LIST) return null;

  const item = JSON.stringify(value);
  return await cache.rPushX(key, item);
}

export async function getListRange<T>(
  key: Key | DynamicKeyType,
  start = 0,
  end = -1,
) {
  const type = await cache.type(key);
  if (type !== TYPES.LIST) return null;

  const list = await cache.lRange(key, start, end);
  if (!list) return null;

  const data = list.map((entry) => JSON.parse(entry) as T);
  return data;
}

export async function setOrderedSet(
  key: Key,
  items: Array<{ score: number; value: any }>,
  expireAt: Date | null = null,
) {
  const multi = cache.multi();
  for (const item of items) {
    item.value = JSON.stringify(item.value);
  }
  multi.del(key);
  multi.zAdd(key, items);
  if (expireAt) multi.pExpireAt(key, expireAt.getTime());
  return await multi.exec();
}

export async function addToOrderedSet(
  key: Key,
  items: Array<{ score: number; value: any }>,
) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  for (const item of items) {
    item.value = JSON.stringify(item.value);
  }
  return await cache.zAdd(key, items);
}

export async function removeFromOrderedSet(key: Key, ...items: any[]) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  items = items.map((item) => JSON.stringify(item));
  return await cache.zRem(key, items);
}

export async function getOrderedSetRange<T>(key: Key, start = 0, end = -1) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  const set = await cache.zRangeWithScores(key, start, end);

  const data: { score: number; value: T }[] = set.map((entry) => ({
    score: entry.score,
    value: JSON.parse(entry.value),
  }));
  return data;
}

export async function getOrderedSetMemberScore(key: Key, member: any) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  return await cache.zScore(key, JSON.stringify(member));
}

export async function watch(key: Key | DynamicKeyType) {
  return await cache.watch(key);
}

export async function unwatch() {
  return await cache.unwatch();
}

export async function expire(expireAt: Date, key: Key | DynamicKeyType) {
  return await cache.pExpireAt(key, expireAt.getTime());
}

export async function expireMany(expireAt: Date, ...keys: string[]) {
  let script = '';
  for (const key of keys) {
    script += `redis.call('pExpireAt', '${key}',${expireAt.getTime()})`;
  }
  return await cache.eval(script);
}
