import axios from "../utils/axios";

class InvoiceApi {
  async getInvoicesByAccount(params) {
    try {
      console.log(params);
      const response = await axios.get(`/api/invoice/${params}`);
      let invoices = response.data[0].rows;
      console.log(invoices);
      let count = response.data[0].count;
      return {
        status: response.status,
        data: invoices,
        count,
        error: false,
      };
    } catch (err) {
      console.error("[Invoice Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Invoice not created, please try again or contact customer support.",
        };
      }
    }
  }

  async getInvoicesByOrganisation(organisationId, token) {
    try {
      const response = await axios.get(`/api/invoice/${params}`);
      console.log(response);
      let invoices = response.data[0].rows;
      let count = response.data[0].count;
      return {
        status: response.status,
        data: invoices,
        count,
        error: false,
      };
    } catch (err) {
      console.error("[Invoice Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Invoice not created, please try again or contact customer support.",
        };
      }
    }
  }

  async createInvoice(newInvoice, dispatch) {
    try {
      const response = await axios.post(`/api/invoice/`, newInvoice);
      let invoice = response.data;
      console.log(invoice);

      return {
        status: response.status,
        data: invoice,
        error: false,
      };
    } catch (err) {
      console.error("[Invoice Api]: ", err);
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

  async validateDuplicateInvoiceNo({
    invoiceNo,
    invoiceDate,
    account,
    organisation,
  }) {
    try {
      const response = await axios.get(
        `/api/invoice/validateDuplicateInvoiceNo/${JSON.stringify({
          account,
          invoiceNo,
          invoiceDate,
          organisation,
        })}`
      );
      let invoice = response.data;

      return {
        status: response.status,
        data: Boolean(!invoice),
        error: false,
      };
    } catch (err) {
      console.error("[Invoice Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Invoice not created, please try again or contact customer support.",
        };
      }
    }
    return Boolean(!invoice);
  }

  async getInvoiceById(id) {
    try {
      const response = await axios.get(`/api/invoice/id/${id}`);

      return {
        status: response.status,
        data: response.data,
        error: false,
      };
    } catch (err) {
      console.error("[Invoice Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Invoice not created, please try again or contact customer support.",
        };
      }
    }
  }

  async updateInvoice(editedInvoice, dispatch) {
    try {
      const response = await axios.patch(`/api/invoice/`, editedInvoice);
      let invoice = response.data;
      console.log(invoice);

      return {
        status: response.status,
        data: invoice,
        error: false,
      };
    } catch (err) {
      console.error("[Invoice Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Invoice not created, please try again or contact customer support.",
        };
      }
    }
  }
}

export const invoiceApi = new InvoiceApi();
