import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import font from "../../../../../assets/Roboto-Bold.ttf";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formatNumber } from "../../../../utils/amount-calculation";

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
    width: "250",
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

  declaration: {
    flexGrow: 3,
  },

  width33: {
    flexGrow: 1,
    minWidth: "33.3333333333%",
    maxWidth: "33.3333333333%",
    minHeight: 100,
  },
  width50: {
    flexGrow: 1,
    minWidth: "50%",
    maxWidth: "50%",
    minHeight: 45,
  },

  box: { borderWidth: "1pt", padding: 10 },
  sign: { borderWidth: "1pt", padding: 10, minWidth: 120 },
  tableColumn: {
    minHeight: "15vh",
    display: "flex",
    flexDirection: "column",
    // justifyContent: 'space-between'
  },
  tableDimensionsColumn: {
    display: "flex",
    flexDirection: "column",
    // justifyContent: 'space-between'
  },
  tableHeader: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderBottomWidth: "1pt",
    height: 30,
    padding: 4,
  },
  tableCell: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    padding: 4,
  },
  tableDimensionsHeader: {
    borderBottomWidth: "1pt",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  tableTotal: {
    borderTopWidth: "1pt",
    minHeight: 30,
    alignSelf: "end",
  },
  bottomBorder: { borderBottomWidth: "1pt" },
  leftBorder: { borderLeftWidth: "1pt" },
  rightBorder: { borderRightWidth: "1pt" },
  topBorder: { borderTopWidth: "1pt" },
  paddingBottom: { paddingBottom: 4 },
  paddingLeft: { paddingLeft: 4 },
  paddingRight: { paddingRight: 4 },

  centerAlign: {
    textAlign: "center",
  },
  bold: {
    fontWeight: 700,
    fontFamily: "Roboto",
  },
  underlined: {
    textDecoration: "underline",
  },
  lrDetail: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
  },
  textWhite: { color: "white" },
  body1: {
    fontSize: 9,
    lineHeight: 1.5,
    maxWidth: 300,
  },
  chargesText: {
    fontSize: 9,
    lineHeight: 1,
    minHeight: 9,
  },
  declarationText: {
    fontSize: 9,
    lineHeight: 1.5,
  },

  h1: {
    fontSize: 24,
    fontWeight: 500,
  },
  h5: {
    fontSize: 12,
    fontWeight: 500,
  },
  h6: {
    fontSize: 9,
    fontWeight: 500,
  },
});

