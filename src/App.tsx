import { registerRootComponent } from 'expo';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Icon, Snackbar } from 'react-native-magnus';
import { snackbarRef } from './shared/components/Card';
import { CardInput } from './shared/components/CardInput';
import { CardList } from './shared/components/CardList';
import { CardRegisterButton } from './shared/components/CardRegisterButton';
import * as cardsService from './shared/services/cards';

import * as cardKeysService from './shared/services/card_keys';
import * as cardsRepository from './shared/repositories/cards';

import useAuthentication from './shared/hooks/useAuthentication';

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

  useAuthentication({
    mode: 'onInactive',
    onStartup: async () => {
      const savedCards = await cardsService.getAllSavedCards();
      setCard(savedCards);
    },
  });

  const animation = useRef(LottieView.prototype);
  const [animationState, setAnimationState] = useState(false);

  const onRegister = async () => {
    setModalVisible(!modalVisible);

    await Promise.all([
      // update already cards info
      cardKeysService.updateCardKeys(inputCardInfo.id),
      // insert new card info
      cardsRepository.createOne(inputCardInfo),
    ]);

    const cardList = await cardsService.getAllSavedCards();
    setCard(cardList);
    setAnimationState(true);
    animation?.current?.play();
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

                <CardRegisterButton disabled={!cardInfoValid} onRegister={onRegister} />
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </BlurView>
      </Modal>

      <CardList cards={cards} setModalVisible={setModalVisible} />

      <Modal transparent={true} visible={animationState}>
        <BlurView intensity={100} style={[StyleSheet.absoluteFill]}>
          <TouchableOpacity
            style={{ ...styles.centeredView, padding: 100, backgroundColor: 'transparent' }}
            onPress={() => {
              animation.current.reset();
              setAnimationState(false);
            }}
          >
            <LottieView
              source={require('./assets/animation/success.json')}
              autoPlay={false}
              loop={false}
              ref={animation}
            />
          </TouchableOpacity>
        </BlurView>
      </Modal>

      <Snackbar
        suffix={<Icon name='checkcircle' color='white' fontSize='md' fontFamily='AntDesign' />}
        m={0}
        mx={40}
        mb={15}
        p={20}
        ref={snackbarRef}
        bg='#999'
        color='white'
        duration={2000}
        // borderColor='white'
        // borderWidth={0.5}
        rounded={10}
      />
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
