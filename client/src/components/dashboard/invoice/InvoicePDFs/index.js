import tableFormatWithParticulars from "./Format1";
import standardTableFormat from "./Format2";

export default {
  standardTableFormat,
  tableFormatWithParticulars,
};
export const invoiceFormats = [
  {
    value: "standardTableFormat",
    label: "Standard Table Format",
  },
  {
    value: "tableFormatWithParticulars",
    label: "Table Format With Particulars",
  },
];
