import * as secureStoreDriver from '../drivers/secure_store';
import { STORE_CREDIT_CARD_KEY_DELIMITER, STORE_CREDIT_CARD_KEY_PREFIX } from '../constants/store';

/**
 * idからカードのキーを生成
 * @param index
 */
export const genStoreCardItemKey = (index: string): string => {
  return `${STORE_CREDIT_CARD_KEY_PREFIX}${STORE_CREDIT_CARD_KEY_DELIMITER}${index}`;
};

/**
 * カード 作成
 * @param cardDada
 */
export const createOne = async (cardDada: CardItem): Promise<void> => {
  const key = genStoreCardItemKey(cardDada.id);
  return secureStoreDriver.saveOne({ key, val: cardDada });
};

/**
 * カード 1件取得
 * @param key
 */
export const getOne = async (key: string): Promise<CardItem | null> => {
  return secureStoreDriver.getOne<CardItem>({ key });
};

/**
 * カード 1件削除
 * @param key
 */
export const removeOne = async (key: string): Promise<void> => {
  return secureStoreDriver.deleteOne({ key });
};

/**
 * カード 複数件削除
 * @param keys
 */
export const removeMany = async (keys: string[]): Promise<void[]> => {
  return Promise.all(keys.map(removeOne));
};
