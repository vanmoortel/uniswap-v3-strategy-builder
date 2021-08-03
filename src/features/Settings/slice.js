import { createSlice } from '@reduxjs/toolkit';
import LANGUAGE from '../../translations/types';

export default createSlice({
  name: 'settings',
  initialState: { language: LANGUAGE.EN },
  reducers: {
    setLanguage: (state, action) => ({
      ...state,
      language: action.payload,
    }),
  },
});
