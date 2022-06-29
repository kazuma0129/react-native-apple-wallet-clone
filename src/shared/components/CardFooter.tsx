import React from 'react';
import { View, Text } from 'react-native';
import { baseColors } from '../constants/color';

export interface CardFooterProps {
  cardMonth: string;
  cardYear: string;
  cardCvc: string;
}
export const CardFooter = ({ cardMonth, cardYear, cardCvc }: CardFooterProps) => {
  return (
    <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
      <View
        style={{
          padding: 10,
          flexDirection: 'column',
        }}
      >
        <Text style={{ color: baseColors.grayLight, fontSize: 10, paddingBottom: 5 }}>Expiry</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ color: baseColors.white, fontSize: 14, paddingRight: 5 }}>
            {cardMonth}
          </Text>
          <Text style={{ color: baseColors.white, fontSize: 14 }}>{cardYear}</Text>
        </View>
      </View>

      <View
        style={{
          padding: 10,
          flexDirection: 'column',
        }}
      >
        <Text style={{ color: baseColors.grayLight, fontSize: 10, paddingBottom: 5 }}>cvc</Text>
        <Text style={{ color: baseColors.white, fontSize: 14, width: 32 }}>{cardCvc}</Text>
      </View>
    </View>
  );
};
