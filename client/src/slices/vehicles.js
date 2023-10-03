import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  vehicles: [],
  vehicleIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    getVehicles(state, action) {
      const vehicles = action.payload;
      state.vehicles = vehicles;
      state.isNextPageLoading = false;
    },
    createVehicle(state, action) {
      const { vehicle } = action.payload;

      state.vehicles = [...state.vehicles, vehicle];
    },
    selectVehicle(state, action) {
      const { vehicleId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedVehicleId = vehicleId;
    },
    updateVehicle(state, action) {
      const { vehicle } = action.payload;

      state.vehicles = _.map(state.vehicles, (_vehicle) => {
        if (_vehicle.id === vehicle.id) {
          return vehicle;
        }

        return _vehicle;
      });
    },
    deleteVehicle(state, action) {
      const { vehicleId } = action.payload;

      state.vehicles = _.reject(state.vehicles, {
        id: vehicleId,
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
      state.selectedVehicleId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
