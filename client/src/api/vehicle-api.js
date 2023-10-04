import axios from "../utils/axios";
import { API } from "aws-amplify";
import { vehiclesByUser } from "../graphql/queries";
import { createVehicle, updateVehicle } from "../graphql/mutations";
import { Vehicle } from "../models";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import moment from "moment";
import { slice } from "../slices/vehicles";

const now = new Date();

class VehicleApi {
  async validateDuplicateVehicleNumber(account, vehicleNumber) {
    try {
      const response = await axios.get(
        `/api/vehicle/validateDuplicateVehicleNumber/${JSON.stringify({
          account,
          vehicleNumber,
        })}`
      );
      let vehicle = response.data;

      return {
        status: response.status,
        data: Boolean(!vehicle),
        error: false,
      };
    } catch (err) {
      console.error("[Vehicle Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Something went wrong. Please try again or contact customer support.",
        };
      }
    }
    return Boolean(!vehicle);
  }

  async createVehicle(newVehicle, dispatch) {
    try {
      const response = await axios.post(`/api/vehicle/`, newVehicle);
      let vehicle = response.data;
      console.log(vehicle);

      return {
        status: response.status,
        data: vehicle,
        error: false,
      };
    } catch (err) {
      console.error("[Vehicle Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Vehicle not created, please try again or contact customer support.",
        };
      }
    }
  }

  async updateVehicle(dispatch, editedVehicle) {
    try {
      const response = await axios.patch(`/api/vehicle/`, editedVehicle);

      dispatch(slice.actions.updateVehicle({ vehicle: response.data }));
      return {
        status: response.status,
        data: response.data,
        error: false,
      };
    } catch (err) {
      console.error("[Vehicle Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Vehicle not updated, please try again or contact customer support.",
        };
      }
    }
  }

  async getVehiclesByAccount(dispatch, account, value) {
    try {
      const response = await axios.get(
        `/api/vehicle/${JSON.stringify({ account, value })}`
      );
      let vehicles = response.data;
      dispatch(slice.actions.getVehicles(vehicles));
      return {
        status: response.status,
        data: vehicles,
        error: false,
      };
    } catch (err) {
      console.error("[Vehicle Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Vehicles not fetched, please try again or contact customer support.",
        };
      }
    }
  }

  /// API Modified

  async getVehiclesByUser(user, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: vehiclesByUser,
        variables: { user: user._id.toString() },
      });
      const vehicles = response.data.vehiclesByUser.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const vehicles = await DataStore.query(Vehicle, (c) =>
      //   c.user("eq", user._id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(vehicles);

      // Dispatch - Reducer

      dispatch(slice.actions.getVehicles(vehicles));

      return vehicles;
    } catch (error) {
      console.log(error);
    }
  }
}

export const vehicleApi = new VehicleApi();
