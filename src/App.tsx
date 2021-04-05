import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import { CreditCardInput } from 'react-native-credit-card-input';
import { Snackbar, Icon } from 'react-native-magnus';

import * as LocalAuthentication from 'expo-local-authentication';
import LottieView from 'lottie-react-native';
import { Card, snackbarRef } from './shared/components/card';
import { getAllSavedCards, genStoreCardItemKey, AllCardRes } from './shared/repositories/cards';
import { saveOne, getOne } from './shared/drivers/secure_store';
import { STORE_CREDIT_CARD_SAVED_LIST_KEY } from './shared/constants/store';

import { registerRootComponent } from 'expo';

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [cardInfoValid, setCardInfoValid] = useState(false);
  const [cards, setCard] = useState<CardItem[]>([]);
  const [inputCardInfo, setInputCardInfo] = useState<CardItem>({
    id: '',
    name: '',
    number: '',
    MM: '',
    YY: '',
    cvc: '',
    type: '',
  });
  const [shouldReAuth, setShouldReAuth] = useState(false);
  const [startUp, setStartUp] = useState(true);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const animation = useRef(null);

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, [appStateVisible]);

  // reAuth when back to foreground from background
  useEffect(() => {
    let didAuth = false;
    (async () => {
      if (shouldReAuth) {
        if (!didAuth) {
          await LocalAuthentication.authenticateAsync();
          setShouldReAuth(false);
        }
      }
    })();
    return () => {
      didAuth = true;
    };
  }, [shouldReAuth]);

  const _handleAppStateChange = (nextAppState: any) => {
    if (appState.current.match(/inactive|background/)) {
    }
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // console.log('App has come to the foreground!');
    }
    if (appState.current === 'background' && nextAppState === 'active') {
      // console.log('App has come to the foreground from background!');
      setShouldReAuth(true);
    }
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      // console.log('App goto background!');
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    animation.current.play();
  };

  // only one call when application startUp
  useEffect(() => {
    // let didLoad = false;
    (async () => {
      if (startUp) {
        // if (startUp && !didLoad) {
        await LocalAuthentication.authenticateAsync();
        setStartUp(false);
        const savedCards = await getAllSavedCards();
        setCard(savedCards);
      }
    })();
    return () => {
      // didLoad = true;
    };
  }, [startUp]);

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
    <SafeAreaView style={styles.wrapper}>
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
                        keys: [...cards, inputCardInfo].map((card) => genStoreCardItemKey(card.id)),
                      },
                    }),
                    // insert new card info
                    saveOne({
                      key: genStoreCardItemKey(inputCardInfo.id),
                      val: inputCardInfo,
                    }),
                  ]);
                  const allCardRes = await getOne<AllCardRes>({
                    key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
                  });
                  if (allCardRes === null) {
                    return;
                  }
                  const { keys: savedCardKeys } = allCardRes;
                  const savedCards = await Promise.all(
                    savedCardKeys.map((key) => {
                      return getOne<CardItem>({ key });
                    })
                  );

                  const filtered: CardItem[] = [];
                  savedCards.forEach((e) => e !== null && filtered.push(e));
                  setCard(filtered);
                }}
              >
                <Text>a</Text>
              </TouchableHighlight>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={cards}
        inverted={false}
        renderItem={renderItem}
        ListHeaderComponent={CardListHeaderComponent}
        keyExtractor={(item) => {
          return item.id.toString();
        }}
      ></FlatList>

      <TouchableOpacity style={{ padding: 100 }} onPress={() => animation.current.reset()}>
        <LottieView
          source={require('./assets/animation/success.json')}
          autoPlay={false}
          loop={false}
          ref={animation}
        />
      </TouchableOpacity>

      <Snackbar
        suffix={<Icon name='checkcircle' color='white' fontSize='md' fontFamily='AntDesign' />}
        m={40}
        mb={60}
        p={25}
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
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
    height: 230,
    borderRadius: 20,
    padding: 10,
    margin: 10,
    paddingTop: 15,
    marginHorizontal: 20,
  },
  cardTextColorLight: {
    color: '#fff',
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
registerRootComponent(App);
