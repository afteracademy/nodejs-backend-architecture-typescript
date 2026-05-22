export enum Key {
  BLOGS_LATEST = 'BLOGS_LATEST',
  BLOGS_TRENDING = 'BLOGS_TRENDING',
}

export enum DynamicKey {
  BLOGS_SIMILAR = 'BLOGS_SIMILAR',
  BLOG = 'BLOG',
}

export type DynamicKeyType = `${DynamicKey}_${string}`;

export function getDynamicKey(key: DynamicKey, suffix: string) {
  const dynamic: DynamicKeyType = `${key}_${suffix}`;
  return dynamic;
}
