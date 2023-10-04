import axios from "../utils/axios";
import moment from "moment";
import { slice } from "../slices/drivers";

const now = new Date();

class DriverApi {
  async validateDuplicateMobile(account, mobile) {
    try {
      const response = await axios.get(
        `/api/driver/validateDuplicateMobile/${JSON.stringify({
          account,
          mobile,
        })}`
      );
      let driver = response.data;

      return {
        status: response.status,
        data: Boolean(!driver),
        error: false,
      };
    } catch (err) {
      console.error("[Driver Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Order not created, please try again or contact customer support.",
        };
      }
    }
    return Boolean(!driver);
  }

  async validateDuplicateName(account, name) {
    try {
      const response = await axios.get(
        `/api/driver/validateDuplicateName/${JSON.stringify({
          account,
          name,
        })}`
      );
      let driver = response.data;
      console.log(driver);

      return {
        status: response.status,
        data: Boolean(!driver),
        error: false,
      };
    } catch (err) {
      console.error("[Driver Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Order not created, please try again or contact customer support.",
        };
      }
    }
    return Boolean(!driver);
  }

  async createDriver(createdDriver, dispatch) {
    try {
      const response = await axios.post(`/api/driver/`, createdDriver);
      let driver = response.data;
      console.log(driver);

      return {
        status: response.status,
        data: driver,
        error: false,
      };
    } catch (err) {
      console.error("[Driver Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Driver not created, please try again or contact customer support.",
        };
      }
    }
  }

  async getDriversByAccount(account, value) {
    try {
      const response = await axios.get(
        `/api/driver/${JSON.stringify({ account, value })}`
      );
      console.log(response);
      let drivers = response.data;

      return {
        status: response.status,
        data: drivers,
        error: false,
      };
    } catch (err) {
      console.error("[Driver Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Drivers not fetched, please try again or contact customer support.",
        };
      }
    }
  }

  // API Modified

  async getDriversByUser(user, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: driversByUser,
        variables: { user: user.id.toString() },
      });
      const drivers = response.data.driversByUser.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const drivers = await DataStore.query(Driver, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(drivers);

      // Dispatch - Reducer

      dispatch(slice.actions.getDrivers(drivers));

      return drivers;
    } catch (error) {
      console.log(error);
    }
  }

  async updateDriver(editedDriver, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateDriver,
      variables: { input: editedDriver },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const driver = response.data.updateDriver;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(driver);

    // Dispatch - Reducer

    dispatch(slice.actions.updateDriver({ driver }));

    return response;
  }
}

export const driverApi = new DriverApi();