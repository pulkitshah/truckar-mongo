import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import font from "../../../../../assets/Roboto-Bold.ttf";
import numWords from "num-words";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import {
  calculateAmountForDelivery,
  getInvoiceWeight,
  formatNumber,
  getSumOfInvoiceCharges,
} from "../../../../utils/amount-calculation";

Font.register({
  family: "Roboto",
  src: font,
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: 24,
  },
  logo: {
    height: "auto",
    width: "200",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingTop: 30,
    width: "100%",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingTop: 30,
    width: "100%",
  },

  width33: {
    flexGrow: 1,
    minWidth: "33.3333333333%",
    maxWidth: "33.3333333333%",
    minHeight: 100,
  },

  box: { padding: 10 },

  invoiceDetail: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
  },

  table: {
    paddingTop: 30,
  },

  tableRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },

  srNoCell: {
    maxWidth: 25,
    minWidth: 25,
    display: "flex",
    justifyContent: "center",
  },

  dateCell: {
    maxWidth: 45,
    minWidth: 45,
    display: "flex",
    justifyContent: "center",
  },

  vehicleNumberCell: {
    maxWidth: 60,
    minWidth: 60,
    display: "flex",
    justifyContent: "center",
  },

  locationCell: {
    maxWidth: 65,
    minWidth: 65,
    display: "flex",
    justifyContent: "center",
  },

  lrNoCell: {
    maxWidth: 45,
    minWidth: 45,
    display: "flex",
    justifyContent: "center",
  },

  weightCell: {
    maxWidth: 35,
    minWidth: 35,
    display: "flex",
    justifyContent: "center",
  },

  rateCell: {
    maxWidth: 50,
    minWidth: 50,
    display: "flex",
    justifyContent: "center",
  },

  othersCell: {
    maxWidth: 50,
    minWidth: 50,
    display: "flex",
    justifyContent: "center",
  },

  freightCell: {
    maxWidth: 60,
    minWidth: 60,
    display: "flex",
    justifyContent: "center",
  },

  advanceCell: {
    maxWidth: 50,
    minWidth: 50,
    display: "flex",
    justifyContent: "center",
  },

  subtotalCell: {
    maxWidth: 100,
    minWidth: 100,
  },

  amountInWordsCell: {
    maxWidth: 340,
    minWidth: 340,
  },

  termsAndConditionsCell: {
    maxWidth: 175,
    minWidth: 175,
  },

  bankDetailsCell: {
    maxWidth: 165,
    minWidth: 165,
  },
  signatureCell: {
    maxWidth: 210,
    minWidth: 210,
    display: "flex",
    flexDirection: "column-reverse",
  },
  amountInWordsCellText: {
    fontSize: 8,
    lineHeight: 1.5,
    margin: 4,
  },
  termsAndConditionsCellText: {
    fontSize: 8,
    margin: 4,
    paddingBottom: 0,
  },
  bankDetailsCellText: {
    fontSize: 8,
    margin: 4,
    textAlign: "center",
  },

  signatureCellText: {
    fontSize: 8,
    margin: 4,
    textAlign: "center",
  },

  tableCellText: {
    fontSize: 7,
    lineHeight: 1.5,
    margin: 4,
    textAlign: "center",
  },

  bottomBorder: { borderBottomWidth: "1pt" },
  topBorder: { borderTopWidth: "1pt" },
  rightBorder: { borderRightWidth: "1pt" },
  leftBorder: { borderLeftWidth: "1pt" },

  bold: {
    fontWeight: 700,
    fontFamily: "Roboto",
  },
  underlined: {
    textDecoration: "underline",
  },

  body1: {
    fontSize: 9,
    lineHeight: 1.5,
    maxWidth: 170,
  },

  h1: {
    fontSize: 24,
    fontWeight: 700,
  },
});

