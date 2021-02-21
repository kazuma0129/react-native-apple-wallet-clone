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
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';

import { CreditCardInput, LiteCreditCardInput } from 'react-native-credit-card-input';
import { Snackbar, Icon } from 'react-native-magnus';

import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';

const sleep = (second) => new Promise((resolve) => setTimeout(resolve, second * 1000));
const snackbarRef = React.createRef();

const saveOne = async ({ key, val }) => {
  await SecureStore.setItemAsync(key, JSON.stringify(val)); // save value must be string
};

const saveMany = async (arr) => {
  await Promise.all(arr.map(saveOne));
};

const getOne = async ({ key, options }) => {
  const result = await SecureStore.getItemAsync(key, options);
  return JSON.parse(result);
};

const getAllCardKeys = async () => {
  const result = await getOne({
    key: STORE_CREDIT_CARD_SAVED_LIST_KEY,
  });
  if (result === null) {
    return [];
  }
  return result.keys;
};

const getAllSavedCards = async () => {
  const savedCardKeys = await getAllCardKeys();
  const allSavedCards = (
    await Promise.all(
      savedCardKeys.map((key) => {
        return getOne({ key });
      })
    )
  ).flat();
  return allSavedCards;
};

const deleteOne = async ({ key, options }) => {
  await SecureStore.deleteItemAsync(key, options);
};

const deleteMany = async (arr) => {
  await Promise.all(arr.map(deleteOne));
};

const flashAllSavedCards = async () => {
  const cardKeys = await getAllCardKeys();
  await Promise.all(
    cardKeys.map((key) => {
      deleteOne({ key });
    })
  );
  await deleteOne({ key: STORE_CREDIT_CARD_SAVED_LIST_KEY });
};

const STORE_CREDIT_CARD_KEY_DELIMITER = '_';
const STORE_CREDIT_CARD_KEY_PREFIX = 'card';
const STORE_CREDIT_CARD_SAVED_LIST_KEY = 'savedCardList';

const CARD_IMAGE_BASE_PATH = './assets/cards/';

const CARD_IMAGE_PATH = {
  VISA: `${CARD_IMAGE_BASE_PATH}visa_PNG30.png`,
  MASTERCARD: `${CARD_IMAGE_BASE_PATH}mc_symbol_opt_73_3x.png`,
  AMERICAN_EXPRESS: `${CARD_IMAGE_BASE_PATH}Amex_logo_color.png`,
  JCB: `${CARD_IMAGE_BASE_PATH}`,
};

// require(CARD_IMAGE_PATH.MASTERCARD)

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
const defaultCards = [...Array(10)].map((el, i) => ({ ...cardData, id: i }));

// card item component
const Card = ({ id, name: propName, type: propType }) => {
  const [visibleCardInfo, setVisibleCardInfo] = useState(false);

  const [name, setName] = useState(propName);
  const [number, setNumber] = useState(invisibleCardData.number);
  const [MM, setMM] = useState(invisibleCardData.MM);
  const [YY, setYY] = useState(invisibleCardData.YY);
  const [cvc, setCvc] = useState(invisibleCardData.cvc);
  const [type, setType] = useState(propType);

  const cardImage = ((type) => {
    switch (type) {
      case 'visa':
        return require('./assets/cards/visa_PNG30.png');
      case 'master-card':
        return require('./assets/cards/mc_symbol_opt_73_3x.png');
      case 'jcb':
        return require('./assets/cards/JCB_logo_logotype_emblem_Japan_Credit_Bureau.png');
      case 'american-express':
        return require('./assets/cards/Amex_logo_color.png');
      default:
        return require('./assets/cards/Amex_logo_color.png');
    }
  })(type);

  return (
    <Pressable
      pressRetentionOffset
      onLongPress={async () => {
        await Haptics.impactAsync();
      }}
      onPressOut={async () => {}}
    >
      <LinearGradient
        colors={['#44A5FF', '#393FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          ...styles.container,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              height: 40,
              width: 100,
              marginLeft: 10,
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
          <TouchableOpacity
            style={{
              justifyContent: 'center',
            }}
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
            <Text style={{ color: '#000', fontSize: 20, paddingBottom: 10, paddingRight: 10 }}>
              {visibleCardInfo ? '🙈' : '🙉'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            alignSelf: 'center',
          }}
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
              ...styles.cardTextColorLight,
              alignSelf: 'center',
              fontSize: 32,
              fontWeight: '300',
              letterSpacing: 1.5,
            }}
          >
            {number}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            ...styles.cardTextColorLight,
            paddingHorizontal: 10,
            alignSelf: 'flex-end',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              ...styles.cardTextColorLight,
              paddingHorizontal: 10,
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              ...styles.cardTextColorLight,
              paddingHorizontal: 10,
            }}
          >{`${MM}/${YY}`}</Text>
          <Text
            style={{
              ...styles.cardTextColorLight,
            }}
          >
            {type}
          </Text>
        </View>

        <Text
          style={{
            ...styles.cardTextColorLight,
            padding: 10,
            fontSize: 18,
            alignSelf: 'flex-end',
            display: 'flex',
          }}
        >
          {cvc}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [cardInfoValid, setCardInfoValid] = useState(false);
  const [cards, setCard] = useState([]);
  const [inputCardInfo, setInputCardInfo] = useState({});
  const [shouldReAuth, setShouldReAuth] = useState(false);

  const [startUp, setStartUp] = useState(true);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

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

  const _handleAppStateChange = (nextAppState) => {
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

  const renderItem = ({ item }) => <Card id={item.id} name={item.name} type={item.type} />;

  const CardListHeaderComponent = () => {
    return (
      <View style={styles.viewWrapper}>
        <Text style={styles.titleText}>💳</Text>
        {/* <Text
          style={styles.titleText}
          onPress={async () => {
            await flashAllSavedCards();
          }}
        >
          🆑
        </Text> */}
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
                // cardImageFront={require('./assets/ios/Icon-dark-mono.png')}
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
                  if (form.valid && form.status.name === 'valid') {
                    // Keyboard.dismiss();
                    setCardInfoValid(true);
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
                        keys: [...cards, inputCardInfo].map((card) => genStoreCardItemKey(card.id)),
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

      <FlatList
        data={cards}
        inverted={false}
        renderItem={renderItem}
        ListHeaderComponent={CardListHeaderComponent}
        keyExtractor={(item) => {
          if (item === null) {
            return;
          }
          return item.id.toString();
        }}
      ></FlatList>

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
    // // backgroundColor: '#fff',
    // // alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: 230,
    // // borderColor: '#fff',
    // borderWidth: 1,
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
    // width: '100%',
    // height: '90%',
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
