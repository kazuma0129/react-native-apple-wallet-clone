import React, { useEffect } from 'react';
import { StyleProp, View, StyleSheet, TextInput } from 'react-native';
import { CreditCardInput } from 'react-native-credit-card-input';

type CreditCardFormType = {
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
};

export const CardInput = ({
  cards,
  setCardInfoValid,
  setInputCardInfo,
}: {
  cards: CardItem[];
  setCardInfoValid: React.Dispatch<React.SetStateAction<boolean>>;
  setInputCardInfo: React.Dispatch<React.SetStateAction<CardItem>>;
}) => {
  const onChange = (form: CreditCardFormType) => {
    if (!form.valid || form.status.name !== 'valid') {
      return;
    }
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
  };

  useEffect(() => {
    return () => {
      setCardInfoValid(false);
    };
  }, []);

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
      inputStyle={styles.inputStyle as unknown as StyleProp<TextInput>}
      inputContainerStyle={styles.inputContainerStyle as unknown as StyleProp<View>}
      onChange={onChange}
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
