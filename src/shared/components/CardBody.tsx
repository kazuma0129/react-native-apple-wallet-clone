import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { baseColors } from '../constants/color';

export interface CardBodyProps {
  cardNumber: string;
  isVisible: boolean;
  onPressOutVisibleButton?: () => void;
  onPressOutCardNumber?: () => void;
}
export const CardBody = ({
  cardNumber,
  isVisible,
  onPressOutVisibleButton,
  onPressOutCardNumber,
}: CardBodyProps) => {
  return (
    <View style={{ paddingLeft: 15, flexDirection: 'column' }}>
      <TouchableOpacity onPressOut={onPressOutVisibleButton}>
        <Text style={{ color: baseColors.grayLight, fontSize: 10, paddingBottom: 10 }}>
          {`Card Number ${isVisible ? '🙉' : '🙈'}`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPressOut={onPressOutCardNumber}>
        <Text
          style={{
            color: baseColors.white,
            fontSize: 24,
            fontWeight: '300',
            letterSpacing: 1.5,
          }}
        >
          {cardNumber}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
