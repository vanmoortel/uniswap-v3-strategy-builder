/**
 *
 * Header with date now customisable and select chart
 *
 */
import * as React from 'react';
import {
  Space, Col, Row,
  DatePicker, TimePicker, Select,
} from 'antd';
import {
  ColumnHeightOutlined,
  LineChartOutlined,
  TransactionOutlined,
} from '@ant-design/icons';

import './Header.less';
import { useDispatch, useSelector } from 'react-redux';
import Moment from 'moment';
import PropTypes from 'prop-types';
import { CHART_TYPE } from '../../../utils/types';
import slice from '../slice';
import { selectNow } from '../selectors';
import { selectMessages } from '../../Settings/selectors';

const { editNow } = slice.actions;

const Header = React.memo(({ onSelectChart = () => {}, selectedChart = 0 }) => {
  const dispatch = useDispatch();
  const now = useSelector(selectNow);
  const messages = useSelector(selectMessages);

  return (
    <Row className="w100p">
      <Col span={12}>
        <Space>
          <DatePicker
            defaultValue={Moment(now.split(' ')[0], 'YYYY-MM-DD')}
            format="YYYY-MM-DD"
            onChange={(e) => dispatch(editNow({ now: `${e.format('YYYY-MM-DD')} ${now.split(' ')[1]}` }))}
            value={Moment(now.split(' ')[0], 'YYYY-MM-DD')}
          />
          <TimePicker
            defaultValue={Moment(now.split(' ')[1], 'HH:mm')}
            format="HH:mm"
            onChange={(e) => dispatch(editNow({ now: `${now.split(' ')[0]} ${e.format('HH:mm')}` }))}
            value={Moment(now.split(' ')[1], 'HH:mm')}
          />
        </Space>
      </Col>
      <Col span={12} className="col-header-date">
        <Select defaultValue={selectedChart} value={selectedChart} className="select-chart" onChange={(e) => onSelectChart(e)}>
          <Select.Option value={CHART_TYPE.PROFIT_LOSS}>
            <LineChartOutlined className="mr-8" />
            {messages['Profit & Loss']}
          </Select.Option>
          <Select.Option value={CHART_TYPE.VOLUME_DAY}>
            <TransactionOutlined className="mr-8" />
            {messages['Daily trading volume']}
          </Select.Option>
          <Select.Option value={CHART_TYPE.LIQUIDITY_1_PCT}>
            <ColumnHeightOutlined className="mr-8" />
            {messages['Liquidity 1%']}
          </Select.Option>
        </Select>
      </Col>
    </Row>
  );
});
Header.propTypes = {
  onSelectChart: PropTypes.func.isRequired,
  selectedChart: PropTypes.number.isRequired,
};

export default Header;
