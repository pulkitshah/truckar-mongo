import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { userApi } from "../api/user-api";
import axios from "../utils/axios";

const initialState = {
  users: [],
  userIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getUsers(state, action) {
      const users = action.payload;
      state.users = users;
      state.isNextPageLoading = false;
    },
    createUser(state, action) {
      const { user } = action.payload;

      state.users = [...state.users, user];
    },
    selectUser(state, action) {
      const { userId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedUserId = userId;
    },
    updateUser(state, action) {
      const { user } = action.payload;

      state.users = _.map(state.users, (_user) => {
        if (_user.id === user.id) {
          return user;
        }

        return _user;
      });
    },
    deleteUser(state, action) {
      const { userId } = action.payload;

      state.users = _.reject(state.users, {
        id: userId,
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
      state.selectedUserId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
