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
  formatNumber,
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

  box: { borderWidth: "1pt", padding: 10 },

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

  lrNoCell: {
    maxWidth: 45,
    minWidth: 45,
    display: "flex",
    justifyContent: "space-between",
  },

  dateCell: {
    maxWidth: 45,
    minWidth: 45,
    display: "flex",
    justifyContent: "space-between",
  },

  vehicleNumberCell: {
    maxWidth: 65,
    minWidth: 65,
    display: "flex",
    justifyContent: "center",
  },

  locationCell: {
    maxWidth: 65,
    minWidth: 65,
    display: "flex",
    justifyContent: "space-between",
  },

  particularsCell: {
    maxWidth: 170,
    minWidth: 170,
  },

  weightCell: {
    maxWidth: 55,
    minWidth: 55,
    display: "flex",
    justifyContent: "space-between",
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
  },

  freightCell: {
    maxWidth: 60,
    minWidth: 60,
    display: "flex",
    justifyContent: "space-between",
  },

  advanceCell: {
    maxWidth: 50,
    minWidth: 50,
    display: "flex",
    // justifyContent: 'center'
  },

  subtotalCell: {
    maxWidth: 100,
    minWidth: 100,
  },

  amountInWordsCell: {
    maxWidth: 345,
    minWidth: 345,
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
    fontSize: 8,
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
  let totalTaxPercentage =
    invoice.taxes && invoice.taxes
      ? invoice.taxes.reduce((a, b) => {
          return a + (parseFloat(b.value) || 0);
        }, 0)
      : 0;

  if (!invoice) {
    return null;
  }

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
            <View style={[styles.width33]}>
              <Text style={styles.body1}>Registered Address:</Text>
              <Text style={styles.body1}>
                {invoice.organisation.addressLine1}
              </Text>
              <Text style={styles.body1}>
                {invoice.organisation.addressLine2}
              </Text>
              <Text style={styles.body1}> {invoice.organisation.city}</Text>
              <Text style={styles.body1}>
                {" "}
                {`Contact No: ${invoice.organisation.contact}`}
              </Text>
              <Text style={styles.body1}> Email: Bkp.mclrkt@gmail.com,</Text>
              <Text style={styles.body1}> Ravimclrkt@gamil.com</Text>
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

            {invoice.billingAddress && (
              <View style={[styles.width33, styles.box]}>
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
            )}
            <View style={[styles.width33, styles.box, styles.invoiceDetail]}>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                BILL DATE
              </Text>
              <Text style={[styles.body1, styles.bottomBorder]}>
                {moment(invoice.invoiceDate).format("DD-MMM-YYYY")}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                BILL NO
              </Text>
              <Text style={[styles.body1, styles.bottomBorder]}>
                {invoice.invoiceNo}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                BRANCH
              </Text>
              <Text style={[styles.body1]}>
                {invoice.branch ? invoice.branch : invoice.organisation.city}
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow]}>
              <View
                style={[
                  styles.locationCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                  styles.topBorder,
                  styles.leftBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>
                  Booking Stn
                </Text>
              </View>
              <View
                style={[
                  styles.lrNoCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                  styles.topBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>CN No</Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                  styles.topBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>Date</Text>
              </View>
              <View
                style={[
                  styles.locationCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                  styles.topBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>
                  Destination
                </Text>
              </View>
              <View
                style={[
                  styles.particularsCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                  styles.topBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>
                  Particulars
                </Text>
              </View>
              <View
                style={[
                  styles.weightCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                  styles.topBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>Weight</Text>
              </View>
              <View
                style={[
                  styles.freightCell,
                  styles.rightBorder,
                  styles.bottomBorder,
                  styles.topBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>Amount</Text>
              </View>

              <View
                style={[
                  styles.advanceCell,
                  styles.bottomBorder,
                  styles.topBorder,
                  styles.rightBorder,
                ]}
              >
                <Text style={[styles.tableCellText, styles.bold]}>Advance</Text>
              </View>
            </View>

            {invoice.deliveries.map((delivery) => {
              if (delivery) {
                subtotalAmount =
                  subtotalAmount + calculateAmountForDelivery(delivery, "sale");
                advance =
                  advance +
                  parseFloat(
                    delivery.order.saleAdvance
                      ? delivery.order.saleAdvance /
                          delivery.order.deliveries.length
                      : 0
                  );
                return (
                  <View style={[styles.tableRow]} key={delivery.id}>
                    <View
                      style={[
                        styles.locationCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                        styles.leftBorder,
                      ]}
                    >
                      <Text style={[styles.tableCellText]}>
                        {delivery.loading.structured_formatting.main_text}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.lrNoCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      {delivery.lr && (
                        <Text style={[styles.tableCellText]}>
                          {`${delivery.lr.organisation.initials} - ${delivery.lr.lrNo}`}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.dateCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      <Text billingAddress style={[styles.tableCellText]}>
                        {moment(delivery.order.saleDate).format("DD-MM-YY")}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.locationCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      <Text billingAddress style={[styles.tableCellText]}>
                        {delivery.unloading.structured_formatting.main_text}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.particularsCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      <Text billingAddress style={[styles.tableCellText]}>
                        {delivery.particular}
                      </Text>
                      {delivery.invoiceCharges.map((invoiceCharge, i) => {
                        return (
                          <Text key={i} style={[styles.tableCellText]}>
                            {invoiceCharge.particular}
                          </Text>
                        );
                      })}
                    </View>
                    <View
                      style={[
                        styles.weightCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      <React.Fragment>
                        <Text billingAddress style={[styles.tableCellText]}>
                          {delivery.lr && delivery.lr.chargedWeight
                            ? delivery.lr.chargedWeight
                            : delivery.billQuantity
                            ? `${delivery.billQuantity} ${delivery.order.saleType.unit} `
                            : `${delivery.order.minimumSaleGuarantee || 0} ${
                                delivery.order.saleType.unit
                              }`}
                        </Text>
                      </React.Fragment>
                    </View>
                    <View
                      style={[
                        styles.freightCell,
                        styles.rightBorder,
                        styles.bottomBorder,
                      ]}
                    >
                      <Text billingAddress style={[styles.tableCellText]}>
                        Rs.{" "}
                        {formatNumber(
                          calculateAmountForDelivery(delivery, "sale")
                        )}
                      </Text>
                      {delivery.invoiceCharges.map((invoiceCharge, i) => {
                        subtotalAmount = subtotalAmount + invoiceCharge.amount;

                        return (
                          <Text key={i} style={[styles.tableCellText]}>
                            Rs. {formatNumber(invoiceCharge.amount)}
                          </Text>
                        );
                      })}
                    </View>

                    <View
                      style={[
                        styles.advanceCell,
                        styles.bottomBorder,
                        styles.rightBorder,
                      ]}
                    >
                      <Text style={[styles.tableCellText]}>
                        {"Rs " +
                          formatNumber(
                            delivery.order.saleAdvance
                              ? delivery.order.saleAdvance /
                                  delivery.order.deliveries.length
                              : 0
                          )}
                      </Text>
                    </View>
                  </View>
                );
              }
              return null;
            })}
            {invoice.taxes && invoice.taxes.length > 0 && (
              <View style={[styles.tableRow]}>
                <View style={[styles.amountInWordsCell, styles.rightBorder]}>
                  <Text style={[styles.amountInWordsCellText]}>
                    {`Amount in Words: ${numWords(
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
                <View
                  style={[
                    styles.advanceCell,
                    styles.bottomBorder,
                    styles.rightBorder,
                  ]}
                >
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
            <View style={[styles.tableRow]}>
              <View style={[styles.amountInWordsCell, styles.rightBorder]}>
                <Text style={[styles.amountInWordsCellText]}>
                  {!(invoice.taxes && invoice.taxes.length > 0) &&
                    `Amount in Words: ${numWords(
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
              <View
                style={[
                  styles.advanceCell,
                  !(invoice.taxes && invoice.taxes.length > 0) &&
                    styles.rightBorder,
                  !(invoice.taxes && invoice.taxes.length > 0) &&
                    styles.bottomBorder,
                ]}
              >
                <Text style={[styles.tableCellText]}>
                  {!(invoice.taxes && invoice.taxes.length > 0) &&
                    "Rs " + formatNumber(advance)}
                </Text>
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

                {Boolean(invoice.organisation.invoiceTermsAndConditions) &&
                  invoice.organisation.invoiceTermsAndConditions
                    .split("\n")
                    .map((tc) => {
                      return (
                        <Text style={[styles.termsAndConditionsCellText]}>
                          {tc}
                        </Text>
                      );
                    })}
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
                    {`For ${invoice.organisation.name}`}
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
