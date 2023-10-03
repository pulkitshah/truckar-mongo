import { API } from "aws-amplify";
import {
  getLr,
  lrsByUser,
  lrByDeliveryId,
  lrsByOrganisation,
} from "../graphql/queries";
import { createLr, updateLr } from "../graphql/mutations";
import { Lr } from "../models";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import moment from "moment";
import { slice } from "../slices/lrs";
import { getFiscalYearTimestamps } from "../utils/get-fiscal-year";

class LrApi {
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

  async getLrsByOrganisation(organisationId, token) {
    try {
      let variables = {
        organisationId: organisationId.toString(),
        sortDirection: "DESC",
      };

      if (token) {
        variables.nextToken = token;
      }

      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: lrsByOrganisation,
        variables: variables,
      });
      const lrs = response.data.lrsByOrganisation.items;
      const nextLrToken = response.data.lrsByOrganisation.nextToken;
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

  async getLrById(id) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: getLr,
        variables: {
          id: id.toString(),
        },
      });

      const lr = response.data.getLr;
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const lrs = await DataStore.query(Lr, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(lrs);

      // Dispatch - Reducer

      // dispatch(slice.actions.getLrs(lrs));

      return lr;
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

  async createLr(newLr, dispatch) {
    console.log(newLr);

    const createdAt = moment().toISOString();
    let newOrg = newLr;
    newOrg.createdAt = createdAt;

    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: createLr,
      variables: { input: newLr },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const lr = response.data.createLr;

    //////////////////////// GraphQL API ////////////////////////

    //////////////////////// DataStore API ////////////////////////

    // const lr = await DataStore.save(new Lr(newOrg));

    //////////////////////// DataStore API ////////////////////////

    console.log(lr);

    // Dispatch - Reducer

    dispatch(slice.actions.createLr({ lr }));

    return lr;
  }

  async updateLr(editedLr, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateLr,
      variables: { input: editedLr },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const lr = response.data.updateLr;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(lr);

    // Dispatch - Reducer

    dispatch(slice.actions.updateLr({ lr }));

    return lr;
  }

  async validateDuplicateLrNo(lrNo, saleDate, user) {
    try {
      const response = await API.graphql({
        query: lrsByUser,
        variables: { user: user.id.toString() },
      });

      const lrs = response.data.lrsByUser.items;

      const lr = lrs.filter((lr) => {
        const lrSaleDate = moment(lrs[0].saleDate);

        return (
          lr.lrNo === lrNo &&
          getFiscalYearTimestamps(lrSaleDate).current.start.format("L") ===
            getFiscalYearTimestamps(saleDate).current.start.format("L")
        );
      });
      return Boolean(!lr.length);
    } catch (error) {
      console.log(error);
    }
  }
}

export const lrApi = new LrApi();
