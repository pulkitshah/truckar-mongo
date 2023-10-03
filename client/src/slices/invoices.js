import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  invoices: [],
  invoiceIds: [],
  isNextPageLoading: true,
};

export const slice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    getInvoices(state, action) {
      const invoices = action.payload;
      state.invoices = invoices;
      state.isNextPageLoading = false;
    },
    createInvoice(state, action) {
      const { invoice } = action.payload;

      state.invoices = [...state.invoices, invoice];
    },
    selectInvoice(state, action) {
      const { invoiceId = null } = action.payload;

      state.isModalOpen = true;
      state.selectedInvoiceId = invoiceId;
    },
    updateInvoice(state, action) {
      const { invoice } = action.payload;

      state.invoices = _.map(state.invoices, (_invoice) => {
        if (_invoice.id === invoice.id) {
          return invoice;
        }

        return _invoice;
      });
    },
    deleteInvoice(state, action) {
      const { invoiceId } = action.payload;

      state.invoices = _.reject(state.invoices, {
        id: invoiceId,
      });
    },
    selectRange(state, action) {
      const { start, end } = action.payload;

      state.isModalOpen = true;
      state.selectedRange = {
        start,
        end,
      };
    },
    openModal(state) {
      state.isModalOpen = true;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.selectedInvoiceId = null;
      state.selectedRange = null;
    },
  },
});

export const reducer = slice.reducer;

export default slice;
