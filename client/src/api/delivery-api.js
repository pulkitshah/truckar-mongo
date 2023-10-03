import axios from "../utils/axios";
import moment from "moment";
import { slice } from "../slices/deliveries";

const now = new Date();

class DeliveryApi {
  async createDelivery(createdDelivery, dispatch) {
    try {
      const response = await axios.post(`/api/delivery/`, createdDelivery);
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
            "Account not created, please try again or contact customer support.",
        };
      }
    }
  }

  ////API Modified
  async getDeliveryById(id) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: getDelivery,
        variables: { id: id.toString() },
      });

      const delivery = response.data.getDelivery;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const deliveries = await DataStore.query(Delivery, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(deliveries);

      return delivery;
    } catch (error) {
      console.log(error);
    }
  }

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

  async getDeliveriesByOrder(order, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////
      const response = await API.graphql({
        query: deliveriesByOrder,
        variables: { orderId: order.id.toString() },
      });
      const deliveries = response.data.deliveriesByOrder.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const deliveries = await DataStore.query(Delivery, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(deliveries);

      // Dispatch - Reducer

      dispatch(slice.actions.getDeliveries(deliveries));

      return deliveries;
    } catch (error) {
      console.log(error);
    }
  }

  async getDeliveriesByCustomer(customer) {
    try {
      //////////////////////// GraphQL API ////////////////////////
      const response = await API.graphql({
        query: deliveriesByCustomer,
        variables: {
          customerId: customer.id.toString(),
          sortDirection: "DESC",
        },
      });
      const deliveries = response.data.deliveriesByCustomer.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const deliveries = await DataStore.query(Delivery, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////
      const nextOrderToken = response.data.deliveriesByCustomer.nextToken;

      // console.log(deliveries);

      // Dispatch - Reducer

      // dispatch(slice.actions.getDeliveries(deliveries));

      return { deliveries, nextOrderToken };
    } catch (error) {
      console.log(error);
    }
  }

  async updateDelivery(editedDelivery, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateDelivery,
      variables: { input: editedDelivery },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const delivery = response.data.updateDelivery;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(delivery);

    // Dispatch - Reducer

    dispatch(slice.actions.updateDelivery({ delivery }));

    return delivery;
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
