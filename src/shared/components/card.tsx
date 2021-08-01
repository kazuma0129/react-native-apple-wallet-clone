import Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SnackbarRef } from 'react-native-magnus';
import * as cardsRepository from '../repositories/cards';
import * as cardsService from '../services/cards';
import * as COLOR from '../constants/color';

const sleep = (second: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, second * 1000));
export const snackbarRef = React.createRef<SnackbarRef>();

type CardProp = {
  id: string;
  name: string;
  type: string;
};

const invisibleCardData: CardItem = {
  id: '0',
  name: 'test',
  number: '**** **** **** ****',
  MM: 'MM',
  YY: 'YY',
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
                const key = cardsRepository.genStoreCardItemKey(id);
                await cardsRepository.removeOne(key);
              },
            },
          ],
          { cancelable: false }
        );
      }}
      onPressOut={async () => {}}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              color: COLOR.white,
              paddingHorizontal: 15,
            }}
          >
            {name}
          </Text>
          <View
            style={{
              height: 40,
              width: 60,
              marginLeft: 10,
              paddingRight: 10,
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
        </View>

        <View style={{ paddingLeft: 15, flexDirection: 'column' }}>
          <TouchableOpacity
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
            <Text style={{ color: COLOR.grayLight, fontSize: 10, paddingBottom: 10 }}>
              {`Card Number ${visibleCardInfo ? '🙈' : '🙉'}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
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
                color: COLOR.white,
                fontSize: 24,
                fontWeight: '300',
                letterSpacing: 1.5,
              }}
            >
              {number}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View
            style={{
              padding: 10,
              flexDirection: 'column',
            }}
          >
            <Text style={{ color: COLOR.grayLight, fontSize: 10, paddingBottom: 5 }}>Expiry</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: COLOR.white, fontSize: 14, paddingRight: 5 }}>{MM}</Text>
              <Text style={{ color: COLOR.white, fontSize: 14 }}>{YY}</Text>
            </View>
          </View>

          <View
            style={{
              padding: 10,
              flexDirection: 'column',
            }}
          >
            <Text style={{ color: COLOR.grayLight, fontSize: 10, paddingBottom: 5 }}>cvc</Text>
            <Text style={{ color: COLOR.white, fontSize: 14, width: 32 }}>{cvc}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({});
