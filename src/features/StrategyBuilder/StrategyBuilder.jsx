/**
 *
 * The main and only page for Strategy builder for uniswap v3
 *
 */
import * as React from 'react';
import {
  Col, Row, Card, Empty, Spin, Space, Button, Popover,
} from 'antd';
import { useEffect, useState } from 'react';
import './StrategyBuilder.less';
import '../../assets/Oswald-VariableFont_wght.ttf';
import { useDispatch, useSelector } from 'react-redux';
import { TranslationOutlined } from '@ant-design/icons';
import AddPosition from './AddPosition';
import Header from './Header';
import ChartProfitLoss from './ChartProfitLoss';
import { CHART_TYPE } from '../../utils/types';
import ChartLiquidityOnePct from './ChartLiquidityOnePct';
import ChartVolumeDay from './ChartVolumeDay';
import TablePositions from './TablePositions';
import { selectNow, selectPositions } from './selectors';
import LANGUAGE from '../../translations/types';
import sliceSettings from '../Settings/slice';
import { selectMessages } from '../Settings/selectors';

const { setLanguage } = sliceSettings.actions;

const StrategyBuilder = React.memo(() => {
  const messages = useSelector(selectMessages);
  const dispatch = useDispatch();
  const positions = useSelector(selectPositions);
  const now = useSelector(selectNow);
  const [isUpdateTimeout, setIsUpdateTimeout] = useState(positions.length);
  const [chart, setChart] = useState(CHART_TYPE.PROFIT_LOSS);

  useEffect(() => {
    setIsUpdateTimeout(true);
    setTimeout(() => {
      setIsUpdateTimeout(false);
    }, 850);
  }, [positions, now]);

  return (
    <Spin tip={messages['Loading...']} spinning={isUpdateTimeout}>
      <Popover
        className="popover-translation"
        content={(
          <Space direction="vertical">
            <Button
              type="text"
              color="primary"
              size="small"
              className="button-language"
              onClick={() => dispatch(setLanguage(LANGUAGE.EN))}
            >
              🍔 English
            </Button>
            <Button
              type="text"
              color="primary"
              size="small"
              className="button-language"
              onClick={() => dispatch(setLanguage(LANGUAGE.FR))}
            >
              🥐 Français
            </Button>
          </Space>
          )}
      >
        <Button type="primary" shape="circle" icon={<TranslationOutlined />} className="button-translation" />
      </Popover>
      <Row gutter={[16, 16]} className="w100p pl-22">
        <Col span={24} lg={{ span: 8 }}>
          <Card className="h100p w100p card-add-range">
            <AddPosition />
          </Card>
        </Col>
        <Col span={24} lg={{ span: 16 }}>
          <Row gutter={[16, 16]} className="w100p">
            <Col span={24}>
              <Card className="w100p card-graph-header">
                <Header onSelectChart={setChart} selectedChart={chart} />
              </Card>
            </Col>
            <Col span={24}>
              <Card className={`w100p card-graph ${chart === CHART_TYPE.PROFIT_LOSS && positions.filter((p) => !p.hide).length === 0 && 'flex-center card-add-range-no-position'}`}>
                {chart !== CHART_TYPE.PROFIT_LOSS || positions.filter((p) => !p.hide).length === 0 ? '' : (<ChartProfitLoss />)}
                {chart === CHART_TYPE.PROFIT_LOSS && positions.filter((p) => !p.hide).length === 0 ? (<Empty description={messages['No position']} />) : ''}
                {chart !== CHART_TYPE.LIQUIDITY_1_PCT ? '' : (<ChartLiquidityOnePct />)}
                {chart !== CHART_TYPE.VOLUME_DAY ? '' : (<ChartVolumeDay />)}
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={24} className="pr-22">
          <Card className="w100p card-position-list">
            <TablePositions />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
});
export default StrategyBuilder;
