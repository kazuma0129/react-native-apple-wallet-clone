import Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SnackbarRef } from 'react-native-magnus';
import * as cardsRepository from '../repositories/cards';
import * as cardsService from '../services/cards';

const sleep = (second: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, second * 1000));
export const snackbarRef = React.createRef<SnackbarRef>();

type CardProp = {
  id: string;
  name: string;
  type: string;
};

const cardData: CardItem = {
  id: '0',
  name: 'test',
  number: '0000 1111 2222 3333',
  MM: '03',
  YY: '25',
  cvc: '000',
  type: 'visa',
};

const invisibleCardData: CardItem = {
  id: '0',
  name: 'test',
  number: '**** **** **** ****',
  MM: '**',
  YY: '**',
  cvc: '***',
  type: 'visa',
};

export const Card = ({ id, name: propName, type: propType }: CardProp) => {
  const [visibleCardInfo, setVisibleCardInfo] = useState(false);

  const [name, setName] = useState(propName);
  const [number, setNumber] = useState(invisibleCardData.number);
  const [MM, setMM] = useState(invisibleCardData.MM);
  const [YY, setYY] = useState(invisibleCardData.YY);
  const [cvc, setCvc] = useState(invisibleCardData.cvc);
  const [type, setType] = useState(propType);

  const cardImage = ((type) => {
    switch (type) {
      case 'visa':
        return require('../../assets/cards/visa_PNG30.png');
      case 'master-card':
        return require('../../assets/cards/mc_symbol_opt_73_3x.png');
      case 'jcb':
        return require('../../assets/cards/JCB_logo_logotype_emblem_Japan_Credit_Bureau.png');
      case 'american-express':
        return require('../../assets/cards/Amex_logo_color.png');
      default:
        return require('../../assets/cards/Amex_logo_color.png');
    }
  })(type);

  return (
    <Pressable
      // pressRetentionOffset
      onLongPress={async () => {
        await Haptics.impactAsync();
      }}
      onPressOut={async () => {}}
    >
      <LinearGradient
        colors={['#111', '#111', '#111']}
        // colors={['#44A5FF', '#393FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          ...styles.container,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              height: 40,
              width: 100,
              marginLeft: 10,
            }}
          >
            <Image
              source={cardImage}
              resizeMode='contain'
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </View>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
            }}
            onPressOut={async () => {
              setVisibleCardInfo(!visibleCardInfo);
              if (visibleCardInfo) {
                // hide secure values
                setNumber(invisibleCardData.number);
                setMM(invisibleCardData.MM);
                setYY(invisibleCardData.YY);
                setCvc(invisibleCardData.cvc);
              } else {
                // show secure values from SecureStore
                const cardInfo = await cardsService.getOne(cardsRepository.genStoreCardItemKey(id));
                setNumber(cardInfo.number);
                setMM(cardInfo.MM);
                setYY(cardInfo.YY);
                setCvc(cardInfo.cvc);
              }
            }}
          >
            <Text style={{ color: '#000', fontSize: 20, paddingBottom: 10, paddingRight: 10 }}>
              {visibleCardInfo ? '🙈' : '🙉'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            alignSelf: 'center',
          }}
          onPressOut={async () => {
            if (!visibleCardInfo) {
              return;
            }
            const removedWhiteSpaceNumber = number.split(' ').join('');
            Clipboard.setString(removedWhiteSpaceNumber);
            await Haptics.impactAsync();
            await sleep(0.2);
            await Haptics.impactAsync();
            if (snackbarRef.current) {
              snackbarRef.current.show('Copied to your Clipboard!');
            }
          }}
        >
          <Text
            style={{
              ...styles.cardInfoTextMargin,
              ...styles.cardTextColorLight,
              alignSelf: 'center',
              fontSize: 32,
              fontWeight: '300',
              letterSpacing: 1.5,
            }}
          >
            {number}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            ...styles.cardTextColorLight,
            paddingHorizontal: 10,
            alignSelf: 'flex-end',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              ...styles.cardTextColorLight,
              paddingHorizontal: 10,
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              ...styles.cardTextColorLight,
              paddingHorizontal: 10,
            }}
          >{`${MM}/${YY}`}</Text>
          <Text
            style={{
              ...styles.cardTextColorLight,
            }}
          >
            {type}
          </Text>
        </View>

        <Text
          style={{
            ...styles.cardTextColorLight,
            padding: 10,
            fontSize: 18,
            alignSelf: 'flex-end',
            display: 'flex',
          }}
        >
          {cvc}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardInfoTextMargin: {
    marginBottom: 10,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
    height: 230,
    borderRadius: 20,
    padding: 10,
    margin: 10,
    paddingTop: 15,
    marginHorizontal: 20,
    borderColor: '#333',
    borderWidth: 1,
  },
  cardTextColorLight: {
    color: '#fff',
  },
});
