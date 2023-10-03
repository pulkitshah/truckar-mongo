import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { organisationApi } from "../api/organisation-api";
import axios from "../utils/axios";

const initialState = {
  organisations: [],
  organisationIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "organisation",
  initialState,
  reducers: {
    getOrganisations(state, action) {
      const organisations = action.payload;
      state.organisations = organisations;
      state.isNextPageLoading = false;
    },
    createOrganisation(state, action) {
      const { organisation } = action.payload;

      state.organisations = [...state.organisations, organisation];
    },
    selectOrganisation(state, action) {
      const { organisationId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedOrganisationId = organisationId;
    },
    updateOrganisation(state, action) {
      const { organisation } = action.payload;

      state.organisations = _.map(state.organisations, (_organisation) => {
        if (_organisation.id === organisation.id) {
          return organisation;
        }

        return _organisation;
      });
    },
    deleteOrganisation(state, action) {
      const { organisationId } = action.payload;

      state.organisations = _.reject(state.organisations, {
        id: organisationId,
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
      state.selectedOrganisationId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export const getOrganisations = (limit) => async (dispatch) => {
  const response = await organisationApi.getOrganisationsByUser();
  console.log("getOrganisations = ()");
  dispatch(slice.actions.getOrganisations(response.data));
};

export const createOrganisation = (data) => async (dispatch) => {
  const response = await axios.post("/api/calendar/organisations/new", data);

  dispatch(slice.actions.createOrganisation(response.data));
};

export const selectOrganisation = (organisationId) => async (dispatch) => {
  dispatch(slice.actions.selectOrganisation({ organisationId }));
};

export const updateOrganisation =
  (organisationId, update) => async (dispatch) => {
    const response = await axios.post("/api/calendar/organisations/update", {
      organisationId,
      update,
    });

    dispatch(slice.actions.updateOrganisation(response.data));
  };

export const deleteOrganisation = (organisationId) => async (dispatch) => {
  await axios.post("/api/calendar/organisations/remove", {
    organisationId,
  });

  dispatch(slice.actions.deleteOrganisation({ organisationId }));
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
