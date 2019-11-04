import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import {
    getCurrency,
  } from '../api/Currency';

// ------------------------------------
// Constants
// ------------------------------------
export const CURRENCY = 'CURRENCY';

// ------------------------------------
// Actions
// ------------------------------------
export const getCurrencyAction = createAction(CURRENCY, getCurrency);

export const actions = {
  getCurrencyAction,
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = Immutable.fromJS({
  getCurrency: []
});

const currency = handleActions({
  CURRENCY: (state = initialState, action) => {
    return state.set('currency', Immutable.fromJS(action.payload.body)).set('error', null);
  },
}, initialState);

export default currency;
