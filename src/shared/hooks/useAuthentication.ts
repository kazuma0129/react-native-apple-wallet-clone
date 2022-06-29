import { useRef, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authenticateAsync } from 'expo-local-authentication';

const useAuthentication = ({
  mode = 'onInactive',
  onStartup,
}: {
  mode: 'onActive' | 'onBackground' | 'onInactive';
  onStartup?: () => void;
}) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [shouldReAuth, setShouldReAuth] = useState(false);
  const [startUp, setStartUp] = useState(true);

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
          await authenticateAsync();
          setShouldReAuth(false);
        }
      }
    })();
    return () => {
      didAuth = true;
    };
  }, [shouldReAuth]);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
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
        await authenticateAsync();
        setStartUp(false);
        onStartup && onStartup();
      }
    })();
    return () => {};
  }, [startUp]);
};

export default useAuthentication;
