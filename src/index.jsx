import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.dark.less';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Spin } from 'antd';
import configureStore from './redux';
import App from './features/App';
import './index.less';

const { store, persistor } = configureStore();

const render = (Component) => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<Spin />} persistor={persistor}>
          <Component />
        </PersistGate>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./features/App', () => {
    // eslint-disable-next-line
        const NextApp = require('./features/App').default;
    render(NextApp);
  });
}
