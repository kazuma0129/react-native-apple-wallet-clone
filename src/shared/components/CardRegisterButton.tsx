import React from 'react';
import { Text, TouchableHighlight } from 'react-native';

export const CardRegisterButton = ({
  disabled,
  onRegister,
}: {
  disabled: boolean;
  onRegister?: () => void;
}) => {
  return (
    <TouchableHighlight
      style={{
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}
      disabled={disabled}
      onPress={() => {
        onRegister && onRegister();
      }}
    >
      <Text
        style={{
          backgroundColor: disabled ? '#aaa' : '#2196F3',
          padding: 10,
          margin: 10,
        }}
      >
        register
      </Text>
    </TouchableHighlight>
  );
};
