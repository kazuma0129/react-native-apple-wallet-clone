import React from 'react';
import { StyleProp, View, StyleSheet, Text, TextInput } from 'react-native';
import { CreditCardInput } from 'react-native-credit-card-input';

export const CardInput = ({
  cards,
  setCardInfoValid,
  setInputCardInfo,
}: {
  cards: CardItem[];
  setCardInfoValid: React.Dispatch<React.SetStateAction<boolean>>;
  setInputCardInfo: React.Dispatch<React.SetStateAction<CardItem>>;
}) => {
  return (
    <CreditCardInput
      requiresName={true}
      requiresCVC={true}
      placeholders={{
        name: 'my card',
        number: '1234 5678 1234 5678',
        expiry: 'MM/YY',
        cvc: 'CVC',
      }}
      labels={{
        name: 'LABEL',
        number: 'CARD NUMBER',
        expiry: 'EXPIRY',
        cvc: 'CVC/CCV',
      }}
      cardImageFront={100}
      cardImageBack={100}
      invalidColor='#d74545'
      validColor='#2196F3'
      placeholderColor='#aaa'
      inputStyle={(styles.inputStyle as unknown) as StyleProp<TextInput>}
      inputContainerStyle={(styles.inputContainerStyle as unknown) as StyleProp<View>}
      onChange={(form: {
        valid: boolean;
        status: {
          name: string;
        };
        values: {
          expiry: string;
          name: string;
          number: string;
          cvc: string;
          type: string;
        };
      }) => {
        if (form.valid && form.status.name === 'valid') {
          // Keyboard.dismiss();
          setCardInfoValid(true);
          const [MM, YY] = form.values.expiry.split('/');
          const { name, number, cvc, type } = form.values;
          const card: CardItem = {
            id: cards.length.toString(),
            name,
            number,
            MM,
            YY,
            cvc,
            type,
          };
          setInputCardInfo(card);
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  inputStyle: {
    fontSize: 16,
    color: '#fff',
  },
  inputContainerStyle: {
    // backgroundColor: '#fff',
  },
});
