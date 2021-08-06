/**
 *
 * Add/Edit position for Uniswap V3
 *
 */
import * as React from 'react';
import {
  Button, Space, Form, Radio, Cascader, InputNumber, DatePicker, TimePicker,
} from 'antd';
import {
  EditOutlined, CloseOutlined, InfoCircleOutlined, PlusOutlined,
} from '@ant-design/icons';

import './AddPosition.less';
import { useEffect, useState } from 'react';
import Moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  medianLiquidityAskBid,
  medianVolumeDay,
  percentile25LiquidityAskBid,
  percentile25VolumeDay,
  percentile75LiquidityAskBid, percentile75VolumeDay,
  uniswapV3Liquidity,
} from '../../../utils/logic';
import slice from '../slice';
import { selectPositions, selectEditCreatedAt } from '../selectors';
import { selectMessages } from '../../Settings/selectors';

const CONFIGURATION = {
  OPTIMIST: 'optimist',
  PESSIMIST: 'pessimist',
  MEDIAN: 'median',
  CUSTOM: 'custom',
};

const STATUS = {
  ACTIVE: 'active',
  CLOSED: 'close',
};

const { addPosition, editEditCreatedAt, editPosition } = slice.actions;

const AddPosition = React.memo(() => {
  const positions = useSelector(selectPositions);
  const messages = useSelector(selectMessages);
  const editCreatedAt = useSelector(selectEditCreatedAt);
  const positionToUpdate = positions.filter((p) => p.createdAt === editCreatedAt)[0];
  const dispatch = useDispatch();
  const [rangeMin, setRangeMin] = useState(2000);
  const [rangeMax, setRangeMax] = useState(3000);
  const [entryPrice, setEntryPrice] = useState(2000);
  const [entryDate, setEntryDate] = useState(Moment(Moment(), 'YYYY-MM-DD'));
  const [entryTime, setEntryTime] = useState(Moment(Moment(), 'HH:mm'));
  const [exitPrice, setExitPrice] = useState(0);
  const [exitDate, setExitDate] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [liquidityETH, setLiquidityETH] = useState(1);
  const [liquidityUSD, setLiquidityUSD] = useState(0);
  const [volume, setVolume] = useState(medianVolumeDay());
  const [liquidityOnePct, setLiquidityOnePct] = useState(medianLiquidityAskBid());
  const [bidAskRatio, setBidAskRatio] = useState(50);
  const [configuration, setConfiguration] = useState(CONFIGURATION.MEDIAN);
  const [status, setStatus] = useState(STATUS.ACTIVE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setRangeMin(positionToUpdate ? positionToUpdate.rangeMin : 2000);
    setRangeMax(positionToUpdate ? positionToUpdate.rangeMax : 3000);
    setEntryPrice(positionToUpdate ? positionToUpdate.entryPrice : 2000);
    setEntryDate(positionToUpdate
      ? Moment(positionToUpdate.entryDate.split(' ')[0], 'YYYY-MM-DD')
      : Moment(Moment(), 'YYYY-MM-DD'));
    setEntryTime(positionToUpdate
      ? Moment(positionToUpdate.entryDate.split(' ')[1], 'HH:mm')
      : Moment(Moment(), 'HH:mm'));
    setExitPrice(positionToUpdate ? positionToUpdate.exitPrice : 0);
    setExitDate(positionToUpdate && positionToUpdate.exitDate
      ? Moment(positionToUpdate.exitDate.split(' ')[0], 'YYYY-MM-DD')
      : '');
    setExitTime(positionToUpdate && positionToUpdate.exitDate
      ? Moment(positionToUpdate.exitDate.split(' ')[1], 'HH:mm')
      : '');
    setLiquidityETH(positionToUpdate ? positionToUpdate.liquidityETH : 1);
    setLiquidityUSD(positionToUpdate ? positionToUpdate.liquidityUSD : 0);
    setVolume(positionToUpdate ? positionToUpdate.volume : medianVolumeDay());
    setLiquidityOnePct(positionToUpdate
      ? positionToUpdate.liquidityOnePct : medianLiquidityAskBid());
    setBidAskRatio(positionToUpdate ? positionToUpdate.bidAskRatio : 50);
    setConfiguration(positionToUpdate ? positionToUpdate.configuration : CONFIGURATION.MEDIAN);
    setStatus(positionToUpdate && positionToUpdate.exitPrice ? STATUS.CLOSED : STATUS.ACTIVE);
  }, [editCreatedAt]);
  form.resetFields(['configuration', 'status']);

  const updateEntryPrice = (_entryPrice) => {
    setEntryPrice(_entryPrice || 0);
    if (_entryPrice < rangeMax) {
      updateLiquidityETH((liquidityETH * 1) || (liquidityUSD / _entryPrice), _entryPrice);
    } else updateLiquidityUSD((liquidityUSD * 1) || (liquidityETH * _entryPrice), _entryPrice);
  };

  const updateRange = (_rangeMin, _rangeMax) => {
    setRangeMin(_rangeMin || 0);
    setRangeMax(_rangeMax || 0);
    if (entryPrice < rangeMax) {
      updateLiquidityETH((liquidityETH * 1) || (liquidityUSD / entryPrice), entryPrice);
    } else updateLiquidityUSD((liquidityUSD * 1) || (liquidityETH * entryPrice), entryPrice);
  };

  const updateLiquidityETH = (_liquidityETH, _entryPrice) => {
    setLiquidityETH((_liquidityETH || 0).toFixed(6));
    if (rangeMin && rangeMax && _entryPrice) {
      const liquidity = uniswapV3Liquidity({
        usd: 100, ethPrice: _entryPrice, rangeMin, rangeMax,
      });
      setLiquidityUSD((liquidity.usd * ((_liquidityETH || 0) / liquidity.eth)).toFixed(2));
    }
  };

  const updateLiquidityUSD = (_liquidityUSD, _entryPrice) => {
    setLiquidityUSD((_liquidityUSD || 0).toFixed(2));
    if (rangeMin && rangeMax && _entryPrice) {
      const liquidity = uniswapV3Liquidity({
        usd: 100, ethPrice: _entryPrice, rangeMin, rangeMax,
      });
      setLiquidityETH((liquidity.eth * ((_liquidityUSD || 0) / liquidity.usd)).toFixed(6));
    }
  };

  const updateConfiguration = (_configuration) => {
    setConfiguration(_configuration);
    switch (_configuration) {
      case CONFIGURATION.OPTIMIST:
        setLiquidityOnePct(percentile25LiquidityAskBid());
        setVolume(percentile75VolumeDay());
        break;
      case CONFIGURATION.MEDIAN:
        setLiquidityOnePct(medianLiquidityAskBid());
        setVolume(medianVolumeDay());
        break;
      case CONFIGURATION.PESSIMIST:
        setLiquidityOnePct(percentile75LiquidityAskBid());
        setVolume(percentile25VolumeDay());
        break;
      case CONFIGURATION.CUSTOM:
        break;
    }
  };

  const updateStatus = (_status) => {
    switch (_status) {
      case STATUS.ACTIVE:
        setStatus(_status);
        setExitPrice(0);
        setExitDate('');
        setExitTime('');
        break;
      case STATUS.CLOSED:
        setExitPrice(entryPrice);
        setExitDate(Moment(Moment(), 'YYYY-MM-DD'));
        setExitTime(Moment(Moment(), 'HH:mm'));
        setStatus(_status);
        break;
    }
  };

  const isValid = !isSubmitting && rangeMin >= 0 && rangeMin < rangeMax
      && entryPrice > 0 && entryDate && entryTime
      && (liquidityETH * 1) + (liquidityUSD * 1) > 0
      && volume >= 0 && liquidityOnePct >= 0 && bidAskRatio >= 0 && bidAskRatio <= 100
      && ((!positionToUpdate || status === STATUS.ACTIVE) || (
        exitPrice > 0 && exitDate && exitTime
          && Moment(`${exitDate.format('YYYY-MM-DD')} ${exitTime.format('HH:mm')}`, 'YYYY-MM-DD HH:mm')
            .isAfter(Moment(`${entryDate.format('YYYY-MM-DD')} ${entryTime.format('HH:mm')}`, 'YYYY-MM-DD HH:mm'))));

  const submit = () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 850);
    dispatch((positionToUpdate ? editPosition : addPosition)({
      position: {
        createdAt: positionToUpdate ? positionToUpdate.createdAt : Moment().unix(),
        pool: 'USDC-WETH',
        feePercent: 0.3,
        rangeMin: rangeMin * 1,
        rangeMax: rangeMax * 1,
        entryPrice: entryPrice * 1,
        entryDate: `${entryDate.format('YYYY-MM-DD')} ${entryTime.format('HH:mm')}`,
        exitPrice: exitPrice * 1,
        exitDate: exitDate && exitTime ? `${exitDate.format('YYYY-MM-DD')} ${exitTime.format('HH:mm')}` : '',
        liquidityETH: liquidityETH * 1,
        liquidityUSD: liquidityUSD * 1,
        volume: volume * 1,
        liquidityOnePct: liquidityOnePct * 1,
        bidAskRatio: bidAskRatio * 1,
        configuration,
        hide: false,
      },
    }));
    dispatch(editEditCreatedAt({ createdAt: 0 }));
  };

  return (
    <Space direction="vertical" size="large" className="w100p h100p space-last-mt-auto">
      <Cascader
        defaultValue={['USDC-WETH', '0.3%']}
        options={[
          {
            value: 'USDC-WETH',
            label: 'USDC-WETH',
            children: [
              {
                value: '0.3%',
                label: '0.3%',
              },
            ],
          },
        ]}
      />
      <Form
        form={form}
        layout="vertical"
        className="h100p"
      >
        <Form.Item label={messages['Entry Time']}>
          <Space>
            <DatePicker
              value={entryDate}
              format="YYYY-MM-DD"
              onChange={(e) => setEntryDate(e)}
            />
            <TimePicker
              value={entryTime}
              format="HH:mm"
              onChange={(e) => setEntryTime(e)}
            />
          </Space>
        </Form.Item>
        <Form.Item label={messages['Entry price']}>
          <InputNumber
            min={0}
            value={entryPrice}
            formatter={(value) => `$ ${value}`}
            parser={(value) => value.replace('$', '').replace(' ', '')}
            onChange={(e) => updateEntryPrice(e)}
          />
        </Form.Item>
        <Form.Item label={messages.Range} name="range">
          <Space>
            <InputNumber
              min={0}
              value={rangeMin}
              formatter={(value) => `$ ${value}`}
              parser={(value) => value.replace('$', '').replace(' ', '')}
              onChange={(e) => updateRange(e, rangeMax)}
            />
            <InputNumber
              min={0}
              value={rangeMax}
              formatter={(value) => `$ ${value}`}
              parser={(value) => value.replace('$', '').replace(' ', '')}
              onChange={(e) => updateRange(rangeMin, e)}
            />
          </Space>
        </Form.Item>
        <Form.Item label={messages.Liquidity}>
          <Space>
            <InputNumber
              min={0}
              value={liquidityETH}
              formatter={(value) => `Ξ ${value}`}
              parser={(value) => value.replace('Ξ', '').replace(' ', '')}
              onChange={(e) => updateLiquidityETH(e, entryPrice)}
            />
            <InputNumber
              min={0}
              value={liquidityUSD}
              formatter={(value) => `$ ${value}`}
              parser={(value) => value.replace('$', '').replace(' ', '')}
              onChange={(e) => updateLiquidityUSD(e, entryPrice)}
            />
          </Space>
        </Form.Item>
        <Form.Item
          label={messages.Configuration}
          name="configuration"
          tooltip={{ title: messages['Automatically sets the daily trading volume and liquidity within 1% of the last price'], icon: <InfoCircleOutlined /> }}
        >
          <Radio.Group
            defaultValue={configuration}
            value={configuration}
            onChange={(e) => updateConfiguration(e.target.value)}
          >
            <Radio.Button value={CONFIGURATION.OPTIMIST}>{messages.Optimist}</Radio.Button>
            <Radio.Button value={CONFIGURATION.MEDIAN}>{messages.Median}</Radio.Button>
            <Radio.Button value={CONFIGURATION.PESSIMIST}>{messages.Pessimist}</Radio.Button>
            <Radio.Button value={CONFIGURATION.CUSTOM}>{messages.Custom}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {
          configuration === CONFIGURATION.CUSTOM ? (
            <>
              <Form.Item label={messages['Daily trading volume']}>
                <InputNumber
                  min={0}
                  value={volume}
                  formatter={(value) => `$ ${value}`}
                  parser={(value) => value.replace('$', '').replace(' ', '')}
                  onChange={(e) => setVolume(e)}
                />
              </Form.Item>
              <Form.Item
                label={messages['Bid & Ask 1% liquidity']}
                tooltip={{ title: messages['Instead of taking into account all the liquidity of the pool, we use the liquidity at 1% around the last price'], icon: <InfoCircleOutlined /> }}
              >
                <InputNumber
                  min={0}
                  value={liquidityOnePct}
                  formatter={(value) => `$ ${value}`}
                  parser={(value) => value.replace('$', '').replace(' ', '')}
                  onChange={(e) => setLiquidityOnePct(e)}
                />
              </Form.Item>
              <Form.Item
                label={messages['Bid/Ask ratio']}
                tooltip={{ title: messages['Fees are collected in the input asset, the Bid/Ask ratio allows to define the proportion of collected assets'], icon: <InfoCircleOutlined /> }}
              >
                <InputNumber
                  value={bidAskRatio}
                  max={100}
                  min={0}
                  formatter={(value) => `% ${value}`}
                  parser={(value) => value.replace('%', '').replace(' ', '')}
                  onChange={(e) => setBidAskRatio(e)}
                />
              </Form.Item>
            </>
          ) : ''
        }
        { !positionToUpdate ? '' : (
          <Form.Item
            label={messages.Status}
            name="status"
            tooltip={{ title: messages['Is your range still active?'], icon: <InfoCircleOutlined /> }}
          >
            <Radio.Group
              defaultValue={status}
              value={status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <Radio.Button value={STATUS.ACTIVE}>{messages.Active}</Radio.Button>
              <Radio.Button value={STATUS.CLOSED}>{messages.Closed}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        )}

        {
          positionToUpdate && status === STATUS.CLOSED ? (
            <>
              <Form.Item label={messages['Exit Time']}>
                <Space>
                  <DatePicker
                    value={exitDate}
                    format="YYYY-MM-DD"
                    onChange={(e) => setExitDate(e)}
                    disabledTime={(curr) => curr < entryDate}
                  />
                  <TimePicker
                    value={exitTime}
                    format="HH:mm"
                    onChange={(e) => setExitTime(e)}
                  />
                </Space>
              </Form.Item>
              <Form.Item label={messages['Exit price']}>
                <InputNumber
                  min={0}
                  value={exitPrice}
                  formatter={(value) => `$ ${value}`}
                  parser={(value) => value.replace('$', '').replace(' ', '')}
                  onChange={(e) => setExitPrice(e)}
                />
              </Form.Item>
            </>
          ) : ''
        }
      </Form>
      <Space className="w100p item-end">
        {!positionToUpdate ? '' : <Button onClick={() => dispatch(editEditCreatedAt({ createdAt: 0 }))} type="danger" icon={<CloseOutlined />} className="btn-exit" />}
        <Button
          disabled={!isValid}
          onClick={() => submit()}
          htmlType="submit"
          type="primary"
          className="btn-submit"
          icon={positionToUpdate ? <EditOutlined /> : <PlusOutlined />}
        >
          {positionToUpdate ? messages['Edit position'] : messages['Add position']}
        </Button>
      </Space>
    </Space>
  );
});
export default AddPosition;
