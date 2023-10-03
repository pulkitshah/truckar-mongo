import React from "react";
import { OrderExpensesSettings } from "./order-expenses-settings";
import { LrSettings } from "./lr-settings";
import { TaxSettings } from "./tax-settings";
import { FormatSettings } from "./format-settings";

export const AccountOrderLRInvoiceSettings = (props) => {
  return (
    <>
      <OrderExpensesSettings />
      <LrSettings />
      <FormatSettings />
      <TaxSettings />
    </>
  );
};
