import React from 'react';
import { Text, TouchableHighlight } from 'react-native';

import LottieView from 'lottie-react-native';

import { genStoreCardItemKey, AllCardRes } from '../repositories/cards';
import { saveOne, getOne } from '../drivers/secure_store';
import { STORE_CREDIT_CARD_SAVED_LIST_KEY } from '../constants/store';

export const CardRegisterButton = ({
  cardInfoValid,
  modalVisible,
  inputCardInfo,
  cards,
  animation,
  setModalVisible,
  setCard,
}: {
  cardInfoValid: Boolean;
  modalVisible: Boolean;
  inputCardInfo: CardItem;
  cards: CardItem[];
  animation: React.MutableRefObject<LottieView>;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setCard: React.Dispatch<React.SetStateAction<CardItem[]>>;
}) => {
  return (
    <TouchableHighlight
      style={{
        alignItems: 'center',
      }}
      disabled={!cardInfoValid}
      onPress={async () => {
        setModalVisible(!modalVisible);

        await Promise.all([
          // update already cards info
          saveOne({
            key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
            val: {
              length: [...cards, inputCardInfo].length,
              keys: [...cards, inputCardInfo].map((card) => genStoreCardItemKey(card.id)),
            },
          }),
          // insert new card info
          saveOne({
            key: genStoreCardItemKey(inputCardInfo.id),
            val: inputCardInfo,
          }),
        ]);
        const allCardRes = await getOne<AllCardRes>({
          key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
        });
        if (allCardRes === null) {
          return;
        }
        const { keys: savedCardKeys } = allCardRes;
        const savedCards = await Promise.all(
          savedCardKeys.map((key) => {
            return getOne<CardItem>({ key });
          })
        );

        const filtered: CardItem[] = [];
        savedCards.forEach((e) => e !== null && filtered.push(e));
        setCard(filtered);
        animation?.current?.play();
      }}
    >
      <Text
        style={{
          backgroundColor: cardInfoValid ? '#2196F3' : '#ff8888',
          padding: 10,
          margin: 10,
        }}
      >
        register
      </Text>
    </TouchableHighlight>
  );
};
