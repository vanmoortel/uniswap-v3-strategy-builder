import { createSlice } from '@reduxjs/toolkit';
import Moment from 'moment';

const slice = createSlice({
  name: 'strategyBuilder',
  initialState: {
    positions: [],
    now: Moment(Moment().add(1, 'month'), 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'),
    editCreatedAt: 0,
  },
  reducers: {
    addPosition: (state, action) => ({
      ...state,
      positions: [...state.positions, action.payload.position],
    }),
    editPosition: (state, action) => ({
      ...state,
      positions: [...state.positions
        .map((p) => (p.createdAt !== action.payload.position.createdAt
          ? p : action.payload.position))],
    }),
    removePosition: (state, action) => ({
      ...state,
      positions: [...state.positions.filter((p) => p.createdAt !== action.payload.createdAt)],
    }),
    editNow: (state, action) => ({
      ...state,
      now: action.payload.now,
    }),
    editEditCreatedAt: (state, action) => ({
      ...state,
      editCreatedAt: action.payload.createdAt,
    }),
  },
});

export default slice;
