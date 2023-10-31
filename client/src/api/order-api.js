import axios from "../utils/axios";
import moment from "moment";
import { slice } from "../slices/orders";
import { getFiscalYearTimestamps } from "../utils/get-fiscal-year";

class OrderApi {
  async getOrdersByAccount(params) {
    try {
      const response = await axios.get(`/api/order/${params}`);
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

  async validateDuplicateOrderNo({ orderNo, saleDate, account }) {
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
      console.log(editedOrder);
      const response = await axios.patch(`/api/order/`, editedOrder);
      let order = response.data;

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

  async getOrderById(id) {
    try {
      const response = await axios.get(`/api/order/id/${id}`);
      return {
        status: response.status,
        data: response.data,
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
}

export const orderApi = new OrderApi();
