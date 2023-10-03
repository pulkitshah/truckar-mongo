import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  orders: [],
  orderIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "order",
  initialState,
  reducers: {
    getOrders(state, action) {
      const orders = action.payload;
      state.orders = orders;
      state.isNextPageLoading = false;
    },
    createOrder(state, action) {
      const { order } = action.payload;

      state.orders = [...state.orders, order];
    },
    selectOrder(state, action) {
      const { orderId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedOrderId = orderId;
    },
    updateOrder(state, action) {
      const { order } = action.payload;

      state.orders = _.map(state.orders, (_order) => {
        if (_order.id === order.id) {
          return order;
        }

        return _order;
      });
    },
    deleteOrder(state, action) {
      const { orderId } = action.payload;

      state.orders = _.reject(state.orders, {
        id: orderId,
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
      state.selectedOrderId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
