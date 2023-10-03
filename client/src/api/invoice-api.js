import { API } from "aws-amplify";
import {
  getInvoice,
  invoicesByUser,
  invoiceByDeliveryId,
} from "../graphql/queries";
import { createInvoice, updateInvoice } from "../graphql/mutations";
import { Invoice } from "../models";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import moment from "moment";
import { slice } from "../slices/invoices";
import { getFiscalYearTimestamps } from "../utils/get-fiscal-year";

class InvoiceApi {
  async getInvoicesByUser(user, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: invoicesByUser,
        variables: {
          user: user.id.toString(),
          sortDirection: "DESC",
        },
      });
      const invoices = response.data.invoicesByUser.items;
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const invoices = await DataStore.query(Invoice, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(invoices);

      // Dispatch - Reducer

      dispatch(slice.actions.getInvoices(invoices));

      return invoices;
    } catch (error) {
      console.log(error);
    }
  }

  async getInvoiceById(id) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: getInvoice,
        variables: {
          id: id.toString(),
        },
      });

      const invoice = response.data.getInvoice;
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const invoices = await DataStore.query(Invoice, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(invoices);

      // Dispatch - Reducer

      // dispatch(slice.actions.getInvoices(invoices));

      return invoice;
    } catch (error) {
      console.log(error);
    }
  }

  async getinvoiceByDeliveryId(id) {
    try {
      //////////////////////// GraphQL API ////////////////////////
      const response = await API.graphql({
        query: invoiceByDeliveryId,
        variables: {
          deliveryId: id.toString(),
        },
      });

      const invoice = response.data.invoiceByDeliveryId.items[0];
      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const invoices = await DataStore.query(Invoice, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(invoice);

      // Dispatch - Reducer

      // dispatch(slice.actions.getInvoices(invoices));

      return invoice;
    } catch (error) {
      console.log(error);
    }
  }

  async createInvoice(newInvoice, dispatch) {
    console.log(newInvoice);

    const createdAt = moment().toISOString();
    let newOrg = newInvoice;
    newOrg.createdAt = createdAt;

    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: createInvoice,
      variables: { input: newInvoice },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const invoice = response.data.createInvoice;

    //////////////////////// GraphQL API ////////////////////////

    //////////////////////// DataStore API ////////////////////////

    // const invoice = await DataStore.save(new Invoice(newOrg));

    //////////////////////// DataStore API ////////////////////////

    console.log(invoice);

    // Dispatch - Reducer

    dispatch(slice.actions.createInvoice({ invoice }));

    return invoice;
  }

  async updateInvoice(editedInvoice, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateInvoice,
      variables: { input: editedInvoice },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const invoice = response.data.updateInvoice;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(invoice);

    // Dispatch - Reducer

    dispatch(slice.actions.updateInvoice({ invoice }));

    return invoice;
  }

  async validateDuplicateInvoiceNo(invoiceNo, saleDate, user) {
    try {
      const response = await API.graphql({
        query: invoicesByUser,
        variables: { user: user.id.toString() },
      });

      const invoices = response.data.invoicesByUser.items;

      const invoice = invoices.filter((invoice) => {
        const invoiceSaleDate = moment(invoices[0].saleDate);

        return (
          invoice.invoiceNo === invoiceNo &&
          getFiscalYearTimestamps(invoiceSaleDate).current.start.format("L") ===
            getFiscalYearTimestamps(saleDate).current.start.format("L")
        );
      });
      return Boolean(!invoice.length);
    } catch (error) {
      console.log(error);
    }
  }
}

export const invoiceApi = new InvoiceApi();
