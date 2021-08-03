import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
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

export default () => {
  const store = configureStore({
    reducer,
    middleware: [...getDefaultMiddleware({ thunk: false }), ...middlewares],
    devTools: process.env.NODE_ENV !== 'production',
  });

  sagaMiddleware.run(combinedSagas);

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./redux', () => {
      store.replaceReducer(reducer);
    });
  }

  return store;
};
