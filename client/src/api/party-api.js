import axios from "../utils/axios";
import { slice } from "../slices/parties";

const now = new Date();

class PartyApi {
  async validateDuplicateMobile(account, mobile) {
    try {
      const response = await axios.get(
        `/api/party/validateDuplicateMobile/${JSON.stringify({
          account,
          mobile,
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

  async validateDuplicateName(account, name) {
    try {
      const response = await axios.get(
        `/api/party/validateDuplicateName/${JSON.stringify({
          account,
          name,
        })}`
      );
      let party = response.data;
      console.log(party);

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

  async createParty(createdParty, dispatch) {
    try {
      const response = await axios.post(`/api/party/`, createdParty);
      let party = response.data;
      console.log(party);

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

  async getPartiesByAccount(account, value) {
    try {
      const response = await axios.get(
        `/api/party/${JSON.stringify({ account, value })}`
      );
      console.log(response);
      let parties = response.data;

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

  async updateParty(editedParty, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateParty,
      variables: { input: editedParty },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const party = response.data.updateParty;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(party);

    // Dispatch - Reducer

    dispatch(slice.actions.updateParty({ party }));

    return response;
  }
}

export const partyApi = new PartyApi();
