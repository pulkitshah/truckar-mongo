import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  lrs: [],
  lrIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "lr",
  initialState,
  reducers: {
    getLrs(state, action) {
      const lrs = action.payload;
      state.lrs = lrs;
      state.isNextPageLoading = false;
    },
    createLr(state, action) {
      const { lr } = action.payload;

      state.lrs = [...state.lrs, lr];
    },
    selectLr(state, action) {
      const { lrId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedLrId = lrId;
    },
    updateLr(state, action) {
      const { lr } = action.payload;

      state.lrs = _.map(state.lrs, (_lr) => {
        if (_lr.id === lr.id) {
          return lr;
        }

        return _lr;
      });
    },
    deleteLr(state, action) {
      const { lrId } = action.payload;

      state.lrs = _.reject(state.lrs, {
        id: lrId,
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
      state.selectedLrId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
