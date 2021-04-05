import * as SecureStore from 'expo-secure-store';
export interface SecureStoreKey {
  key: string;
}
export interface SecureStoreValue<T> {
  val: T;
}
export type SecureStoreItem<T> = SecureStoreKey & SecureStoreValue<T>;
export type GetOneArg = { key: string; options?: SecureStore.SecureStoreOptions };

export const saveOne = async <T extends {}>({ key, val }: SecureStoreItem<T>): Promise<void> => {
  await SecureStore.setItemAsync(key, JSON.stringify(val)); // save value must be string
};

export const saveMany = async <T extends {}>(arr: SecureStoreItem<T>[]): Promise<void> => {
  await Promise.all(arr.map(saveOne));
};

export const getOne = async <T extends {}>({ key, options }: GetOneArg): Promise<T | null> => {
  const result = await SecureStore.getItemAsync(key, options);
  if (result === null) {
    return null;
  }
  return JSON.parse(result);
};

export const deleteOne = async ({ key, options }: GetOneArg): Promise<void> => {
  await SecureStore.deleteItemAsync(key, options);
};

export const deleteMany = async (arr: SecureStoreKey[]): Promise<void> => {
  await Promise.all(arr.map(deleteOne));
};
