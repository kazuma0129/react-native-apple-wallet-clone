import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

import { Card } from '../components/card';

export const CardList = ({
  cards,
  setCardInfoValid,
  setModalVisible,
}: {
  cards: CardItem[];
  setCardInfoValid: React.Dispatch<React.SetStateAction<boolean>>;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const renderItem = ({ item }: { item: CardItem }) => (
    <Card id={item.id} name={item.name} type={item.type} />
  );

  const CardListHeaderComponent = () => {
    return (
      <View style={styles.viewWrapper}>
        <Text style={styles.titleText}>💳</Text>
        <TouchableOpacity>
          <Text
            style={{ ...styles.titleText }}
            onPress={() => {
              setCardInfoValid(false);
              setModalVisible(true);
            }}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={cards}
      inverted={false}
      renderItem={renderItem}
      ListHeaderComponent={CardListHeaderComponent}
      keyExtractor={(item) => {
        return item.id.toString();
      }}
    ></FlatList>
  );
};

const styles = StyleSheet.create({
  viewWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  titleText: {
    marginTop: 20,
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
  },
});
