import * as cardsRepository from '../repositories/cards';
import * as cardKeysRepository from '../repositories/card_keys';

/**
 * 登録済みカードのキーリストに新規カードのキーを登録
 * @param insertCardKey
 */
export const updateCardKeys = async (insertCardKey: string) => {
  const cardKeys = await cardKeysRepository.getOne();
  if (cardKeys === null) {
    return;
  }
  const { length, keys } = cardKeys;
  await cardKeysRepository.createOne({
    length: length + 1,
    keys: [...keys, cardsRepository.genStoreCardItemKey(insertCardKey)],
  });
};
