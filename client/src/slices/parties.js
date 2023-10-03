import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { partyApi } from "../api/party-api";
import axios from "../utils/axios";

const initialState = {
  parties: [],
  partyIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "party",
  initialState,
  reducers: {
    getParties(state, action) {
      const parties = action.payload;
      state.parties = parties;
      state.isNextPageLoading = false;
    },
    createParty(state, action) {
      const { party } = action.payload;

      state.parties = [...state.parties, party];
    },
    selectParty(state, action) {
      const { partyId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedPartyId = partyId;
    },
    updateParty(state, action) {
      const { party } = action.payload;

      state.parties = _.map(state.parties, (_party) => {
        if (_party.id === party.id) {
          return party;
        }

        return _party;
      });
    },
    deleteParty(state, action) {
      const { partyId } = action.payload;

      state.parties = _.reject(state.parties, {
        id: partyId,
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
      state.selectedPartyId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
