import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { accountApi } from "../api/account-api";
import axios from "../utils/axios";

const initialState = {
  accounts: [],
  accountIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "account",
  initialState,
  reducers: {
    getAccounts(state, action) {
      const accounts = action.payload;
      state.accounts = accounts;
      state.isNextPageLoading = false;
    },
    createAccount(state, action) {
      const { account } = action.payload;

      state.accounts = [...state.accounts, account];
    },
    selectAccount(state, action) {
      const { accountId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedAccountId = accountId;
    },
    updateAccount(state, action) {
      const { account } = action.payload;

      state.accounts = _.map(state.accounts, (_account) => {
        if (_account.id === account.id) {
          return account;
        }

        return _account;
      });
    },
    deleteAccount(state, action) {
      const { accountId } = action.payload;

      state.accounts = _.reject(state.accounts, {
        id: accountId,
      });
    },
    selectRange(state, action) {
      const { start, end } = action.payload;

      state.isModalOpen = true;
      state.selectedRange = {
        start,
        end,
      };
    },
    openModal(state) {
      state.isModalOpen = true;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.selectedAccountId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export const getAccounts = (limit) => async (dispatch) => {
  const response = await accountApi.getAccountsByUser();
  console.log("getAccounts = ()");
  dispatch(slice.actions.getAccounts(response.data));
};

export const createAccount = (data) => async (dispatch) => {
  const response = await axios.post("/api/calendar/accounts/new", data);

  dispatch(slice.actions.createAccount(response.data));
};

export const selectAccount = (accountId) => async (dispatch) => {
  dispatch(slice.actions.selectAccount({ accountId }));
};

export const updateAccount = (accountId, update) => async (dispatch) => {
  const response = await axios.post("/api/calendar/accounts/update", {
    accountId,
    update,
  });

  dispatch(slice.actions.updateAccount(response.data));
};

export const deleteAccount = (accountId) => async (dispatch) => {
  await axios.post("/api/calendar/accounts/remove", {
    accountId,
  });

  dispatch(slice.actions.deleteAccount({ accountId }));
};

export const selectRange = (start, end) => (dispatch) => {
  dispatch(
    slice.actions.selectRange({
      start: start.getTime(),
      end: end.getTime(),
    })
  );
};

export const openModal = () => (dispatch) => {
  dispatch(slice.actions.openModal());
};

export const closeModal = () => (dispatch) => {
  dispatch(slice.actions.closeModal());
};

export default slice;
