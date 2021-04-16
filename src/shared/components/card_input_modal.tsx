// import { BlurView } from 'expo-blur';
// import LottieView from 'lottie-react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
// import { CardInput } from './card_input';
// import { CardRegisterButton } from './card_register_button';

// export const CardinputModal = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [cardInfoValid, setCardInfoValid] = useState(false);
//   const [cards, setCard] = useState<CardItem[]>([]);
//   const [inputCardInfo, setInputCardInfo] = useState<CardItem>({
//     id: '',
//     name: '',
//     number: '',
//     MM: '',
//     YY: '',
//     cvc: '',
//     type: '',
//   });

//   const animation = useRef(LottieView.prototype);
//   const [animationState, setAnimationState] = useState(false);

//   return (
//     <Modal animationType='fade' transparent={true} visible={modalVisible}>
//       <BlurView intensity={100} style={[StyleSheet.absoluteFill]}>
//         <TouchableOpacity
//           style={styles.centeredView}
//           activeOpacity={1}
//           onPressOut={() => setModalVisible(false)}
//         >
//           <TouchableWithoutFeedback>
//             <View style={styles.modalView}>
//               <CardInput
//                 cards={cards}
//                 setCardInfoValid={setCardInfoValid}
//                 setInputCardInfo={setInputCardInfo}
//               ></CardInput>

//               <CardRegisterButton
//                 cardInfoValid={cardInfoValid}
//                 modalVisible={modalVisible}
//                 inputCardInfo={inputCardInfo}
//                 cards={cards}
//                 animation={animation}
//                 setAnimationState={setAnimationState}
//                 setModalVisible={setModalVisible}
//                 setCard={setCard}
//               />
//             </View>
//           </TouchableWithoutFeedback>
//         </TouchableOpacity>
//       </BlurView>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 22,
//   },
//   modalView: {
//     width: 300,
//     backgroundColor: 'transparent',
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
// });
