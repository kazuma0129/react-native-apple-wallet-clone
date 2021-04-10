import { registerRootComponent } from 'expo';
import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Icon, Snackbar } from 'react-native-magnus';
import { snackbarRef } from './shared/components/card';
import { CardInput } from './shared/components/card_input';
import { CardList } from './shared/components/card_list';
import { CardRegisterButton } from './shared/components/card_register_button';
import * as cardsService from './shared/services/cards';

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
        const savedCards = await cardsService.getAllSavedCards();
        setCard(savedCards);
      }
    })();
    return () => {};
  }, [startUp]);

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
