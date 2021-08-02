import * as cardsRepository from '../repositories/cards';
import * as cardKeysRepository from '../repositories/card_keys';

/**
 * 登録済みカードのキーリストに新規カードのキーを登録
 * @param insertCardKey
 */
export const updateCardKeys = async (cardId: string): Promise<void> => {
  const insertCardKey = cardsRepository.genStoreCardItemKey(cardId);
  const cardKeys = await cardKeysRepository.getOne();
  if (cardKeys === null) {
    await cardKeysRepository.createOne({
      length: 1,
      keys: [insertCardKey],
    });
    return;
  }
  const { length, keys } = cardKeys;
  if (keys.find((k) => k === insertCardKey)) {
    return;
  }
  await cardKeysRepository.createOne({
    length: length + 1,
    keys: [...keys, insertCardKey],
  });
};

/**
 * keyを1件リストから削除
 * @param cardId
 */
export const removeOne = async (cardId: string): Promise<void> => {
  const cardKey = cardsRepository.genStoreCardItemKey(cardId);
  const cardKeys = await cardKeysRepository.getOne();
  if (cardKeys === null) {
    return;
  }
  const { keys } = cardKeys;
  const removalIndex = keys.findIndex((key) => key === cardKey);
  if (removalIndex < 0) {
    return;
  }
  const afterKeys = keys.splice(removalIndex, 1);
  await cardKeysRepository.createOne({
    length: afterKeys.length,
    keys: afterKeys,
  });
};
