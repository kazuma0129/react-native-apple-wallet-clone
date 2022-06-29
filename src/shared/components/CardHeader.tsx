import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { baseColors } from '../constants/color';

export interface CardHeaderProps {
  name: string;
  cardImage: any;
}

export const CardHeader = ({ name, cardImage }: CardHeaderProps) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: baseColors.white, paddingHorizontal: 15 }}>{name}</Text>

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
  );
};
