/**
 *
 * Chart with daily trading volume information:
 *    Total Volume
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

import './ChartVolumeDay.less';
import { useState } from 'react';
import { Button } from 'antd';
import { ZoomOutOutlined } from '@ant-design/icons';
import Moment from 'moment';
import { useSelector } from 'react-redux';
import { CHART_VOLUME_DAY } from '../../../utils/types';
import { generateChartData } from './logic';
import {
  medianVolumeDay,
  percentile25VolumeDay, percentile75VolumeDay,
} from '../../../utils/logic';
import { selectMessages } from '../../Settings/selectors';

const ChartVolumeDay = React.memo(() => {
  const messages = useSelector(selectMessages);
  const [isShowVolumeDay, setIsShowVolumeDay] = useState(true);
  const [isShowBid, setIsShowBid] = useState(false);
  const [isShowAsk, setIsShowAsk] = useState(false);
  const [isShowRatio, setIsShowRatio] = useState(false);
  const [data, setData] = useState(generateChartData());
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [bottom, setBottom] = useState('dataMin');
  const [top, setTop] = useState('dataMax');

  const onClickLegend = (e) => {
    switch (e.id) {
      case CHART_VOLUME_DAY.VOLUME:
        setIsShowVolumeDay(!isShowVolumeDay);
        setIsShowRatio(false);
        break;
      case CHART_VOLUME_DAY.RATIO:
        setIsShowRatio(!isShowRatio);
        setIsShowVolumeDay(false);
        setIsShowBid(false);
        setIsShowAsk(false);
        break;
      case CHART_VOLUME_DAY.BID:
        setIsShowBid(!isShowBid);
        setIsShowRatio(false);
        break;
      case CHART_VOLUME_DAY.ASK:
        setIsShowAsk(!isShowAsk);
        setIsShowRatio(false);
        break;
    }
  };

  const getAxisYDomain = (from, to) => {
    const refData = data.filter((d) => from <= d.date && d.date <= to)
      .map((d) => ({
        min: Math.min(isShowVolumeDay ? d[CHART_VOLUME_DAY.VOLUME] : 99999999999,
          isShowRatio ? d[CHART_VOLUME_DAY.RATIO] : 99999999999,
          isShowBid ? d[CHART_VOLUME_DAY.BID] : 99999999999,
          isShowAsk ? d[CHART_VOLUME_DAY.ASK] : 99999999999),
        max: Math.max(isShowVolumeDay ? d[CHART_VOLUME_DAY.VOLUME] : -99999999999,
          isShowRatio ? d[CHART_VOLUME_DAY.RATIO] : -99999999999,
          isShowBid ? d[CHART_VOLUME_DAY.BID] : -99999999999,
          isShowAsk ? d[CHART_VOLUME_DAY.ASK] : -99999999999),
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
            allowDataOverflow
            type="number"
            domain={[left, right]}
            dataKey="date"
            stroke="#e0e0e2"
            tickCount={10}
            tickFormatter={(value) => Moment(value, 'X').format('yyyy-MM-DD')}
          >
            <Label value={messages.Date} offset={0} position="insideBottomRight" fill="#e0e0e2" dy={4} />
          </XAxis>
          <YAxis
            type="number"
            allowDataOverflow
            yAxisId="1"
            domain={[bottom, top]}
            label={isShowRatio ? {
              value: messages['Bid %'], angle: -90, position: 'insideLeft', dx: -8, fill: '#e0e0e2',
            } : {
              value: messages.Volume, angle: -90, position: 'insideLeft', dx: -8, fill: '#e0e0e2',
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
            labelFormatter={(value) => Moment(value, 'X').format('yyyy-MM-DD')}
          />
          <ReferenceLine yAxisId="1" y={medianVolumeDay()} strokeDasharray="3 3" fill="#e0e0e2">
            <Label value={messages.Median} offset={0} position="center" fill="#e0e0e2" dy={8} />
          </ReferenceLine>
          <ReferenceLine yAxisId="1" y={percentile25VolumeDay()} strokeDasharray="3 3" fill="#e0e0e2">
            <Label value={messages['25th percentile']} offset={0} position="center" fill="#e0e0e2" dy={8} />
          </ReferenceLine>
          <ReferenceLine yAxisId="1" y={percentile75VolumeDay()} strokeDasharray="3 3" fill="#e0e0e2">
            <Label value={messages['75th percentile']} offset={0} position="center" fill="#e0e0e2" dy={8} />
          </ReferenceLine>
          {
          isShowVolumeDay ? (<Line yAxisId="1" name={messages.Volume} type="monotone" dataKey={CHART_VOLUME_DAY.VOLUME} stroke="#676eff" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowRatio ? (<Line yAxisId="1" name={messages['Bid/Ask ratio']} type="monotone" dataKey={CHART_VOLUME_DAY.RATIO} stroke="#ffbb67" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowBid ? (<Line yAxisId="1" name={messages.Bid} type="monotone" dataKey={CHART_VOLUME_DAY.BID} stroke="#7eff67" dot={false} strokeWidth={2} />) : ''
        }
          {
          isShowAsk ? (<Line yAxisId="1" name={messages.Ask} type="monotone" dataKey={CHART_VOLUME_DAY.ASK} stroke="#ff6c67" dot={false} strokeWidth={2} />) : ''
        }
          <Legend
            payload={[
              {
                value: messages.Volume, type: 'line', id: CHART_VOLUME_DAY.VOLUME, color: isShowVolumeDay ? '#676eff' : '#676eff35',
              },
              {
                value: messages['Bid/Ask ratio'], type: 'line', id: CHART_VOLUME_DAY.RATIO, color: isShowRatio ? '#ffbb67' : '#ffbb6735',
              },
              {
                value: messages.Bid, type: 'line', id: CHART_VOLUME_DAY.BID, color: isShowBid ? '#7eff67' : '#7eff6735',
              },
              {
                value: messages.Ask, type: 'line', id: CHART_VOLUME_DAY.ASK, color: isShowAsk ? '#ff6c67' : '#ff6c6735',
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
export default ChartVolumeDay;
