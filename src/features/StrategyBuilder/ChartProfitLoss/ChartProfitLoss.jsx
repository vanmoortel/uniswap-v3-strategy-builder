/**
 *
 * Chart with profit and loss of all position
 * you can compare with HOLD 100% ETH or simple Constant-mix(uni v2)
 *
 */
import * as React from 'react';
import {
  LineChart, Line, Label, XAxis, YAxis, ReferenceLine, ReferenceArea,
  Tooltip as TooltipRecharts, ResponsiveContainer, Legend,
} from 'recharts';

import './ChartProfitLoss.less';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Button } from 'antd';
import { ZoomOutOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { CHART_PROFIT_LOSS } from '../../../utils/types';
import { generateChartData } from './logic';
import { selectNow, selectPositions } from '../selectors';
import { selectMessages } from '../../Settings/selectors';

const ChartProfitLoss = React.memo(() => {
  const messages = useSelector(selectMessages);
  const positions = useSelector(selectPositions);
  const now = useSelector(selectNow);
  const [isShowUniV3, setIsShowUniV3] = useState(true);
  const [isShowHoldETH, setIsShowHoldETH] = useState(false);
  const [isShowConstantMix, setIsShowConstantMix] = useState(false);
  const [data, setData] = useState([]);
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [bottom, setBottom] = useState('dataMin');
  const [top, setTop] = useState('dataMax');

  useEffect(() => {
    setData(generateChartData({
      positions: positions.filter((p) => !p.hide),
      dateNow: moment(now, 'YYYY-MM-DD HH:mm').toISOString(),
      ethPrice: 2000,
    }));
  }, [positions, now]);

  const onClickLegend = (e) => {
    switch (e.id) {
      case CHART_PROFIT_LOSS.UNI_V3:
        setIsShowUniV3(!isShowUniV3);
        break;
      case CHART_PROFIT_LOSS.HOLD_ETH:
        setIsShowHoldETH(!isShowHoldETH);
        break;
      case CHART_PROFIT_LOSS.CONSTANT_MIX:
        setIsShowConstantMix(!isShowConstantMix);
        break;
    }
  };

  const getAxisYDomain = (from, to) => {
    const refData = data.filter((d) => from <= d.price && d.price <= to)
      .map((d) => ({
        min: Math.min(isShowUniV3 ? d[CHART_PROFIT_LOSS.UNI_V3] : 99999999999,
          isShowHoldETH ? d[CHART_PROFIT_LOSS.HOLD_ETH] : 99999999999,
          isShowConstantMix ? d[CHART_PROFIT_LOSS.CONSTANT_MIX] : 99999999999),
        max: Math.max(isShowUniV3 ? d[CHART_PROFIT_LOSS.UNI_V3] : -99999999999,
          isShowHoldETH ? d[CHART_PROFIT_LOSS.HOLD_ETH] : -99999999999,
          isShowConstantMix ? d[CHART_PROFIT_LOSS.CONSTANT_MIX] : -99999999999),
      }));
    let [_bottom, _top] = [refData[0].min, refData[0].max];
    refData.forEach((d) => {
      if (d.max > _top) _top = d.max;
      if (d.min < _bottom) _bottom = d.min;
    });

    return [_bottom, _top];
  };

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    const [_bottom, _top] = getAxisYDomain(
      refAreaLeft < refAreaRight ? refAreaLeft : refAreaRight,
      refAreaLeft < refAreaRight ? refAreaRight : refAreaLeft,
    );

    setRefAreaLeft('');
    setRefAreaRight('');
    setLeft(refAreaLeft < refAreaRight ? refAreaLeft : refAreaRight);
    setRight(refAreaLeft < refAreaRight ? refAreaRight : refAreaLeft);
    setBottom(_bottom);
    setTop(_top);
    setData(data.slice());
  };

  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setTop('dataMax');
    setBottom('dataMin');
    setData(data.slice());
  };

  return (
    <>
      {left !== 'dataMin'
        ? (
          <Button
            type="primary"
            className="btn-zoom-out"
            onClick={() => zoomOut()}
            shape="circle"
            icon={<ZoomOutOutlined />}
            size={32}
          />
        )
        : ''}
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
          onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)}
          onMouseMove={(e) => e && refAreaLeft && setRefAreaRight(e.activeLabel)}
          onMouseUp={() => zoom()}
        >
          <XAxis
            type="number"
            allowDataOverflow
            domain={[left, right]}
            dataKey="price"
            stroke="#e0e0e2"
            tickCount={10}
            tickFormatter={(value) => (`${value.toFixed(2)}`).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ')}
          >
            <Label value={messages.Price} offset={0} position="insideBottomRight" fill="#e0e0e2" dy={4} />
          </XAxis>
          <YAxis
            type="number"
            allowDataOverflow
            yAxisId="1"
            domain={[bottom, top]}
            label={{
              value: messages['P&L'], angle: -90, position: 'insideLeft', dx: -8, fill: '#e0e0e2',
            }}
            width={100}
            stroke="#e0e0e2"
            tickCount={10}
            tickFormatter={(value) => (`${value.toFixed(2)}`).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ')}
          />
          <TooltipRecharts
            contentStyle={{ backgroundColor: '#2e2e3d' }}
            labelStyle={{ backgroundColor: '#2e2e3d', color: '#e0e0e2' }}
            wrapperStyle={{ backgroundColor: '#2e2e3d' }}
            itemStyle={{ backgroundColor: '#2e2e3d', color: '#e0e0e2' }}
            formatter={(value, name, props) => (`${value.toFixed(2)}`).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ')}
          />
          <ReferenceLine yAxisId="1" y="0" strokeDasharray="3 3" fill="#e0e0e2" />
          {
          isShowUniV3 ? (<Line yAxisId="1" name={messages['Uni V3']} type="monotone" dataKey={CHART_PROFIT_LOSS.UNI_V3} stroke="#676eff" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowHoldETH ? (<Line yAxisId="1" name={messages['Hold ETH']} type="monotone" dataKey={CHART_PROFIT_LOSS.HOLD_ETH} stroke="#dc67ff" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowConstantMix ? (<Line yAxisId="1" name={messages['Constant-mix']} type="monotone" dataKey={CHART_PROFIT_LOSS.CONSTANT_MIX} stroke="#ffbb67" dot={false} strokeWidth={2} />) : ''
        }
          <Legend
            payload={[
              {
                value: messages['Uni V3'], type: 'line', id: CHART_PROFIT_LOSS.UNI_V3, color: isShowUniV3 ? '#676eff' : '#676eff35',
              },
              {
                value: messages['Hold ETH'], type: 'line', id: CHART_PROFIT_LOSS.HOLD_ETH, color: isShowHoldETH ? '#dc67ff' : '#DC67FF35',
              },
              {
                value: messages['Constant-mix'], type: 'line', id: CHART_PROFIT_LOSS.CONSTANT_MIX, color: isShowConstantMix ? '#ffbb67' : '#ffbb6735',
              }]}
            onClick={(e) => onClickLegend(e)}
          />
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
          ) : ''}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
});
export default ChartProfitLoss;
