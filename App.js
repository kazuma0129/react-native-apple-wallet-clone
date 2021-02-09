import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableHighlight,
  Carousel,
  Image,
  Linking,
  FlatList,
  Pressable,
} from 'react-native';

import * as Haptics from 'expo-haptics';

const cardData = {
  name: 'test',
  num: '0000111122223333',
  MM: '03',
  YY: '25',
};

const cards = [...Array(10)].map((el, i) => ({ ...cardData, id: i }));

const Card = ({ id, name, num, MM, YY }) => {
  const [onPress, setOnPress] = useState(false);

  return (
    <Pressable
      style={[styles.container, onPress && styles.containerPressed]}
      pressRetentionOffset
      onLongPress={async () => {
        await Haptics.impactAsync();
        setOnPress(true);
      }}
      onPressOut={async () => {
        await Haptics.impactAsync();
        setOnPress(false);
      }}
    >
      <Text>{name}</Text>
      <Text>{`onPress?: ${onPress}`}</Text>
      <Text>{num}</Text>
      <Text>{id}</Text>
      <Text>{`${MM}/${YY}`}</Text>
    </Pressable>
  );
};

const App = () => {
  const renderItem = ({ item }) => (
    <Card id={item.id} name={item.name} num={item.num} MM={item.MM} YY={item.YY} />
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.viewWrapper}>
          <Text style={styles.titleText}>Wallet</Text>
          <Text style={styles.titleText}>+</Text>
        </View>
        <FlatList data={cards} renderItem={renderItem} keyExtractor={({ id }) => id}></FlatList>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000',
  },
  viewWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    margin: 10,
  },
  containerPressed: {
    flex: 1,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    margin: 10,
  },
  titleText: {
    marginTop: 20,
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default App;
