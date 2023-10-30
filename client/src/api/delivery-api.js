import axios from "../utils/axios";
import moment from "moment";
import { slice } from "../slices/deliveries";

const now = new Date();

class DeliveryApi {
  async createDelivery(createdDelivery, dispatch) {
    try {
      const response = await axios.post(`/api/delivery/`, createdDelivery);
      let delivery = response.data;

      return {
        status: response.status,
        data: delivery,
        error: false,
      };
    } catch (err) {
      console.error("[Delivery Api]: ", err);
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

  async getDeliveriesByOrder(account, order) {
    try {
      const params = { account, order };
      const response = await axios.get(
        `/api/delivery/deliveriesbyorder/${JSON.stringify(params)}`
      );

      let deliveries = response.data;
      return {
        status: response.status,
        data: deliveries,
        error: false,
      };
    } catch (err) {
      console.error("[Delivery Api]: ", err);
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

  async updateDelivery(editedDelivery) {
    try {
      const response = await axios.patch(`/api/delivery/`, editedDelivery);
      let delivery = response.data;
      console.log(delivery);

      return {
        status: response.status,
        data: delivery,
        error: false,
      };
    } catch (err) {
      console.error("[Delivery Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Delivery not updated, please try again or contact customer support.",
        };
      }
    }
  }

  async getDeliveriesByAccount(params) {
    try {
      const response = await axios.get(`/api/delivery/${params}`);
      let deliveries = response.data[0].rows;
      let count = response.data[0].count;
      return {
        status: response.status,
        data: deliveries,
        count,
        error: false,
      };
    } catch (err) {
      console.error("[Delivery Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Delivery not created, please try again or contact customer support.",
        };
      }
    }
  }

  async getDeliveriesByCustomer(params) {
    try {
      const response = await axios.get(
        `/api/delivery/deliveriesbycustomer/${params}`
      );

      let deliveries = response.data[0].rows;
      let count = response.data[0].count;
      return {
        status: response.status,
        data: deliveries,
        count,
        error: false,
      };
    } catch (err) {
      console.error("[Delivery Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Delivery not created, please try again or contact customer support.",
        };
      }
    }
  }

  async getDeliveryById(id) {
    try {
      const response = await axios.get(`/api/delivery/id/${id}`);

      return {
        status: response.status,
        data: response.data,
        error: false,
      };
    } catch (err) {
      console.error("[Delivery Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Delivery not fetched, please try again or contact customer support.",
        };
      }
    }
  }

  ////API Modified

  async getDeliveriesByUser(user, token) {
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
        query: deliveriesByUser,
        variables: variables,
      });
      const deliveries = response.data.deliveriesByUser.items;
      const nextOrderToken = response.data.deliveriesByUser.nextToken;
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const orders = await DataStore.query(Order, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(orders);

      // Dispatch - Reducer

      // dispatch(slice.actions.getOrders(orders));

      return { deliveries, nextOrderToken };
    } catch (error) {
      console.log(error);
    }
  }

  async subscribeForNewDeliveries(order, deliveries, dispatch) {
    DataStore.observe(Delivery).subscribe((add) => {
      const delivery = deliveries.find((delivery) => {
        return delivery.id === add.element.id;
      });

      if (add.opType === "INSERT") {
        if (!delivery) {
          if (add.element.orderId === order.id) {
            console.log(add);
            let newDelivery = {
              ...add.element,
              order: order,
            };
            console.log(newDelivery);

            dispatch(slice.actions.createDelivery({ newDelivery }));
          }
        }
      }
    });
  }
}

export const deliveryApi = new DeliveryApi();
