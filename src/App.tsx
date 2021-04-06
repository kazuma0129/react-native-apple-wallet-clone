import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
} from 'react-native';

import { Snackbar, Icon } from 'react-native-magnus';
import LottieView from 'lottie-react-native';

import { registerRootComponent } from 'expo';
import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';

import { snackbarRef } from './shared/components/card';
import { CardList } from './shared/components/card_list';
import { CardRegisterButton } from './shared/components/card_register_button';
import { CardInput } from './shared/components/card_input';
import { getAllSavedCards } from './shared/repositories/cards';

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

  const animation = useRef(LottieView.prototype);

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
  };

  // only one call when application startUp
  useEffect(() => {
    (async () => {
      if (startUp) {
        await LocalAuthentication.authenticateAsync();
        setStartUp(false);
        const savedCards = await getAllSavedCards();
        setCard(savedCards);
      }
    })();
    return () => {};
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
      <Modal animationType='fade' transparent={true} visible={modalVisible}>
        <BlurView intensity={100} style={[StyleSheet.absoluteFill]}>
          <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <CardInput
                  cards={cards}
                  setCardInfoValid={setCardInfoValid}
                  setInputCardInfo={setInputCardInfo}
                ></CardInput>

                <CardRegisterButton
                  cardInfoValid={cardInfoValid}
                  modalVisible={modalVisible}
                  inputCardInfo={inputCardInfo}
                  cards={cards}
                  animation={animation}
                  setModalVisible={setModalVisible}
                  setCard={setCard}
                />
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </BlurView>
      </Modal>

      <CardList
        cards={cards}
        setCardInfoValid={setCardInfoValid}
        setModalVisible={setModalVisible}
      />

      <TouchableOpacity
        style={{ padding: 100, backgroundColor: 'transparent' }}
        onPress={() => animation.current.reset()}
      >
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
    width: 300,
    backgroundColor: 'transparent',
    borderRadius: 20,
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
