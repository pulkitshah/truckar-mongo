import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { addressApi } from "../api/address-api";
import axios from "../utils/axios";

const initialState = {
  addresses: [],
  addressIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "address",
  initialState,
  reducers: {
    getAddresses(state, action) {
      const addresses = action.payload;
      state.addresses = addresses;
      state.isNextPageLoading = false;
    },
    createAddress(state, action) {
      const { address } = action.payload;

      state.addresses = [...state.addresses, address];
    },
    selectAddress(state, action) {
      const { addressId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedAddressId = addressId;
    },
    updateAddress(state, action) {
      const { address } = action.payload;

      state.addresses = _.map(state.addresses, (_address) => {
        if (_address.id === address.id) {
          return address;
        }

        return _address;
      });
    },
    deleteAddress(state, action) {
      const { addressId } = action.payload;

      state.addresses = _.reject(state.addresses, {
        id: addressId,
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
      state.selectedAddressId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export const getAddresses = (limit) => async (dispatch) => {
  const response = await addressApi.getAddressesByUser();
  console.log("getAddresses = ()");
  dispatch(slice.actions.getAddresses(response.data));
};

export const createAddress = (data) => async (dispatch) => {
  const response = await axios.post("/api/calendar/addresses/new", data);

  dispatch(slice.actions.createAddress(response.data));
};

export const selectAddress = (addressId) => async (dispatch) => {
  dispatch(slice.actions.selectAddress({ addressId }));
};

export const updateAddress = (addressId, update) => async (dispatch) => {
  const response = await axios.post("/api/calendar/addresses/update", {
    addressId,
    update,
  });

  dispatch(slice.actions.updateAddress(response.data));
};

export const deleteAddress = (addressId) => async (dispatch) => {
  await axios.post("/api/calendar/addresses/remove", {
    addressId,
  });

  dispatch(slice.actions.deleteAddress({ addressId }));
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
