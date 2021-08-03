/**
 *
 * Chart with liquidity information :
 *    BID+ASK at 1% around last price
 *    BID/ASK ratio
 *    BID
 *    ASK
 *
 */
import * as React from 'react';
import {
  LineChart, Line, Label, XAxis, YAxis, ReferenceLine, ReferenceArea,
  Tooltip as TooltipRecharts, ResponsiveContainer, Legend,
} from 'recharts';

import './ChartLiquidityOnePct.less';
import { useState } from 'react';
import { Button } from 'antd';
import { ZoomOutOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { CHART_LIQUIDITY_ONE_PCT } from '../../../utils/types';
import { generateChartData } from './logic';
import { medianLiquidityAskBid, percentile25LiquidityAskBid, percentile75LiquidityAskBid } from '../../../utils/logic';
import { selectMessages } from '../../Settings/selectors';

const ChartLiquidityOnePct = React.memo(() => {
  const messages = useSelector(selectMessages);
  const [isShowTotal, setIsShowTotal] = useState(true);
  const [isShowDiff, setIsShowDiff] = useState(false);
  const [isShowBid, setIsShowBid] = useState(false);
  const [isShowAsk, setIsShowAsk] = useState(false);
  const [data, setData] = useState(generateChartData());
  const [refAreaLeft, setRefAreaLeft] = useState(0);
  const [refAreaRight, setRefAreaRight] = useState(0);
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [bottom, setBottom] = useState('dataMin');
  const [top, setTop] = useState('dataMax');

  const onClickLegend = (e) => {
    switch (e.id) {
      case CHART_LIQUIDITY_ONE_PCT.TOTAL:
        setIsShowTotal(!isShowTotal);
        break;
      case CHART_LIQUIDITY_ONE_PCT.DIFF:
        setIsShowDiff(!isShowDiff);
        break;
      case CHART_LIQUIDITY_ONE_PCT.BID:
        setIsShowBid(!isShowBid);
        break;
      case CHART_LIQUIDITY_ONE_PCT.ASK:
        setIsShowAsk(!isShowAsk);
        break;
    }
  };

  const getAxisYDomain = (from, to) => {
    const refData = data.filter((d) => from <= d.block && d.block <= to)
      .map((d) => ({
        min: Math.min(isShowTotal ? d[CHART_LIQUIDITY_ONE_PCT.TOTAL] : 99999999999,
          isShowDiff ? d[CHART_LIQUIDITY_ONE_PCT.DIFF] : 99999999999,
          isShowBid ? d[CHART_LIQUIDITY_ONE_PCT.BID] : 99999999999,
          isShowAsk ? d[CHART_LIQUIDITY_ONE_PCT.ASK] : 99999999999),
        max: Math.max(isShowTotal ? d[CHART_LIQUIDITY_ONE_PCT.TOTAL] : -99999999999,
          isShowDiff ? d[CHART_LIQUIDITY_ONE_PCT.DIFF] : -99999999999,
          isShowBid ? d[CHART_LIQUIDITY_ONE_PCT.BID] : -99999999999,
          isShowAsk ? d[CHART_LIQUIDITY_ONE_PCT.ASK] : -99999999999),
      }));
    let [_bottom, _top] = [refData[0].min, refData[0].max];
    refData.forEach((d) => {
      if (d.max > _top) _top = d.max;
      if (d.min < _bottom) _bottom = d.min;
    });

    return [_bottom, _top];
  };

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === 0) {
      setRefAreaLeft(0);
      setRefAreaRight(0);
      return;
    }

    const [_bottom, _top] = getAxisYDomain(
      refAreaLeft < refAreaRight ? refAreaLeft : refAreaRight,
      refAreaLeft < refAreaRight ? refAreaRight : refAreaLeft,
    );

    setRefAreaLeft(0);
    setRefAreaRight(0);
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
            dataKey="block"
            stroke="#e0e0e2"
            tickCount={10}
            tickFormatter={(value) => (`${value}`).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ')}
          >
            <Label value={messages.Block} offset={0} position="insideBottomRight" fill="#e0e0e2" dy={4} />
          </XAxis>
          <YAxis
            type="number"
            allowDataOverflow
            yAxisId="1"
            domain={[bottom, top]}
            label={{
              value: messages.Liquidity, angle: -90, position: 'insideLeft', dx: -8, fill: '#e0e0e2',
            }}
            width={100}
            stroke="#e0e0e2"
            tickCount={10}
            tickFormatter={(value) => (`${value}`).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ')}
          />
          <TooltipRecharts
            contentStyle={{ backgroundColor: '#2e2e3d' }}
            labelStyle={{ backgroundColor: '#2e2e3d', color: '#e0e0e2' }}
            wrapperStyle={{ backgroundColor: '#2e2e3d' }}
            itemStyle={{ backgroundColor: '#2e2e3d', color: '#e0e0e2' }}
            formatter={(value, name, props) => (`${value}`).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ')}
          />
          <ReferenceLine yAxisId="1" y={medianLiquidityAskBid()} strokeDasharray="3 3" fill="#e0e0e2">
            <Label value={messages.Median} offset={0} position="center" fill="#e0e0e2" dy={8} />
          </ReferenceLine>
          <ReferenceLine yAxisId="1" y={percentile25LiquidityAskBid()} strokeDasharray="3 3" fill="#e0e0e2">
            <Label value={messages['25th percentile']} offset={0} position="center" fill="#e0e0e2" dy={8} />
          </ReferenceLine>
          <ReferenceLine yAxisId="1" y={percentile75LiquidityAskBid()} strokeDasharray="3 3" fill="#e0e0e2">
            <Label value={messages['75th percentile']} offset={0} position="center" fill="#e0e0e2" dy={8} />
          </ReferenceLine>
          {
          isShowTotal ? (<Line yAxisId="1" name={messages['Bid & Ask 1% liquidity']} type="monotone" dataKey={CHART_LIQUIDITY_ONE_PCT.TOTAL} stroke="#676eff" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowDiff ? (<Line yAxisId="1" name={messages['Bid Ask difference']} type="monotone" dataKey={CHART_LIQUIDITY_ONE_PCT.DIFF} stroke="#ffbb67" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowBid ? (<Line yAxisId="1" name={messages.Bid} type="monotone" dataKey={CHART_LIQUIDITY_ONE_PCT.BID} stroke="#7eff67" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowAsk ? (<Line yAxisId="1" name={messages.Ask} type="monotone" dataKey={CHART_LIQUIDITY_ONE_PCT.ASK} stroke="#ff6c67" dot={false} strokeWidth={2} />) : ''
        }
          <Legend
            payload={[
              {
                value: messages['Bid & Ask 1% liquidity'], type: 'line', id: CHART_LIQUIDITY_ONE_PCT.TOTAL, color: isShowTotal ? '#676eff' : '#676eff35',
              },
              {
                value: messages['Bid Ask difference'], type: 'line', id: CHART_LIQUIDITY_ONE_PCT.DIFF, color: isShowDiff ? '#ffbb67' : '#ffbb6735',
              },
              {
                value: messages.Bid, type: 'line', id: CHART_LIQUIDITY_ONE_PCT.BID, color: isShowBid ? '#7eff67' : '#7eff6735',
              },
              {
                value: messages.Ask, type: 'line', id: CHART_LIQUIDITY_ONE_PCT.ASK, color: isShowAsk ? '#ff6c67' : '#ff6c6735',
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
export default ChartLiquidityOnePct;
