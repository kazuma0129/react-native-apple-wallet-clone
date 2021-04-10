import * as cardKeysRepository from '../repositories/card_keys';
import * as cardsRepository from '../repositories/cards';

/**
 * 登録済みカード 一件取得
 * @param key
 */
export const getOne = async (key: string): Promise<CardItem> => {
  const card = await cardsRepository.getOne(key);
  if (card === null) {
    throw Error;
  }
  return card;
};

/**
 * 登録済みカード全件取得
 */
export const getAllSavedCards = async (): Promise<CardItem[]> => {
  const cardKey = await cardKeysRepository.getOne();
  if (cardKey === null) {
    throw Error();
  }
  const allSavedCards = await Promise.all(cardKey.keys.map(cardsRepository.getOne));
  // TypeScriptでfilterを推論できないのでforEachで擬似的にフィルタリング
  const results: CardItem[] = [];
  allSavedCards.forEach((e) => {
    if (e !== null) {
      results.push(e);
    }
  });
  return results;
};

/**
 * 登録済みカード全件削除
 */
export const removeAllSavedCards = async (): Promise<void> => {
  const cardKey = await cardKeysRepository.getOne();
  if (cardKey === null) {
    throw Error();
  }
  await cardsRepository.removeMany(cardKey.keys);
  await cardKeysRepository.removeOne();
};
