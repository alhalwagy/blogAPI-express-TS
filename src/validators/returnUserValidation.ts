import { User } from '@prisma/client';

export function exclude<Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key as Key))
  ) as Omit<User, Key>;
}

export function excludeFromUsersArray<Key extends keyof User>(
  user: User[],
  keys: Key[]
) {
  return user.map(
    (user) =>
      Object.fromEntries(
        Object.entries(user).filter(([key]) => !keys.includes(key as Key))
      ) as Omit<User, Key>
  );
}
