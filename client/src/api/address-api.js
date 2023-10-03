import { API } from "aws-amplify";
import { addressesByParty, addressesByUser } from "../graphql/queries";
import { createAddress, updateAddress } from "../graphql/mutations";
import { Address } from "../models";
import { DataStore } from "@aws-amplify/datastore";
import moment from "moment";
import { slice } from "../slices/addresses";

const now = new Date();

class AddressApi {
  async getAddressesByUser(user, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: addressesByUser,
        variables: { user: user.id.toString() },
      });
      const addresses = response.data.addressesByUser.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const addresses = await DataStore.query(Address, (c) =>
      //   c.user("eq", user.id)
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
      console.log(party.id.toString());
      const response = await API.graphql({
        query: addressesByParty,
        variables: { partyId: party.id.toString() },
      });
      const addresses = response.data.addressesByParty.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const addresses = await DataStore.query(Address, (c) =>
      //   c.user("eq", user.id)
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

  async createAddress(createdAddress, dispatch) {
    const createdAt = moment().toISOString();
    let newAddress = { ...createdAddress };
    newAddress.createdAt = createdAt;

    // console.log(newAddress);

    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: createAddress,
      variables: { input: newAddress },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const address = response.data.createAddress;

    //////////////////////// GraphQL API ////////////////////////

    //////////////////////// DataStore API ////////////////////////

    // const address = await DataStore.save(new Address(newAddress));

    //////////////////////// DataStore API ////////////////////////

    // console.log(address);

    // Dispatch - Reducer

    dispatch(slice.actions.createAddress({ address }));

    return address;
  }

  async updateAddress(editedAddress, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateAddress,
      variables: { input: editedAddress },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const address = response.data.updateAddress;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(address);

    // Dispatch - Reducer

    dispatch(slice.actions.updateAddress({ address }));

    return response;
  }

  async subscribeForNewAddresses(party, addresses, dispatch) {
    DataStore.observe(Address).subscribe((add) => {
      const address = addresses.find((address) => {
        return address.id === add.element.id;
      });

      if (add.opType === "INSERT") {
        if (!address) {
          if (add.element.partyId === party.id) {
            console.log(add);
            let newAddress = {
              ...add.element,
              party: party,
            };
            console.log(newAddress);

            dispatch(slice.actions.createAddress({ newAddress }));
          }
        }
      }
    });
  }
}

export const addressApi = new AddressApi();
