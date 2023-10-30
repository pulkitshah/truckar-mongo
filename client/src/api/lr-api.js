import axios from "../utils/axios";
import { API } from "aws-amplify";
import {
  getLr,
  lrsByUser,
  lrByDeliveryId,
  lrsByOrganisation,
} from "../graphql/queries";
import { createLr, updateLr } from "../graphql/mutations";
import moment from "moment";
import { slice } from "../slices/lrs";

class LrApi {
  async getLrsByAccount(params) {
    try {
      const response = await axios.get(`/api/lr/${params}`);
      let lrs = response.data[0].rows;
      let count = response.data[0].count;
      return {
        status: response.status,
        data: lrs,
        count,
        error: false,
      };
    } catch (err) {
      console.error("[Lr Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Lr not created, please try again or contact customer support.",
        };
      }
    }
  }

  async getLrsByOrganisation(organisationId, token) {
    try {
      const response = await axios.get(`/api/lr/${params}`);
      console.log(response);
      let lrs = response.data[0].rows;
      let count = response.data[0].count;
      return {
        status: response.status,
        data: lrs,
        count,
        error: false,
      };
    } catch (err) {
      console.error("[Lr Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Lr not created, please try again or contact customer support.",
        };
      }
    }
  }

  async createLr(newLr, dispatch) {
    try {
      const response = await axios.post(`/api/lr/`, newLr);
      let lr = response.data;
      console.log(lr);

      return {
        status: response.status,
        data: lr,
        error: false,
      };
    } catch (err) {
      console.error("[Lr Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Account not created, please try again or contact customer support.",
        };
      }
    }
  }

  async validateDuplicateLrNo({ lrNo, lrDate, account, organisation }) {
    try {
      const response = await axios.get(
        `/api/lr/validateDuplicateLrNo/${JSON.stringify({
          account,
          lrNo,
          lrDate,
          organisation,
        })}`
      );
      let lr = response.data;

      return {
        status: response.status,
        data: Boolean(!lr),
        error: false,
      };
    } catch (err) {
      console.error("[Lr Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Lr not created, please try again or contact customer support.",
        };
      }
    }
    return Boolean(!lr);
  }

  async getLrById(id) {
    try {
      const response = await axios.get(`/api/lr/id/${id}`);

      return {
        status: response.status,
        data: response.data,
        error: false,
      };
    } catch (err) {
      console.error("[Lr Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Lr not created, please try again or contact customer support.",
        };
      }
    }
  }

  async updateLr(editedLr, dispatch) {
    try {
      const response = await axios.patch(`/api/lr/`, editedLr);
      let lr = response.data;

      return {
        status: response.status,
        data: lr,
        error: false,
      };
    } catch (err) {
      console.error("[Lr Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "LR not created, please try again or contact customer support.",
        };
      }
    }
  }

  /// ALL APIS ABOVE THIS LINE ARE CONVERTED TO EXPRESS

  async getLrsByUser(user, token) {
    try {
      let variables = {
        user: user.id.toString(),
        sortDirection: "DESC",
      };

      if (token) {
        variables.nextToken = token;
      }

      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: lrsByUser,
        variables: variables,
      });
      const lrs = response.data.lrsByUser.items;
      const nextLrToken = response.data.lrsByUser.nextToken;
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const lrs = await DataStore.query(Lr, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(lrs);

      // Dispatch - Reducer

      // dispatch(slice.actions.getLrs(lrs));

      return { lrs, nextLrToken };
    } catch (error) {
      console.log(error);
    }
  }

  async getlrByDeliveryId(id) {
    try {
      //////////////////////// GraphQL API ////////////////////////
      const response = await API.graphql({
        query: lrByDeliveryId,
        variables: {
          deliveryId: id.toString(),
        },
      });

      const lr = response.data.lrByDeliveryId.items[0];
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const lrs = await DataStore.query(Lr, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(lr);

      // Dispatch - Reducer

      // dispatch(slice.actions.getLrs(lrs));

      return lr;
    } catch (error) {
      console.log(error);
    }
  }
}

export const lrApi = new LrApi();
