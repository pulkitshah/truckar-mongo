import axios from "../utils/axios";

import { API } from "aws-amplify";
import { addressesByParty, addressesByUser } from "../graphql/queries";
import { createAddress, updateAddress } from "../graphql/mutations";
import { Address } from "../models";
import { DataStore } from "@aws-amplify/datastore";
import moment from "moment";
import { slice } from "../slices/addresses";

const now = new Date();

class AddressApi {
  async createAddress({ values, dispatch }) {
    try {
      const response = await axios.post(`/api/address/`, values);
      let address = response.data;
      dispatch(slice.actions.createAddress({ address: response.data }));
      return {
        status: response.status,
        data: address,
        error: false,
      };
    } catch (err) {
      console.error("[Address Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Address not created, please try again or contact customer support.",
        };
      }
    }
  }

  async updateAddress({ values, dispatch }) {
    try {
      const response = await axios.patch(`/api/address/`, values);

      let address = response.data;
      console.log({ address: response.data });
      dispatch(slice.actions.updateAddress({ address: response.data }));
      return {
        status: response.status,
        data: response.data,
        error: false,
      };
    } catch (err) {
      console.error("[Address Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Address not updated, please try again or contact customer support.",
        };
      }
    }
  }

  async getAddressesByAccount({ dispatch, account, value }) {
    let params = { account };

    if (value) {
      params.value = value;
    }

    try {
      const response = await axios.get(
        `/api/address/${JSON.stringify({ account, value })}`
      );
      let addresses = response.data;

      dispatch(slice.actions.getAddresses(response.data));

      return {
        status: response.status,
        data: addresses,
        error: false,
      };
    } catch (err) {
      console.error("[Address Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Addresses not fetched, please try again or contact customer support.",
        };
      }
    }
  }

  // API Modified

  async getAddressesByUser(user, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: addressesByUser,
        variables: { user: user._id.toString() },
      });
      const addresses = response.data.addressesByUser.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const addresses = await DataStore.query(Address, (c) =>
      //   c.user("eq", user._id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(addresses);

      // Dispatch - Reducer

      dispatch(slice.actions.getAddresses(addresses));

      return addresses;
    } catch (error) {
      console.log(error);
    }
  }

  async getAddressesByParty(party, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////
      console.log(party._id.toString());
      const response = await API.graphql({
        query: addressesByParty,
        variables: { partyId: party._id.toString() },
      });
      const addresses = response.data.addressesByParty.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const addresses = await DataStore.query(Address, (c) =>
      //   c.user("eq", user._id)
      // );

      //////////////////////// DataStore API ////////////////////////

      console.log(addresses);

      // Dispatch - Reducer

      dispatch(slice.actions.getAddresses(addresses));

      return addresses;
    } catch (error) {
      console.log(error);
    }
  }
}

export const addressApi = new AddressApi();
