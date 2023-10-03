import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  drivers: [],
  driverIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    getDrivers(state, action) {
      const drivers = action.payload;
      state.drivers = drivers;
      state.isNextPageLoading = false;
    },
    createDriver(state, action) {
      const { driver } = action.payload;

      state.drivers = [...state.drivers, driver];
    },
    selectDriver(state, action) {
      const { driverId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedDriverId = driverId;
    },
    updateDriver(state, action) {
      const { driver } = action.payload;

      state.drivers = _.map(state.drivers, (_driver) => {
        if (_driver.id === driver.id) {
          return driver;
        }

        return _driver;
      });
    },
    deleteDriver(state, action) {
      const { driverId } = action.payload;

      state.drivers = _.reject(state.drivers, {
        id: driverId,
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
      state.selectedDriverId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
