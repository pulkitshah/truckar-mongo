import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { deliveryApi } from "../api/delivery-api";
import axios from "../utils/axios";

const initialState = {
  deliveries: [],
  deliveryIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "delivery",
  initialState,
  reducers: {
    getDeliveries(state, action) {
      const deliveries = action.payload;
      state.deliveries = deliveries;
      state.isNextPageLoading = false;
    },
    createDelivery(state, action) {
      const { delivery } = action.payload;

      state.deliveries = [...state.deliveries, delivery];
    },
    selectDelivery(state, action) {
      const { deliveryId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedDeliveryId = deliveryId;
    },
    updateDelivery(state, action) {
      const { delivery } = action.payload;

      state.deliveries = _.map(state.deliveries, (_delivery) => {
        if (_delivery.id === delivery.id) {
          return delivery;
        }

        return _delivery;
      });
    },
    deleteDelivery(state, action) {
      const { deliveryId } = action.payload;

      state.deliveries = _.reject(state.deliveries, {
        id: deliveryId,
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
      state.selectedDeliveryId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export const getDeliveries = (limit) => async (dispatch) => {
  const response = await deliveryApi.getDeliveriesByUser();
  console.log("getDeliveries = ()");
  dispatch(slice.actions.getDeliveries(response.data));
};

export const createDelivery = (data) => async (dispatch) => {
  const response = await axios.post("/api/calendar/deliveries/new", data);

  dispatch(slice.actions.createDelivery(response.data));
};

export const selectDelivery = (deliveryId) => async (dispatch) => {
  dispatch(slice.actions.selectDelivery({ deliveryId }));
};

export const updateDelivery = (deliveryId, update) => async (dispatch) => {
  const response = await axios.post("/api/calendar/deliveries/update", {
    deliveryId,
    update,
  });

  dispatch(slice.actions.updateDelivery(response.data));
};

export const deleteDelivery = (deliveryId) => async (dispatch) => {
  await axios.post("/api/calendar/deliveries/remove", {
    deliveryId,
  });

  dispatch(slice.actions.deleteDelivery({ deliveryId }));
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
