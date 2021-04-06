import {
  STORE_CREDIT_CARD_KEY_DELIMITER,
  STORE_CREDIT_CARD_KEY_PREFIX,
  STORE_CREDIT_CARD_SAVED_LIST_KEY,
} from '../constants/store';

import { getOne, deleteOne } from '../drivers/secure_store';

export type AllCardRes = {
  keys: string[];
};

export const getAllCardKeys = async (): Promise<string[]> => {
  const result = await getOne<AllCardRes>({
    key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
  });
  if (result === null) {
    return [];
  }
  return result.keys;
};

export const getAllSavedCards = async (): Promise<CardItem[]> => {
  const savedCardKeys = await getAllCardKeys();
  const allSavedCards = await Promise.all(
    savedCardKeys.map((key: string) => {
      return getOne<CardItem>({ key });
    })
  );

  // TypeScriptでfilterを推論できないのでforEachで擬似的にフィルタリング
  const results: CardItem[] = [];
  allSavedCards.forEach((e) => {
    if (e !== null) {
      results.push(e);
    }
  });
  return results;
};

export const flashAllSavedCards = async (): Promise<void> => {
  const cardKeys = await getAllCardKeys();
  await Promise.all(
    cardKeys.map((key) => {
      deleteOne({ key });
    })
  );
  await deleteOne({ key: STORE_CREDIT_CARD_SAVED_LIST_KEY });
};

export const genStoreCardItemKey = (index: string) => {
  return `${STORE_CREDIT_CARD_KEY_PREFIX}${STORE_CREDIT_CARD_KEY_DELIMITER}${index}`;
};