const LrPDF = ({ lr, logo, printRates = false }) => {
  if (!lr) {
    return null;
  }

  console.log(lr);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ display: "flex" }}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            {/* Header with logo, connsignor, consignee */}
            <View style={[styles.width50]}>
              <View
                style={[
                  styles.bottomBorder,
                  styles.leftBorder,
                  styles.topBorder,
                  styles.rightBorder,
                  { minHeight: 65 },
                ]}
              >
                <View>
                  {Boolean(lr.organisation.logo) ? (
                    <Image
                      source={{
                        uri: lr.organisation.logo.location,
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
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flexWrap: "wrap",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      padding: 4,
                    }}
                  >
                    <Text style={styles.body1}>Registered Address:</Text>

                    {lr.organisation.addressLine1 && (
                      <Text style={styles.body1}>
                        {`${lr.organisation.addressLine1},`}
                      </Text>
                    )}

                    {lr.organisation.addressLine2 ? (
                      <Text style={styles.body1}>
                        {`${lr.organisation.addressLine2},`}
                      </Text>
                    ) : (
                      <Text style={styles.body1}></Text>
                    )}
                    {lr.organisation.city && (
                      <Text style={styles.body1}>
                        {`, ${lr.organisation.city}`}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      paddingLeft: 4,
                      paddingTop: 1,
                    }}
                  >
                    {lr.organisation.contact ? (
                      <Text style={styles.body1}>
                        {`Contact No: ${lr.organisation.contact}`}
                      </Text>
                    ) : (
                      <Text style={styles.body1}></Text>
                    )}
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      paddingLeft: 4,
                      paddingTop: 1,
                    }}
                  >
                    {lr.organisation.email ? (
                      <Text style={styles.body1}>
                        {`Contact No: ${lr.organisation.email}`}
                      </Text>
                    ) : (
                      <Text style={styles.body1}></Text>
                    )}
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.bottomBorder,
                  styles.leftBorder,
                  styles.rightBorder,
                  { minHeight: 50, padding: 4 },
                ]}
              >
                <Text style={[styles.body1, styles.bold, styles.underlined]}>
                  CONSIGNOR
                </Text>
                {lr.consignor && (
                  <React.Fragment>
                    {Boolean(lr.consignor.name) && (
                      <Text style={styles.body1}>{lr.consignor.name}</Text>
                    )}
                    {Boolean(lr.consignor.billingAddressLine1) && (
                      <Text style={styles.body1}>
                        {lr.consignor.billingAddressLine1},
                      </Text>
                    )}
                    {Boolean(lr.consignor.billingAddressLine2) && (
                      <Text style={styles.body1}>
                        {lr.consignor.billingAddressLine2},
                      </Text>
                    )}
                    {Boolean(lr.consignor.city) && (
                      <Text style={styles.body1}>
                        {lr.consignor.city.description}
                      </Text>
                    )}
                    {Boolean(lr.consignor.pan) && (
                      <Text style={styles.body1}>
                        PAN No: {lr.consignor.pan}
                      </Text>
                    )}
                    {Boolean(lr.consignor.gstin) && (
                      <Text style={styles.body1}>
                        GSTIN No: {lr.consignor.gstin}
                      </Text>
                    )}
                  </React.Fragment>
                )}
              </View>
              <View
                style={[
                  styles.bottomBorder,
                  styles.leftBorder,
                  styles.rightBorder,
                  {
                    minHeight: 50,
                    padding: 4,
                  },
                ]}
              >
                <Text style={[styles.body1, styles.bold, styles.underlined]}>
                  CONSIGNEE
                </Text>
                {lr.consignee && (
                  <React.Fragment>
                    {Boolean(lr.consignee.name) && (
                      <Text style={styles.body1}>{lr.consignee.name}</Text>
                    )}
                    {Boolean(lr.consignee.billingAddressLine1) && (
                      <Text style={styles.body1}>
                        {lr.consignee.billingAddressLine1},
                      </Text>
                    )}
                    {Boolean(lr.consignee.billingAddressLine2) && (
                      <Text style={styles.body1}>
                        {lr.consignee.billingAddressLine2},
                      </Text>
                    )}
                    {Boolean(lr.consignee.city) ? (
                      <Text style={styles.body1}>
                        {lr.consignee.city.description}
                      </Text>
                    ) : (
                      <Text style={styles.body1}></Text>
                    )}
                    {Boolean(lr.consignee.pan) && (
                      <Text style={styles.body1}>
                        PAN No: {lr.consignee.pan}
                      </Text>
                    )}
                    {Boolean(lr.consignee.gstin) && (
                      <Text style={styles.body1}>
                        GSTIN No: {lr.consignee.gstin}
                      </Text>
                    )}
                  </React.Fragment>
                )}
              </View>
            </View>
            {/* Header with loading, unloading, cosignment */}
            <View
              style={[
                styles.width50,
                { display: "flex", flexDirection: "row" },
              ]}
            >
              <View
                style={[
                  styles.bottomBorder,
                  styles.topBorder,
                  styles.rightBorder,
                  styles.width50,
                ]}
              >
                <View
                  style={[
                    styles.bottomBorder,
                    {
                      flexGrow: 1,
                      display: "flex",
                      justifyContent: "space-between",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.body1,
                      styles.bold,
                      styles.bottomBorder,
                      { fontSize: 7 },
                    ]}
                  >
                    {" "}
                    NON NEGOTIABLE CONSIGNMENT NOTE
                  </Text>

                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    {" "}
                    FROM
                  </Text>
                  <Text style={[styles.body1, styles.bottomBorder]}>
                    {lr.delivery.loading.description}
                  </Text>
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    TO
                  </Text>
                  <Text style={[styles.body1]}>
                    {lr.delivery.unloading.description}
                  </Text>
                </View>
                <View
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    INSURANCE DETAILS
                  </Text>
                  <Text style={[styles.body1]}>
                    Company:{" "}
                    {lr.insuranceCompany
                      ? lr.insuranceCompany.toUpperCase()
                      : " ________________"}
                  </Text>
                  <Text style={[styles.body1]}>
                    Date:{" "}
                    {lr.insuranceDate
                      ? moment(lr.insuranceDate).format("DD-MM-YY")
                      : " ________________"}
                  </Text>
                  <Text style={[styles.body1]}>
                    Policy No:{" "}
                    {lr.insurancePolicyNo
                      ? lr.insurancePolicyNo.toUpperCase()
                      : " ________________"}
                  </Text>
                  <Text style={[styles.body1]}>
                    Amount:{" "}
                    {lr.insuranceAmount
                      ? `Rs. ${formatNumber(lr.insuranceAmount || 0)}`
                      : " ________________"}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.bottomBorder,
                  styles.rightBorder,
                  styles.topBorder,
                  styles.width50,
                ]}
              >
                <View
                  style={[
                    {
                      flexGrow: 1,
                      display: "flex",
                      // justifyContent: 'space-between'
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.body1,
                      styles.bold,
                      styles.bottomBorder,
                      { fontSize: 7 },
                    ]}
                  >
                    {" "}
                    Booking as per terms and Conditions on
                    www.truckar.com/termsandconditions
                  </Text>
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    GST No
                  </Text>
                  <Text style={[styles.body1, styles.bottomBorder]}>
                    {lr.organisation.gstin}
                  </Text>
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    PAN No
                  </Text>
                  <Text style={[styles.body1, styles.bottomBorder]}>
                    {lr.organisation.pan}
                  </Text>
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    Consignment No
                  </Text>
                  <Text style={[styles.body1, styles.bottomBorder]}>
                    {lr.lrNo}
                  </Text>
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    Date
                  </Text>
                  <Text style={[styles.body1, styles.bottomBorder]}>
                    {moment(lr.date).format("DD-MM-YYYY")}
                  </Text>
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    Address of Issuing Office
                  </Text>
                  <Text style={[styles.body1, styles.bottomBorder]}>
                    {lr.branch
                      ? lr.branch
                      : Boolean(lr.organisation.city) && lr.organisation.city}
                  </Text>
                  <Text style={[styles.body1, styles.bold, styles.underlined]}>
                    Vehicle No.
                  </Text>
                  <Text style={[styles.body1]}>{lr.order.vehicleNumber}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.width50,
                styles.rightBorder,
                { display: "flex", flexDirection: "row" },
              ]}
            >
              <View
                style={[
                  styles.tableColumn,
                  styles.leftBorder,
                  styles.bottomBorder,
                ]}
              >
                <View style={[styles.tableHeader]}>
                  <Text style={[styles.body1, styles.bold]}>Packages</Text>
                </View>
                <View style={[styles.tableCell]}>
                  {lr.descriptionOfGoods.map((descriptionOfGood, index) => {
                    return (
                      <Text key={index} style={[styles.body1]}>
                        {descriptionOfGood.packages}
                      </Text>
                    );
                  })}
                </View>
              </View>
              <View
                style={[
                  styles.tableColumn,
                  styles.leftBorder,
                  styles.bottomBorder,
                ]}
              >
                <View style={[styles.tableHeader]}>
                  <Text style={[styles.body1, styles.bold]}>Packing</Text>
                </View>
                <View style={[styles.tableCell, { maxWidth: 50 }]}>
                  {lr.descriptionOfGoods.map((descriptionOfGood, index) => {
                    return (
                      <Text key={index} style={[styles.body1]}>
                        {descriptionOfGood.packing}
                      </Text>
                    );
                  })}
                </View>
              </View>
              <View
                style={[
                  styles.tableColumn,
                  styles.leftBorder,
                  styles.bottomBorder,
                  { flexGrow: 3 },
                ]}
              >
                <View style={[{ display: "flex", flexDirection: "row" }]}>
                  <View style={[styles.tableColumn, { flexGrow: 3 }]}>
                    <View style={[styles.tableHeader]}>
                      <Text style={[styles.body1, styles.bold]}>
                        Description
                      </Text>
                    </View>
                    <View style={[styles.tableCell]}>
                      {lr.descriptionOfGoods.map((descriptionOfGood, index) => {
                        return (
                          <Text key={index} style={[styles.body1]}>
                            {descriptionOfGood.description}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                  <View style={[styles.tableColumn, styles.leftBorder]}>
                    <View style={[styles.tableHeader]}>
                      <Text style={[styles.body1, styles.bold]}>Weight</Text>
                    </View>
                    <View style={[styles.tableCell]}>
                      <Text style={[styles.body1]}>
                        {lr.delivery.billQuantity &&
                          `${lr.delivery.billQuantity} ${lr.order.saleType.unit}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.tableTotal,
                    { display: "flex", flexDirection: "row" },
                  ]}
                >
                  <View style={[styles.tableDimensionsColumn, { flexGrow: 1 }]}>
                    <View style={[styles.tableDimensionsHeader]}>
                      <Text style={[styles.body1, styles.bold]}>Length</Text>
                    </View>
                    <View style={[styles.tableCell]}>
                      <Text style={[styles.body1]}>{lr.dimesnionsLength}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.tableDimensionsColumn,
                      styles.leftBorder,
                      { flexGrow: 1 },
                    ]}
                  >
                    <View style={[styles.tableDimensionsHeader]}>
                      <Text style={[styles.body1, styles.bold]}>Width</Text>
                    </View>
                    <View style={[styles.tableCell]}>
                      <Text style={[styles.body1]}>{lr.dimesnionsBreadth}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.tableDimensionsColumn,
                      styles.leftBorder,
                      { flexGrow: 1 },
                    ]}
                  >
                    <View style={[styles.tableDimensionsHeader]}>
                      <Text style={[styles.body1, styles.bold]}>Height</Text>
                    </View>
                    <View style={[styles.tableCell]}>
                      <Text style={[styles.body1]}>{lr.dimesnionsHeight}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.tableDimensionsColumn,
                      styles.leftBorder,
                      { flexGrow: 1 },
                    ]}
                  >
                    <View style={[styles.tableDimensionsHeader]}>
                      <Text style={[styles.body1, styles.bold]}>
                        Total CFT/CMT
                      </Text>
                    </View>
                    <View style={[styles.tableCell]}>
                      <Text style={[styles.body1]}></Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.tableTotal]}>
                  <View
                    style={[
                      { display: "flex", flexDirection: "column", padding: 4 },
                    ]}
                  >
                    <Text style={[styles.body1, styles.bold]}>
                      BASIS OF BOOKING
                    </Text>
                    <View
                      style={[
                        {
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <Text style={[styles.body1, styles.bold]}>☐ To Pay</Text>
                      <Text style={[styles.body1, styles.bold]}>☐ Paid</Text>
                      <Text
                        style={[styles.body1, styles.bold, { minWidth: 100 }]}
                      >
                        ☐ To be biled at
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.width50,
                styles.rightBorder,
                { display: "flex", flexDirection: "row" },
              ]}
            >
              <View style={[styles.tableColumn, styles.bottomBorder]}>
                <View
                  style={[
                    { display: "flex", flexDirection: "row", minWidth: "40%" },
                  ]}
                >
                  <View style={[styles.tableColumn]}>
                    <View style={[styles.tableHeader]}>
                      <Text style={[styles.body1, styles.bold]}>
                        Charged Wt
                      </Text>
                    </View>
                    <View
                      style={[styles.tableCell, { minWidth: 60, maxWidth: 60 }]}
                    >
                      <Text style={[styles.body1]}>
                        {lr.order.minimumSaleGuarantee &&
                          `${lr.order.minimumSaleGuarantee} MT`}
                      </Text>

                      <Text style={[styles.body1]}>
                        {lr.chargedWeight && `${lr.chargedWeight}`}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.tableColumn,
                      styles.leftBorder,
                      { flexGrow: 1 },
                    ]}
                  >
                    <View style={[styles.tableHeader]}>
                      <Text style={[styles.body1, styles.bold]}>Rate</Text>
                    </View>
                    <View style={[styles.tableCell]}>
                      <Text style={[styles.body1]}>
                        {printRates
                          ? `Rs. ${lr.order.saleRate}`
                          : lr.fareBasis
                          ? lr.fareBasis.toUpperCase()
                          : "TBB"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.tableTotal]}>
                  <View style={[{ display: "flex", flexDirection: "column" }]}>
                    <Text style={[styles.body1, styles.bold]}>
                      VALUE OF GOODS
                    </Text>
                    <View
                      style={[
                        {
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <View style={[styles.tableCell]}>
                        <Text style={[styles.body1]}>
                          {"Rs " + formatNumber(lr.valueOfGoods || 0)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={{ flexGrow: 3, display: "flex", flexDirection: "row" }}
              >
                <View
                  style={[
                    styles.tableColumn,
                    styles.leftBorder,
                    styles.bottomBorder,
                    { minWidth: "30%" },
                  ]}
                >
                  <View style={[styles.tableHeader]}>
                    <Text style={[styles.body1, styles.bold]}>Charges</Text>
                  </View>
                  <Text
                    style={[
                      styles.chargesText,
                      styles.bottomBorder,
                      styles.paddingBottom,
                    ]}
                  >
                    Freight
                  </Text>
                  {lr.lrCharges.map((lrCharge) => {
                    return (
                      <Text
                        style={[
                          styles.chargesText,
                          styles.bottomBorder,
                          styles.paddingBottom,
                        ]}
                      >
                        {`${lrCharge.chargeName}`}
                      </Text>
                    );
                  })}
                  <Text
                    style={[
                      styles.chargesText,
                      styles.bold,
                      styles.bottomBorder,
                      styles.paddingBottom,
                    ]}
                  >
                    Sub Total
                  </Text>
                  <Text
                    style={[
                      styles.chargesText,
                      styles.bottomBorder,
                      styles.paddingBottom,
                    ]}
                  >
                    GST & Charges
                  </Text>
                  <Text style={[styles.chargesText, styles.bold]}>
                    Grand Total
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableColumn,
                    styles.leftBorder,
                    styles.bottomBorder,
                    { flexGrow: 1 },
                  ]}
                >
                  <View style={[styles.tableHeader]}>
                    <Text style={[styles.body1, styles.bold]}>Rs</Text>
                  </View>
                  <Text
                    style={[
                      styles.chargesText,
                      styles.bottomBorder,
                      styles.paddingBottom,
                    ]}
                  >
                    {printRates
                      ? `Rs. ${lr.order.saleRate}`
                      : lr.fareBasis
                      ? lr.fareBasis.toUpperCase()
                      : "TBB"}
                  </Text>
                  {lr.lrCharges.map((lrCharge) => {
                    return (
                      <Text
                        style={[
                          styles.chargesText,
                          styles.bottomBorder,
                          styles.paddingBottom,
                          styles.paddingLeft,
                          parseInt(lrCharge.chargeDefaultAmount) === 0
                            ? styles.textWhite
                            : "",
                        ]}
                      >
                        {`Rs ${lrCharge.chargeDefaultAmount}`}
                      </Text>
                    );
                  })}

                  <Text
                    style={[
                      styles.chargesText,
                      styles.bold,
                      styles.bottomBorder,
                      styles.paddingBottom,
                      styles.textWhite,
                    ]}
                  >
                    Sub Total
                  </Text>
                  <Text
                    style={[
                      styles.chargesText,
                      styles.bottomBorder,
                      styles.paddingBottom,
                      styles.textWhite,
                    ]}
                  >
                    GST & Charges
                  </Text>
                  <Text style={[styles.chargesText, styles.bold]}>
                    {printRates
                      ? `Rs. 0`
                      : lr.fareBasis
                      ? lr.fareBasis.toUpperCase()
                      : "TBB"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View style={[styles.width50]}>
              <View
                style={[
                  styles.bottomBorder,
                  styles.leftBorder,
                  styles.rightBorder,
                ]}
              >
                <View style={{ display: "flex", flexDirection: "column" }}>
                  <View
                    style={[
                      {
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 4,
                      },
                      styles.bottomBorder,
                    ]}
                  >
                    <Text style={[styles.body1]}>
                      E-way Bill No:{" "}
                      {lr.ewayBillNo ? lr.ewayBillNo.toUpperCase() : ""}
                    </Text>
                  </View>
                  <View
                    style={[
                      {
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 4,
                      },
                      styles.bottomBorder,
                    ]}
                  >
                    <Text style={[styles.body1, { minWidth: 140 }]}>
                      Valid Upto:{" "}
                      {lr.ewayBillExpiryDate
                        ? moment(lr.ewayBillExpiryDate).format("DD-MM-YY")
                        : ""}
                    </Text>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      padding: 4,
                    }}
                  >
                    <Text style={[styles.body1]}>
                      GST PAYABLE BY{" "}
                      {lr.gstPayableBy
                        ? lr.gstPayableBy.toUpperCase()
                        : "CONSIGNOR/ CONSIGNEE/ TRANSPORTER"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.width50]}>
              <View style={[styles.bottomBorder, styles.rightBorder]}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 4,
                    minHeight: 66,
                  }}
                >
                  <View
                    style={[
                      {
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      },
                    ]}
                  >
                    <Text style={[styles.body1]}>
                      {`For ${lr.organisation.name}`}:
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {lr.organisation.lrTermsAndConditions && (
            <View
              style={[
                styles.bottomBorder,
                styles.leftBorder,
                styles.rightBorder,
                styles.topBorder,
                { padding: 4, marginTop: 4 },
              ]}
            >
              <View>
                <Text style={[styles.body1, styles.bold]}>
                  Terms and Conditons
                </Text>
              </View>
              <View>
                <Text style={[styles.body1]}>
                  {lr.organisation.lrTermsAndConditions}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

LrPDF.propTypes = {
  lr: PropTypes.object.isRequired,
};

export default LrPDF;

// var getsaleRate = function (delivery) {
//   if (delivery.saleType === "quantity") {
//     return `Rs. ${delivery.saleRate} / ton`;
//   } else {
//     return `Rs. ${delivery.saleRate} (Fixed)`;
//   }
// };