const InvoicePDF = ({ invoice, logo }) => {
  let subtotalAmount = 0;
  let advance = 0;
  console.log(invoice);
  let totalTaxPercentage =
    invoice.taxes && invoice.taxes
      ? invoice.taxes.reduce((a, b) => {
          return a + (parseFloat(b.value) || 0);
        }, 0)
      : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ display: "flex" }}>
          <View>
            {Boolean(invoice.organisation.logo) ? (
              <Image
                source={{
                  uri: invoice.organisation.logo.location,
                  method: "GET",
                  headers: {
                    Pragma: "no-cache",
                    "Cache-Control": "no-cache",
                  },
                  body: "",
                }}
                style={styles.logo}
              />
            ) : (
              <Text style={[styles.h1]}>
                {lr.organisation.name.toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.header}>
            <View
              style={[
                styles.width33,
                styles.box,
                styles.topBorder,
                styles.bottomBorder,
                styles.leftBorder,
              ]}
            >
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                Registered Address:
              </Text>
              <Text style={styles.body1}>
                {invoice.organisation.addressLine1}
              </Text>
              <Text style={styles.body1}>
                {invoice.organisation.addressLine2}
              </Text>
              <Text style={styles.body1}>
                {" "}
                {invoice.organisation.jurisdiction}
              </Text>
              <Text style={styles.body1}>
                {" "}
                Contact No: +91 {invoice.organisation.contact}
              </Text>
              <Text style={styles.body1}> </Text>
              <Text style={styles.body1}>
                {" "}
                {invoice.organisation.pan
                  ? `PAN No: ${invoice.organisation.pan}`
                  : ""}{" "}
              </Text>
              <Text style={styles.body1}>
                {" "}
                {invoice.organisation.gstin
                  ? `GSTIN No. ${invoice.organisation.gstin}`
                  : ""}
              </Text>
            </View>

            {
              <View
                style={[
                  styles.width33,
                  styles.box,
                  styles.topBorder,
                  styles.bottomBorder,
                  styles.leftBorder,
                ]}
              >
                <Text style={[styles.body1, styles.bold, styles.underlined]}>
                  Billed To
                </Text>
                <Text style={styles.body1}>
                  {invoice.billingAddress && invoice.billingAddress.name}
                </Text>
                <Text style={styles.body1}>
                  {invoice.billingAddress &&
                    invoice.billingAddress.billingAddressLine1}
                </Text>
                <Text style={styles.body1}>
                  {" "}
                  {invoice.billingAddress &&
                    invoice.billingAddress.billingAddressLine2}
                </Text>
                <Text style={styles.body1}>
                  {invoice.billingAddress &&
                    invoice.billingAddress.city &&
                    invoice.billingAddress.city.description}
                </Text>
                <Text style={styles.body1}>
                  {" "}
                  {invoice.billingAddress && invoice.billingAddress.pan
                    ? `PAN No: ${invoice.billingAddress.pan}`
                    : ""}{" "}
                </Text>
                <Text style={styles.body1}>
                  {invoice.billingAddress && invoice.billingAddress.gstin
                    ? `GSTIN No. ${invoice.billingAddress.gstin}`
                    : ""}
                </Text>
              </View>
            }
            <View
              style={[
                styles.width33,
                styles.box,
                styles.topBorder,
                styles.rightBorder,
                styles.bottomBorder,
                styles.leftBorder,
                styles.invoiceDetail,
              ]}
            >
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                INVOICE DATE
              </Text>
              <Text style={[styles.body1, styles.bottomBorder]}>
                {moment(invoice.invoiceDate).format("DD-MMM-YYYY")}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                INVOICE NO
              </Text>
              <Text style={[styles.body1]}>{invoice.invoiceNo}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View
              style={[styles.tableRow, styles.bottomBorder, styles.topBorder]}
            >
              <View
                style={[styles.srNoCell, styles.rightBorder, styles.leftBorder]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>Sr No</Text>
              </View>
              <View style={[styles.dateCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>Date</Text>
              </View>
              <View style={[styles.vehicleNumberCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>
                  Truck No
                </Text>
              </View>
              <View style={[styles.locationCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>From</Text>
              </View>
              <View style={[styles.locationCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>To</Text>
              </View>
              <View style={[styles.lrNoCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>LR No</Text>
              </View>
              <View style={[styles.weightCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>Weight</Text>
              </View>
              <View style={[styles.rateCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>
                  Rate (Rs)
                </Text>
              </View>
              <View style={[styles.othersCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>
                  Other Charges
                </Text>
              </View>
              <View style={[styles.freightCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>Freight</Text>
              </View>
              <View style={[styles.advanceCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText, styles.bold]}>Advance</Text>
              </View>
            </View>

            {invoice.deliveries.map((invoiceDelivery, index) => {
              const delivery = {
                ...invoiceDelivery.order,
                delivery: invoiceDelivery.order.deliveries.find(
                  (e) => e._id === invoiceDelivery.delivery
                ),
                invoiceCharges: invoiceDelivery.invoiceCharges,
                particular: invoiceDelivery.particular,
              };

              subtotalAmount =
                subtotalAmount + calculateAmountForDelivery(delivery, "sale");
              advance =
                advance +
                parseFloat(
                  delivery.saleAdvance
                    ? delivery.saleAdvance / delivery.deliveries.length
                    : 0
                );
              return (
                <View
                  style={[styles.tableRow, styles.bottomBorder]}
                  key={delivery.id}
                >
                  <View style={[styles.srNoCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>{index + 1}</Text>
                  </View>
                  <View style={[styles.dateCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>
                      {moment(delivery.saleDate).format("DD-MM-YY")}
                    </Text>
                  </View>

                  <View style={[styles.vehicleNumberCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>
                      {delivery.vehicleNumber}
                    </Text>
                  </View>
                  <View style={[styles.locationCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>
                      {
                        delivery.delivery.loading.structured_formatting
                          .main_text
                      }
                    </Text>
                  </View>
                  <View style={[styles.locationCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>
                      {
                        delivery.delivery.unloading.structured_formatting
                          .main_text
                      }
                    </Text>
                  </View>
                  <View style={[styles.lrNoCell, styles.rightBorder]}>
                    {Object.keys(delivery.delivery.lr).length ? (
                      <Text style={[styles.tableCellText]}>
                        {`${delivery.delivery.lr.organisation.initials} - ${delivery.delivery.lr.lrNo}`}
                      </Text>
                    ) : (
                      <Text style={[styles.tableCellText]}></Text>
                    )}
                  </View>
                  <View style={[styles.weightCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>
                      {delivery.delivery.lr &&
                      delivery.delivery.lr.chargedWeight
                        ? delivery.delivery.lr.chargedWeight
                        : delivery.delivery.billQuantity
                        ? `${delivery.delivery.billQuantity} ${delivery.saleType.unit} `
                        : `${delivery.minimumSaleGuarantee || 0} ${
                            delivery.saleType.unit
                          }`}
                    </Text>
                  </View>
                  <View style={[styles.rateCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>
                      {delivery.saleType.value === "quantity"
                        ? `Rs ${delivery.saleRate} / ${delivery.saleType.unit}`
                        : `Rs ${delivery.saleRate} (Fixed)`}
                    </Text>
                    {getInvoiceWeight(delivery, "sale").guarantee && (
                      <Text style={[styles.tableCellText]}>
                        {`( G - ${getInvoiceWeight(delivery, "sale").weight} ${
                          delivery.saleType.unit
                        })`}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.othersCell, styles.rightBorder]}>
                    <Text style={[styles.tableCellText]}>{`Rs. ${formatNumber(
                      getSumOfInvoiceCharges(delivery.invoiceCharges)
                    )} `}</Text>
                  </View>
                  <View style={[styles.freightCell, styles.rightBorder]}>
                    {console.log(calculateAmountForDelivery(delivery, "sale"))}
                    <Text style={[styles.tableCellText]}>
                      {`Rs. ${formatNumber(
                        calculateAmountForDelivery(delivery, "sale")
                      )}`}
                    </Text>
                  </View>
                  <View style={[styles.advanceCell]}>
                    <Text style={[styles.tableCellText]}>
                      {"Rs " +
                        formatNumber(
                          delivery.saleAdvance
                            ? delivery.saleAdvance / delivery.deliveries.length
                            : 0
                        )}
                    </Text>
                  </View>
                </View>
              );
            })}
            {invoice.taxes && invoice.taxes.length > 0 && (
              <View style={[styles.tableRow]}>
                <View style={[styles.amountInWordsCell, styles.rightBorder]}>
                  <Text style={[styles.amountInWordsCellText]}>
                    {`Invoice Amount in Words: ${numWords(
                      Math.round(
                        subtotalAmount * (1 + totalTaxPercentage / 100)
                      )
                    ).replace(/\w\S*/g, function (txt) {
                      return (
                        txt.charAt(0).toUpperCase() +
                        txt.substr(1).toLowerCase()
                      );
                    })} Only`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.subtotalCell,
                    styles.rightBorder,
                    styles.bottomBorder,
                  ]}
                >
                  <Text style={[styles.tableCellText, styles.bold]}>
                    Subtotal
                  </Text>
                </View>
                <View
                  style={[
                    styles.freightCell,
                    styles.rightBorder,
                    styles.bottomBorder,
                  ]}
                >
                  <Text style={[styles.tableCellText]}>
                    {"Rs " + formatNumber(subtotalAmount)}
                  </Text>
                </View>
                <View style={[styles.advanceCell, styles.bottomBorder]}>
                  <Text style={[styles.tableCellText]}>
                    {"Rs " + formatNumber(advance)}
                  </Text>
                </View>
              </View>
            )}
            {invoice.taxes &&
              invoice.taxes.map((tax) => {
                return (
                  <View style={[styles.tableRow]}>
                    <View
                      style={[styles.amountInWordsCell, styles.rightBorder]}
                    >
                      <Text style={[styles.tableCellText]}></Text>
                    </View>
                    <View
                      style={[
                        styles.subtotalCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      <Text style={[styles.tableCellText, styles.bold]}>
                        {tax.name ? tax.name : "Tax"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.freightCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      <Text style={[styles.tableCellText]}>
                        {"Rs " +
                          formatNumber(
                            Math.round((tax.value / 100) * subtotalAmount)
                          )}
                      </Text>
                    </View>
                    <View style={[styles.advanceCell]}>
                      <Text style={[styles.tableCellText]}></Text>
                    </View>
                  </View>
                );
              })}
            {
              <View style={[styles.tableRow]}>
                <View style={[styles.amountInWordsCell, styles.rightBorder]}>
                  <Text style={[styles.amountInWordsCellText]}>
                    {!(invoice.taxes && invoice.taxes.length > 0) &&
                      `Invoice Amount in Words: ${numWords(
                        Math.round(subtotalAmount)
                      ).replace(/\w\S*/g, function (txt) {
                        return (
                          txt.charAt(0).toUpperCase() +
                          txt.substr(1).toLowerCase()
                        );
                      })} Only`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.subtotalCell,
                    styles.rightBorder,
                    styles.bottomBorder,
                  ]}
                >
                  <Text style={[styles.tableCellText, styles.bold]}>Total</Text>
                </View>
                <View
                  style={[
                    styles.freightCell,
                    styles.rightBorder,
                    styles.bottomBorder,
                  ]}
                >
                  <Text style={[styles.tableCellText]}>
                    {"Rs " +
                      formatNumber(
                        Math.round(
                          subtotalAmount * (1 + totalTaxPercentage / 100)
                        )
                      )}
                  </Text>
                </View>
                {
                  <View
                    style={[
                      styles.advanceCell,
                      !(invoice.taxes && invoice.taxes.length > 0) &&
                        styles.bottomBorder,
                    ]}
                  >
                    <Text style={[styles.tableCellText]}>
                      {!(invoice.taxes && invoice.taxes.length > 0) &&
                        "Rs " + formatNumber(advance)}
                    </Text>
                  </View>
                }
              </View>
            }
            <View style={[styles.tableRow]}>
              <View style={[styles.amountInWordsCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText]}></Text>
              </View>
              <View
                style={[
                  styles.subtotalCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>
                  Less: Advance
                </Text>
              </View>
              <View
                style={[
                  styles.freightCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                ]}
              >
                <Text style={[styles.tableCellText]}>
                  {"Rs " + formatNumber(advance)}
                </Text>
              </View>
              <View style={[styles.advanceCell]}>
                <Text style={[styles.tableCellText]}></Text>
              </View>
            </View>
            <View style={[styles.tableRow]}>
              <View style={[styles.amountInWordsCell, styles.rightBorder]}>
                <Text style={[styles.tableCellText]}></Text>
              </View>
              <View
                style={[
                  styles.subtotalCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>Net Due</Text>
              </View>
              <View
                style={[
                  styles.freightCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                ]}
              >
                <Text style={[styles.tableCellText]}>
                  {"Rs " +
                    formatNumber(
                      Math.round(
                        subtotalAmount * (1 + totalTaxPercentage / 100)
                      ) - advance
                    )}
                </Text>
              </View>
              <View style={[styles.advanceCell]}>
                <Text style={[styles.tableCellText]}></Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={[styles.tableRow]}>
              <View
                style={[
                  styles.width33,
                  styles.rightBorder,
                  styles.topBorder,
                  styles.bottomBorder,
                ]}
              >
                <Text style={[styles.termsAndConditionsCellText, styles.bold]}>
                  Terms & Conditions
                </Text>
                {console.log(
                  Boolean(invoice.organisation.invoiceTermsAndConditions)
                )}
                {Boolean(invoice.organisation.invoiceTermsAndConditions) ? (
                  invoice.organisation.invoiceTermsAndConditions
                    .split("\n")
                    .map((tc) => {
                      return (
                        <Text style={[styles.termsAndConditionsCellText]}>
                          {tc ? tc : ""}
                        </Text>
                      );
                    })
                ) : (
                  <Text style={[styles.termsAndConditionsCellText]}>{""}</Text>
                )}
              </View>
              <View
                style={[
                  styles.width33,
                  styles.rightBorder,
                  styles.topBorder,
                  styles.bottomBorder,
                ]}
              >
                <Text style={[styles.bankDetailsCellText, styles.bold]}>
                  Company's Bank Details
                </Text>
                <Text style={[styles.termsAndConditionsCellText]}>
                  Bank Name: {invoice.organisation.bankName}
                </Text>
                <Text style={[styles.termsAndConditionsCellText]}>
                  A/c No. : {invoice.organisation.bankAccountNumber}
                </Text>
                <Text style={[styles.termsAndConditionsCellText]}>
                  Branch Name: {invoice.organisation.bankBranchName}
                </Text>
                <Text style={[styles.termsAndConditionsCellText]}>
                  IFS Code: {invoice.organisation.bankIFSC}
                </Text>
              </View>
              <View
                style={[styles.width33, styles.topBorder, styles.bottomBorder]}
              >
                <View style={[styles.signatureCell]}>
                  <Text style={[styles.signatureCellText, styles.bold]}>
                    Authorized Signatory
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

InvoicePDF.propTypes = {
  invoice: PropTypes.object.isRequired,
};

export default InvoicePDF;

var getsaleRate = function (delivery) {
  if (delivery.saleType === "quantity") {
    return `Rs. ${delivery.saleRate}/ton`;
  } else {
    return `Rs. ${delivery.saleRate} (Fixed)`;
  }
};
