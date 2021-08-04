import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE,
} from 'redux-persist/es/constants';
import { reducer as settings } from './features/Settings';
import { reducer as strategyBuilder } from './features/StrategyBuilder';

const combinedSagas = function* () {
  yield all([
  ]);
};

const sagaMiddleware = createSagaMiddleware();

const middlewares = [
  sagaMiddleware,
];

export const reducer = combineReducers({
  settings,
  strategyBuilder,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducer);

export default () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: [...getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }), ...middlewares],
    devTools: process.env.NODE_ENV !== 'production',
  });

  sagaMiddleware.run(combinedSagas);

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./redux', () => {
      store.replaceReducer(reducer);
    });
  }
  const persistor = persistStore(store);

  return { store, persistor };
};
