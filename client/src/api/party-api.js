import axios from "../utils/axios";
import { slice } from "../slices/parties";

const now = new Date();

class PartyApi {
  async validateDuplicateMobile({ account, value }) {
    try {
      const response = await axios.get(
        `/api/party/validateDuplicateMobile/${JSON.stringify({
          account: account._id,
          value,
        })}`
      );
      let party = response.data;

      return {
        status: response.status,
        data: Boolean(!party),
        error: false,
      };
    } catch (err) {
      console.error("[Party Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Order not created, please try again or contact customer support.",
        };
      }
    }
    return Boolean(!party);
  }

  async validateDuplicateName({ account, value }) {
    try {
      const response = await axios.get(
        `/api/party/validateDuplicateName/${JSON.stringify({
          account: account._id,
          value,
        })}`
      );
      let party = response.data;

      return {
        status: response.status,
        data: Boolean(!party),
        error: false,
      };
    } catch (err) {
      console.error("[Party Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Order not created, please try again or contact customer support.",
        };
      }
    }
    return Boolean(!party);
  }

  async createParty({ values, dispatch }) {
    try {
      const response = await axios.post(`/api/party/`, values);
      let party = response.data;
      console.log(party);
      dispatch(slice.actions.createParty(party));
      return {
        status: response.status,
        data: party,
        error: false,
      };
    } catch (err) {
      console.error("[Party Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Party not created, please try again or contact customer support.",
        };
      }
    }
  }

  async getPartiesByAccount({ dispatch, account, value }) {
    let params = { account };

    if (value) {
      params.value = value;
    }

    try {
      const response = await axios.get(
        `/api/party/${JSON.stringify({ account, value })}`
      );
      let parties = response.data;

      dispatch && dispatch(slice.actions.getParties(response.data));

      return {
        status: response.status,
        data: parties,
        error: false,
      };
    } catch (err) {
      console.error("[Party Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Parties not fetched, please try again or contact customer support.",
        };
      }
    }
  }

  async updateParty(editedParty, dispatch) {
    try {
      const response = await axios.patch(`/api/party/`, editedParty);

      dispatch(slice.actions.updateParty({ party: response.data }));
      return {
        status: response.status,
        data: response.data,
        error: false,
      };
    } catch (err) {
      console.error("[Party Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Party not updated, please try again or contact customer support.",
        };
      }
    }
  }

  // API Modified

  async getPartiesByUser(user, dispatch, value) {
    console.log(value);
    try {
      let variables = {
        user: user.id.toString(),
        limit: 100,
      };

      if (value) {
        variables.filter = { name: { contains: value } };
      }
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: partiesByUser,
        variables: variables,
      });
      const parties = response.data.partiesByUser.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const parties = await DataStore.query(Party, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      console.log(response);

      // Dispatch - Reducer

      dispatch(slice.actions.getParties(parties));

      return parties;
    } catch (error) {
      console.log(error);
    }
  }
}

export const partyApi = new PartyApi();
