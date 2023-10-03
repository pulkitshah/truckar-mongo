import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  branches: [],
  branchIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    getBranches(state, action) {
      const branches = action.payload;
      state.branches = branches;
      state.isNextPageLoading = false;
    },
    createBranch(state, action) {
      const { branch } = action.payload;

      state.branches = [...state.branches, branch];
    },
    selectBranch(state, action) {
      const { branchId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedBranchId = branchId;
    },
    updateBranch(state, action) {
      const { branch } = action.payload;

      state.branches = _.map(state.branches, (_branch) => {
        if (_branch.id === branch.id) {
          return branch;
        }

        return _branch;
      });
    },
    deleteBranch(state, action) {
      const { branchId } = action.payload;

      state.branches = _.reject(state.branches, {
        id: branchId,
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
      state.selectedBranchId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
