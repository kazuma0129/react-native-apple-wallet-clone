import Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { SnackbarRef } from 'react-native-magnus';

import { invisibleCardData } from '../constants/card';
import * as cardsRepository from '../repositories/cards';
import * as cardsService from '../services/cards';
import * as cardKeysService from '../services/card_keys';
import { sleep } from '../utils/timer';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { CardHeader } from './CardHeader';

export const snackbarRef = React.createRef<SnackbarRef>();

type CardProp = {
  id: string;
  name: string;
  type: string;
};

export const Card = ({ id }: CardProp) => {
  const [visibleCardInfo, setVisibleCardInfo] = useState(false);

  const [cardInfo, setCardInfo] = useState<CardItem>(invisibleCardData);

  const cardImage = ((type) => {
    switch (type) {
      case 'visa':
        return require('../../assets/cards/visa_PNG30.png');
      case 'master-card':
        return require('../../assets/cards/mc_symbol_opt_73_3x.png');
      case 'jcb':
        return require('../../assets/cards/JCB_logo_logotype_emblem_Japan_Credit_Bureau.png');
      case 'american-express':
        return require('../../assets/cards/Amex_logo_baseColors.png');
      default:
        return require('../../assets/cards/Amex_logo_baseColors.png');
    }
  })(cardInfo.type);

  const onCardLongPress = async () => {
    await Haptics.impactAsync();
    Alert.alert(
      'delete this?',
      `id:${id}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await cardsService.removeOneByCardId(id);
            await cardKeysService.removeOne(id);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const onPressOutVisibleButton = async () => {
    setVisibleCardInfo(!visibleCardInfo);
    if (visibleCardInfo) {
      // hide secure values
      setCardInfo(invisibleCardData);
    } else {
      // show secure values from SecureStore
      const cardInfo = await cardsService.getOne(cardsRepository.genStoreCardItemKey(id));
      setCardInfo(cardInfo);
    }
  };

  const onPressOutCardNumber = async () => {
    if (!visibleCardInfo) {
      return;
    }
    const removedWhiteSpaceNumber = cardInfo.number.split(' ').join('');
    await Clipboard.setStringAsync(removedWhiteSpaceNumber);
    await Haptics.impactAsync();
    await sleep(0.2);
    await Haptics.impactAsync();
    if (snackbarRef.current) {
      snackbarRef.current.show('Copied to your Clipboard!');
    }
  };

  return (
    <Pressable
      // pressRetentionOffset
      onLongPress={onCardLongPress}
    >
      <LinearGradient
        colors={['#111', '#111', '#111']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 230,
          borderRadius: 20,
          padding: 10,
          margin: 10,
          paddingTop: 15,
          marginHorizontal: 20,
          borderColor: '#333',
          borderWidth: 1,
        }}
      >
        <CardHeader name={cardInfo.name} cardImage={cardImage} />
        <CardBody
          cardNumber={cardInfo.number}
          isVisible={visibleCardInfo}
          onPressOutVisibleButton={onPressOutVisibleButton}
          onPressOutCardNumber={onPressOutCardNumber}
        />
        <CardFooter cardMonth={cardInfo.MM} cardYear={cardInfo.YY} cardCvc={cardInfo.cvc} />
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({});
