/**
 *
 * Table with all positions,
 *    action to hide from chart P&L
 *           to edit/close position
 *           to remove
 *
 */
import * as React from 'react';
import {
  Space,
  Badge, Table,
} from 'antd';
import './TablePositions.less';
import { useDispatch, useSelector } from 'react-redux';
import { selectPositions } from '../selectors';
import slice from '../slice';
import { selectMessages } from '../../Settings/selectors';

const { editPosition, removePosition, editEditCreatedAt } = slice.actions;

const TablePositions = React.memo(() => {
  const messages = useSelector(selectMessages);
  const positions = useSelector(selectPositions);
  const dispatch = useDispatch();
  const formatNumber = (value) => `${value}`.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ');

  const columns = [
    {
      title: messages['Entry Time'],
      dataIndex: 'entryDate',
      key: 'entryDate',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{value}</a>
      ),
    },
    {
      title: messages['Entry price'],
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`$ ${formatNumber(value)}`}</a>
      ),
    },
    {
      title: messages['Range Min'],
      dataIndex: 'rangeMin',
      key: 'rangeMin',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`$ ${formatNumber(value)}`}</a>
      ),
    },
    {
      title: messages['Range Max'],
      dataIndex: 'rangeMax',
      key: 'rangeMax',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`$ ${formatNumber(value)}`}</a>
      ),
    },
    {
      title: messages['Liquidity ETH'],
      dataIndex: 'liquidityETH',
      key: 'liquidityETH',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`Ξ ${formatNumber(value)}`}</a>
      ),
    },
    {
      title: messages['Liquidity USD'],
      dataIndex: 'liquidityUSD',
      key: 'liquidityUSD',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`$ ${formatNumber(value)}`}</a>
      ),
    },
    {
      title: messages['Daily trading volume'],
      dataIndex: 'volume',
      key: 'volume',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`$ ${formatNumber(value)}`}</a>
      ),
    },
    {
      title: messages['Bid & Ask 1% liquidity'],
      dataIndex: 'liquidityOnePct',
      key: 'liquidityOnePct',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`$ ${formatNumber(value)}`}</a>
      ),
    },
    {
      title: messages['Bid/Ask ratio'],
      dataIndex: 'bidAskRatio',
      key: 'bidAskRatio',
      render: (value, row) => (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`${value}%`}</a>
      ),
    },
    {
      title: messages['Exit Time'],
      dataIndex: 'exitDate',
      key: 'exitDate',
      render: (value, row) => (row.exitDate ? (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{value}</a>
      ) : (
        <span className={row.hide ? 'a-hide' : 'a-white'}>
          <Badge status="success" />
          Active
        </span>
      )),
    },
    {
      title: messages['Exit price'],
      dataIndex: 'exitPrice',
      key: 'exitPrice',
      render: (value, row) => (row.exitPrice ? (
        <a className={row.hide ? 'a-hide' : 'a-white'}>{`$ ${formatNumber(value)}`}</a>
      ) : (
        <span className={row.hide ? 'a-hide' : 'a-white'}>
          <Badge status="success" />
          Active
        </span>
      )),
    },
    {
      title: messages.Actions,
      key: 'actions',
      render: (_, row) => (
        <Space size="middle">
          <a
            onKeyDown={() => dispatch(editPosition({
              position: { ...row, hide: !row.hide },
            }))}
            tabIndex={0}
            role="button"
            onClick={() => dispatch(editPosition({
              position: { ...row, hide: !row.hide },
            }))}
          >
            {row.hide ? messages.Show : messages.Hide}
          </a>
          <a
            onKeyDown={() => dispatch(editEditCreatedAt({
              createdAt: row.createdAt,
            }))}
            tabIndex={0}
            role="button"
            onClick={() => dispatch(editEditCreatedAt({
              createdAt: row.createdAt,
            }))}
          >
            {messages.Edit}
          </a>
          <a
            onKeyDown={() => dispatch(removePosition({
              createdAt: row.createdAt,
            }))}
            tabIndex={0}
            role="button"
            onClick={() => dispatch(removePosition({
              createdAt: row.createdAt,
            }))}
          >
            {messages.Remove}
          </a>
        </Space>
      ),
    },
  ];

  return (
    <Table
      locale={{ emptyText: messages['No position'] }}
      columns={columns}
      dataSource={positions}
    />
  );
});

export default TablePositions;
