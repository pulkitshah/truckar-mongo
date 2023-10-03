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

  declaration: {
    flexGrow: 3,
  },

  width33: {
    flexGrow: 1,
    minWidth: "33.3333333333%",
    maxWidth: "33.3333333333%",
    minHeight: 100,
  },

  box: { borderWidth: "1pt", padding: 10 },
  sign: { borderWidth: "1pt", padding: 10, minWidth: 120 },
  tableColumn: {
    borderWidth: "1pt",
    minHeight: "20vh",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
  },
  tableHeader: {
    borderBottomWidth: "1pt",
    height: 30,
    padding: 4,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  tableTotal: { borderTopWidth: "1pt", height: 30, padding: 4 },

  bottomBorder: { borderBottomWidth: "1pt", paddingBottom: 4, marginBottom: 4 },
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

  body1: {
    fontSize: 9,
    lineHeight: 1.5,
    maxWidth: 170,
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

const LrPDF = ({ lr, deliveries }) => {
  if (!lr) {
    return null;
  }
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ display: "flex" }}>
          <View>
            {lr.organisation.logo && (
              <Image
                source={{
                  uri: lr.organisation.logo.location,
                  method: "GET",
                  headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
                  body: "",
                }}
                style={styles.logo}
              />
            )}
          </View>
          <View style={styles.header}>
            <View style={[styles.width33]}>
              <Text style={styles.body1}>Registered Address:</Text>
              <Text style={styles.body1}>{lr.organisation.addressLine1}</Text>
              <Text style={styles.body1}>{lr.organisation.addressLine2}</Text>
              <Text style={styles.body1}> {lr.organisation.jurisdiction}</Text>
              <Text style={styles.body1}>
                {" "}
                Contact No: +91 {lr.user.mobile}
              </Text>
              <Text style={styles.body1}> </Text>
              <Text style={styles.body1}>
                {" "}
                {lr.organisation.pan
                  ? `PAN No: ${lr.organisation.pan}`
                  : ""}{" "}
              </Text>
              <Text style={styles.body1}>
                {" "}
                {lr.organisation.gstin
                  ? `GSTIN No. ${lr.organisation.gstin}`
                  : ""}
              </Text>
            </View>
            <View style={[styles.width33, styles.box]}>
              <Text
                style={[
                  styles.body1,
                  styles.centerAlign,
                  styles.bold,
                  styles.underlined,
                ]}
              >
                INSURANCE
              </Text>
              <Text style={[styles.body1, styles.centerAlign]}>
                The customer has stated that they have not taken the insurance
              </Text>
              <Text style={styles.body1}> </Text>
              <Text style={[styles.body1, styles.centerAlign]}>OR</Text>
              <Text style={styles.body1}> </Text>
              <Text style={[styles.body1, styles.bold]}>
                {" "}
                Insurance Company: ____________
              </Text>
              <Text style={[styles.body1, styles.bold]}>
                {" "}
                Policy No: _________________
              </Text>
            </View>
            <View style={[styles.width33, styles.box, styles.lrDetail]}>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                LR no - {lr.lrNo}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                Date - {moment(lr.date).format("DD-MMM-YYYY")}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                Vehicle Number - {lr.trip.vehicleNumber}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                E-Way Bill No -
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                Valid Upto -
              </Text>
            </View>
          </View>
          <View style={styles.header}>
            <View style={[styles.width33, styles.box]}>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                CONSIGNOR
              </Text>
              <Text style={styles.body1}>
                {lr.consignor && lr.consignor.name}
              </Text>
              <Text style={styles.body1}>
                {lr.consignor && lr.consignor.billingAddressLine1}
              </Text>
              <Text style={styles.body1}>
                {" "}
                {lr.consignor && lr.consignor.billingAddressLine2}
              </Text>
              <Text style={styles.body1}>
                {lr.consignor &&
                  lr.consignor.city &&
                  lr.consignor.city.description}
              </Text>
              <Text style={styles.body1}>
                {" "}
                {lr.consignor && lr.consignor.pan
                  ? `PAN No: ${lr.consignor.pan}`
                  : ""}{" "}
              </Text>
              <Text style={styles.body1}>
                {lr.consignor && lr.consignor.gstin
                  ? `GSTIN No. ${lr.consignor.gstin}`
                  : ""}
              </Text>
            </View>
            <View style={[styles.width33, styles.box]}>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                CONSIGNEE
              </Text>
              <Text style={styles.body1}>
                {lr.consignee && lr.consignee.name}
              </Text>
              <Text style={styles.body1}>
                {lr.consignee && lr.consignee.billingAddressLine1}
              </Text>
              <Text style={styles.body1}>
                {" "}
                {lr.consignee && lr.consignee.billingAddressLine2}
              </Text>
              <Text style={styles.body1}>
                {lr.consignee &&
                  lr.consignee.city &&
                  lr.consignee.city.description}
              </Text>
              <Text style={styles.body1}>
                {" "}
                {lr.consignee && lr.consignee.pan
                  ? `PAN No: ${lr.consignee.pan}`
                  : ""}{" "}
              </Text>
              <Text style={styles.body1}>
                {lr.consignee && lr.consignee.gstin
                  ? `GSTIN No. ${lr.consignee.gstin}`
                  : ""}
              </Text>
            </View>
            <View style={[styles.width33, styles.box, styles.lrDetail]}>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                LOADING FROM
              </Text>
              <Text style={[styles.body1, styles.bottomBorder]}>
                {lr.delivery.loading.description}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                UNLOADING AT
              </Text>
              <Text style={[styles.body1, styles.bottomBorder]}>
                {lr.delivery.unloading.description}
              </Text>
              <Text style={[styles.body1, styles.bold, styles.underlined]}>
                {" "}
                GST PAYABLE BY
              </Text>
              <Text style={[styles.body1]}>
                {" "}
                CONSIGNOR/ CONSIGNEE/ TRANSPORTER
              </Text>
            </View>
          </View>
          <View style={styles.header}>
            <View style={[styles.tableColumn]}>
              <View style={[styles.tableHeader]}>
                <Text style={[styles.body1, styles.bold]}>NO OF ARTICLES</Text>
              </View>
              <View style={[styles.tableTotal]}>
                <Text style={[styles.body1, styles.bold]}></Text>
              </View>
            </View>
            <View style={[styles.tableColumn, { flexGrow: 3 }]}>
              <View style={[styles.tableHeader]}>
                <Text style={[styles.body1, styles.bold]}>NATURE OF GOODS</Text>
              </View>
              <View style={[styles.tableTotal]}>
                <Text style={[styles.body1, styles.bold]}></Text>
              </View>
            </View>
            <View style={[styles.tableColumn, { flexGrow: 0.5 }]}>
              <View style={[styles.tableHeader]}>
                <Text style={[styles.body1, styles.bold]}>WEIGHT</Text>
              </View>
              <View style={[styles.tableTotal]}>
                <Text style={[styles.body1, styles.bold]}></Text>
              </View>
            </View>
            <View style={[styles.tableColumn, { flexGrow: 0.5 }]}>
              <View style={[styles.tableHeader]}>
                <Text style={[styles.body1, styles.bold]}>RATE</Text>
              </View>
              <View style={[styles.tableTotal]}>
                <Text style={[styles.body1, styles.bold]}></Text>
              </View>
            </View>
            <View style={[styles.tableColumn, { flexGrow: 0.5 }]}>
              <View style={[styles.tableHeader]}>
                <Text style={[styles.body1, styles.bold]}>FREIGHT</Text>
              </View>
              <View style={[styles.tableTotal]}>
                <Text style={[styles.body1, styles.bold]}></Text>
              </View>
            </View>
            <View
              style={[
                styles.tableColumn,
                {
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexGrow: 0.5,
                },
              ]}
            >
              <View
                style={[
                  {
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    flexGrow: 0.5,
                    transform: "rotate(90deg)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.body1,
                    styles.bold,
                    {
                      transform: "rotate(90deg)",
                    },
                  ]}
                >
                  {" "}
                  TO B.B
                </Text>
              </View>
            </View>
            <View style={[styles.tableColumn, { flexGrow: 0.5 }]}>
              <View style={[styles.tableHeader]}>
                <Text style={[styles.body1, styles.bold]}>
                  GOODS INVOICE VALUE
                </Text>
              </View>
              <View style={[styles.tableTotal]}>
                <Text style={[styles.body1, styles.bold]}></Text>
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.declaration}>
              <Text style={styles.declarationText}>
                The consignment will not be shifted, diverted or re-routed
                without consignee bank's written permission.
              </Text>
              <Text style={styles.declarationText}>
                For terms and conditions, visit
                www.truckar.in/termsandconditions
              </Text>
              <Text style={styles.declarationText}>
                This is a system generated document. No signature is required.
              </Text>
            </View>
            <View style={styles.sign}>
              <Text style={styles.body1}>SIGN</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

LrPDF.propTypes = {
  lr: PropTypes.object.isRequired,
};

export default LrPDF;
