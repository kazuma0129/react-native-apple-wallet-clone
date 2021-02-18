import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';

import { CreditCardInput } from 'react-native-credit-card-input';
import { Snackbar, Icon } from 'react-native-magnus';

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import Clipboard from 'expo-clipboard';

const sleep = (second) => new Promise((resolve) => setTimeout(resolve, second * 1000));
const snackbarRef = React.createRef();

const saveOne = async ({ key, val }) => {
  await SecureStore.setItemAsync(key, JSON.stringify(val)); // save value must be string
};

const saveMany = async (KV) => {
  await Promise.all(KV.map(({ key, val }) => saveOne({ key, val })));
};

const getOne = async ({ key, options }) => {
  const result = await SecureStore.getItemAsync(key, options);
  return JSON.parse(result);
};

const STORE_CREDIT_CARD_KEY_DELIMITER = '_';
const STORE_CREDIT_CARD_KEY_PREFIX = 'card';
const STORE_CREDIT_CARD_SAVED_LIST_KEY = 'savedCardList';

const genStoreCardItemKey = (index) => {
  return `${STORE_CREDIT_CARD_KEY_PREFIX}${STORE_CREDIT_CARD_KEY_DELIMITER}${index}`;
};

const cardData = {
  name: 'test',
  number: '0000 1111 2222 3333',
  MM: '03',
  YY: '25',
  cvc: '000',
  type: 'visa',
};

const invisibleCardData = {
  name: 'test',
  number: '**** **** **** ****',
  MM: '**',
  YY: '**',
  cvc: '***',
};

// use only for debug card view
const defaultCards = [...Array(0)].map((el, i) => ({ ...cardData, id: i }));

// card item component
const Card = ({ id, name: propName, type: propType }) => {
  const [visibleCardInfo, setVisibleCardInfo] = useState(false);

  const [name, setName] = useState(propName);
  const [number, setNumber] = useState(invisibleCardData.number);
  const [MM, setMM] = useState(invisibleCardData.MM);
  const [YY, setYY] = useState(invisibleCardData.YY);
  const [cvc, setCvc] = useState(invisibleCardData.cvc);
  const [type, setType] = useState(propType);

  return (
    <Pressable
      style={[styles.container]}
      pressRetentionOffset
      onLongPress={async () => {
        await Haptics.impactAsync();
      }}
      onPressOut={async () => {}}
    >
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
            const cardInfo = await getOne({ key: genStoreCardItemKey(id) });
            setNumber(cardInfo.number);
            setMM(cardInfo.MM);
            setYY(cardInfo.YY);
            setCvc(cardInfo.cvc);
          }
        }}
      >
        <Text style={{ color: '#000', fontSize: 20 }}>{visibleCardInfo ? '🙈' : '🙉'}</Text>
      </TouchableOpacity>
      <Text>{name}</Text>
      <Text>{type}</Text>
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
            snackbarRef.current.show();
          }
        }}
      >
        <Text
          style={{
            ...styles.cardInfoTextMargin,
            fontSize: 32,
            fontWeight: '300',
            letterSpacing: 1.5,
          }}
        >
          {number}
        </Text>
      </TouchableOpacity>
      <Text style={{ ...styles.cardInfoTextMargin, fontSize: 18 }}>{`${MM}/${YY}`}</Text>
      <Text style={{ ...styles.cardInfoTextMargin, fontSize: 18 }}>{cvc}</Text>
    </Pressable>
  );
};

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [cardInfoValid, setCardInfoValid] = useState(false);
  const [cards, setCard] = useState(defaultCards);
  const [inputCardInfo, setInputCardInfo] = useState({});

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, [appStateVisible]);

  const _handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  const renderItem = ({ item }) => <Card id={item.id} name={item.name} type={item.type} />;

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.viewWrapper}>
          <Modal animationType='slide' transparent={true} visible={modalVisible}>
            <TouchableOpacity
              style={styles.centeredView}
              activeOpacity={1}
              onPressOut={() => setModalVisible(false)}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalView}>
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
                    style={{ height: 100 }}
                    onChange={(form) => {
                      if (form.valid) {
                        Keyboard.dismiss();
                        setCardInfoValid(form.valid);
                        const [MM, YY] = form.values.expiry.split('/');
                        const { name, number, cvc, type } = form.values;
                        const card = {
                          id: cards.length,
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

                  <TouchableHighlight
                    style={{
                      backgroundColor: cardInfoValid ? '#2196F3' : '#ff8888',
                      marginTop: 10,
                      padding: 10,
                    }}
                    disabled={!cardInfoValid}
                    onPress={async () => {
                      setModalVisible(!modalVisible);

                      await Promise.all([
                        // update already cards info
                        saveOne({
                          key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
                          val: {
                            length: [...cards, inputCardInfo].length,
                            keys: [...cards, inputCardInfo].map((card) =>
                              genStoreCardItemKey(card.id)
                            ),
                          },
                        }),
                        // insert new card info
                        saveOne({
                          key: genStoreCardItemKey(inputCardInfo.id),
                          val: inputCardInfo,
                        }),
                      ]);
                      const { keys: savedCardKeys } = await getOne({
                        key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
                      });
                      const savedCards = (
                        await Promise.all(
                          savedCardKeys.map((key) => {
                            return getOne({ key });
                          })
                        )
                      ).flat();

                      // update renderItem
                      setCard(savedCards);
                    }}
                  >
                    <Text style={{ ...styles.textStyle }}>register</Text>
                  </TouchableHighlight>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
          <Text style={styles.titleText}>💳</Text>
          <TouchableOpacity>
            <Text
              style={{ ...styles.titleText }}
              onPress={async () => {
                const hasHardwareAsync = await LocalAuthentication.hasHardwareAsync();
                const supportedAuthenticationTypesAsync = await LocalAuthentication.supportedAuthenticationTypesAsync();
                const isEnrolledAsync = await LocalAuthentication.isEnrolledAsync();
                await LocalAuthentication.authenticateAsync();
              }}
            >
              🙂
            </Text>
          </TouchableOpacity>
          <Text style={{ color: '#fff' }}>{appStateVisible}</Text>
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

        <FlatList
          data={cards}
          inverted={true}
          renderItem={renderItem}
          keyExtractor={({ id }) => id.toString()}
        ></FlatList>
      </ScrollView>
      <Snackbar
        suffix={<Icon name='checkcircle' color='white' fontSize='md' fontFamily='AntDesign' />}
        m={40}
        p={20}
        onDismiss={() => {}}
        ref={snackbarRef}
        bg='gray400'
        color='black'
        duration={2000}
      >
        Copied to your Clipboard!
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000',
    padding: 20,
    height: '100%',
  },
  viewWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  cardInfoTextMargin: {
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default App;
