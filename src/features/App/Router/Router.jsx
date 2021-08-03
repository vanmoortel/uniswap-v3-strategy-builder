/**
 *
 * Router with all route available
 *
 */
import React, { lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';
import { useSelector } from 'react-redux';
import { selectMessages } from '../../Settings/selectors';

const Home = lazy(() => import('../../StrategyBuilder'));

const Router = () => {
  const messages = useSelector(selectMessages);

  return (
    <BrowserRouter>
      <Suspense fallback={<Spin tip={messages['Loading...']} />}>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
