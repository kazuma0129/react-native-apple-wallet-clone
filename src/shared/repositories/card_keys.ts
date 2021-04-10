import * as secureStoreDriver from '../drivers/secure_store';
import { STORE_CREDIT_CARD_SAVED_LIST_KEY } from '../constants/store';

/**
 * カードキーリスト 作成
 * @param data
 */
export const createOne = async (data: CardKeys): Promise<void> => {
  return secureStoreDriver.saveOne({
    key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
    val: data,
  });
};

/**
 * カードキーリスト 取得
 * @param key
 */
export const getOne = async (key = STORE_CREDIT_CARD_SAVED_LIST_KEY): Promise<CardKeys | null> => {
  return secureStoreDriver.getOne<CardKeys>({ key });
};

/**
 * カードキーリスト 削除
 * @param key
 */
export const removeOne = async (key = STORE_CREDIT_CARD_SAVED_LIST_KEY): Promise<void> => {
  return secureStoreDriver.deleteOne({ key });
};
