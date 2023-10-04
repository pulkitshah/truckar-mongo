import axios from "../utils/axios";
import moment from "moment";
import { slice } from "../slices/orders";
import { getFiscalYearTimestamps } from "../utils/get-fiscal-year";

class OrderApi {
  async getOrdersByAccount(params) {
    try {
      const response = await axios.get(`/api/order/${params}`);
      // console.log(response);
      let orders = response.data[0].rows;
      let count = response.data[0].count;
      return {
        status: response.status,
        data: orders,
        count,
        error: false,
      };
    } catch (err) {
      console.error("[Order Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Order not created, please try again or contact customer support.",
        };
      }
    }
  }

  async createOrder(newOrder, dispatch) {
    try {
      const response = await axios.post(`/api/order/`, newOrder);
      let order = response.data;
      console.log(order);

      return {
        status: response.status,
        data: order,
        error: false,
      };
    } catch (err) {
      console.error("[Order Api]: ", err);
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

  async validateDuplicateOrderNo(orderNo, saleDate, account) {
    try {
      const response = await axios.get(
        `/api/order/validateDuplicateOrderNo/${JSON.stringify({
          account,
          orderNo,
          saleDate,
        })}`
      );
      let order = response.data;

      return {
        status: response.status,
        data: Boolean(!order),
        error: false,
      };
    } catch (err) {
      console.error("[Order Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Order not created, please try again or contact customer support.",
        };
      }
    }
    return Boolean(!order);
  }

  async updateOrder(editedOrder) {
    try {
      const response = await axios.patch(`/api/order/`, editedOrder);
      let order = response.data;
      console.log(order);

      return {
        status: response.status,
        data: order,
        error: false,
      };
    } catch (err) {
      console.error("[Order Api]: ", err);
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

  /// ALL APIS ABOVE THIS LINE ARE CONVERTED TO EXPRESS
  async getOrdersByUser(user, token) {
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
        query: ordersByUser,
        variables: variables,
      });
      const orders = response.data.ordersByUser.items;
      const nextOrderToken = response.data.ordersByUser.nextToken;
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const orders = await DataStore.query(Order, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(orders);

      // Dispatch - Reducer

      // dispatch(slice.actions.getOrders(orders));

      return { orders, nextOrderToken };
    } catch (error) {
      console.log(error);
    }
  }

  async getOrdersByCustomer(customer, token) {
    try {
      let variables = {
        customerId: customer.id.toString(),
        sortDirection: "DESC",
      };

      if (token) {
        variables.nextToken = token;
      }

      //////////////////////// GraphQL API ////////////////////////
      const response = await API.graphql({
        query: ordersByCustomer,
        variables: variables,
      });
      const orders = response.data.ordersByCustomer.items;
      const nextOrderToken = response.data.ordersByCustomer.nextToken;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const orders = await DataStore.query(Order, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(orders);

      // Dispatch - Reducer

      // dispatch(slice.actions.getOrders(orders));

      return { orders, nextOrderToken };
    } catch (error) {
      console.log(error);
    }
  }

  async getDeliveriesByCustomer(customer, token) {
    try {
      let variables = {
        customerId: customer.id.toString(),
        sortDirection: "DESC",
      };

      if (token) {
        variables.nextToken = token;
      }

      //////////////////////// GraphQL API ////////////////////////
      const response = await API.graphql({
        query: ordersByCustomer,
        variables: variables,
      });
      let orders = response.data.ordersByCustomer.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const orders = await DataStore.query(Order, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      //////////////////////// Breaking Orders in Deliveries ////////////////////////

      const nextOrderToken = response.data.ordersByCustomer.nextToken;

      //////////////////////// Breaking Orders in Deliveries ////////////////////////

      console.log(orders);

      // Dispatch - Reducer

      // dispatch(slice.actions.getOrders(orders));

      return { orders, nextOrderToken };
    } catch (error) {
      console.log(error);
    }
  }

  async getOrderById(id) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: getOrder,
        variables: {
          id: id.toString(),
        },
      });

      const order = response.data.getOrder;
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const orders = await DataStore.query(Order, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(orders);

      // Dispatch - Reducer

      // dispatch(slice.actions.getOrders(orders));

      return order;
    } catch (error) {
      console.log(error);
    }
  }
}

export const orderApi = new OrderApi();
