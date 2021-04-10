import LottieView from 'lottie-react-native';
import React from 'react';
import { Text, TouchableHighlight } from 'react-native';
import * as cardsRepository from '../repositories/cards';
import * as cardsService from '../services/cards';
import * as cardKeysService from '../services/card_keys';

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
          cardKeysService.updateCardKeys(inputCardInfo.id),
          // insert new card info
          cardsRepository.createOne(inputCardInfo),
        ]);

        const cardList = await cardsService.getAllSavedCards();
        setCard(cardList);
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
