/**
 *
 * Main component, containing the router and basic structure of the APP
 *
 */
import React from 'react';
import { Layout } from 'antd';
import Router from './Router';
import './App.less';

const { Content } = Layout;

const App = () => (
  <Layout className="h100p w100p content-main">
    <Content className="h100p w100p card-main">
      <Router />
    </Content>
  </Layout>
);

export default App;
