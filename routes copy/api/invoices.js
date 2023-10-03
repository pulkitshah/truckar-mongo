const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const Delivery = require("../../models/Delivery");
const Invoice = require("../../models/Invoice");
const Organisation = require("../../models/Organisation");

const auth = require("../../middlleware/auth");
const getFiscalYear = require("../../utils/getFiscalYear");

const router = express.Router();

// @route   post api/invoicex/invoicenumber/:orgId
// @desc    Get Invoice No. Organisation
// @access  Private

router.post("/invoicenumber/:orgId", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  try {
    var sellerOrganisation = await Organisation.findOne({
      user: req.user.id,
      _id: req.params.orgId,
    });

    var fiscalYear = `${getFiscalYear(
      req.body.invoiceDate
    ).current.start.format("YYYY")}-${getFiscalYear(
      req.body.invoiceDate
    ).current.end.format("YYYY")}`;

    var results = await Invoice.find({
      user: req.user.id,
      sellerOrganisation: req.params.orgId,
      invoiceDate: {
        $lte: getFiscalYear(req.body.invoiceDate).current.end,
        $gte: getFiscalYear(req.body.invoiceDate).current.start,
      },
    });
    console.log(results);

    var invoiceCount = results.length + 1;

    sellerOrganisation.counter.map((counter) => {
      if (
        fiscalYear === counter.fiscalYear &&
        "invoice" === counter.counterType
      ) {
        invoiceCount = invoiceCount + parseInt(counter.count);
      }
    });
    // res.send(results);

    res.send(`${invoiceCount}`);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   post api/invoice/:InvoiceId
// @desc    Update InvoiceNo and invoice Details in the delivery
// @access  Private

router.post("/", auth, async (req, res) => {
  // const updates = Object.keys(req.body);
  try {
    var checkInvoice = await Invoice.findOne({
      user: req.user.id,
      sellerOrganisation: req.body.sellerOrganisation,
      invoiceNo: req.body.invoiceNo,
      invoiceType: req.body.invoiceType,
    });
    console.log(req.body);

    if (checkInvoice) {
      return res.status(400).send("Invoice already exists with the Invoice no");
    }

    var results = await Invoice.find({
      user: req.user.id,
      sellerOrganisation: req.body.sellerOrganisation,
      invoiceDate: {
        $lte: getFiscalYear(req.body.invoiceDate).current.end,
        $gte: getFiscalYear(req.body.invoiceDate).current.start,
      },
    });

    let invoiceFields = {};
    invoiceFields.user = req.user.id;

    if (req.body.invoiceNo) {
      invoiceFields.invoiceNo = req.body.invoiceNo;
    } else {
      invoiceFields.invoiceNo = `${results.length + 1}`;
    }
    if (req.body.invoiceDate)
      invoiceFields.invoiceDate = moment(req.body.invoiceDate).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    if (req.body.sellerOrganisation)
      invoiceFields.sellerOrganisation = req.body.sellerOrganisation;
    if (req.body.buyerOrganisation)
      invoiceFields.buyerOrganisation = req.body.buyerOrganisation;
    if (req.body.invoiceType) invoiceFields.invoiceType = req.body.invoiceType;

    invoice = new Invoice(invoiceFields);
    await invoice.save();
    await invoice.populate("sellerOrganisation").execPopulate();
    await invoice.populate("buyerOrganisation").execPopulate();

    res.send(invoice);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   post api/invoice/:InvoiceId
// @desc    Update InvoiceNo and invoice Details in the delivery
// @access  Private

router.post("/purchase", auth, async (req, res) => {
  // const updates = Object.keys(req.body);
  try {
    let invoiceFields = {};
    invoiceFields.user = req.user.id;

    if (req.body.invoiceNo) {
      invoiceFields.invoiceNo = req.body.invoiceNo;
    }
    if (req.body.invoiceDate)
      invoiceFields.invoiceDate = moment(req.body.invoiceDate).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    if (req.body.sellerOrganisation)
      invoiceFields.sellerOrganisation = req.body.sellerOrganisation;
    if (req.body.buyerOrganisation)
      invoiceFields.buyerOrganisation = req.body.buyerOrganisation;
    if (req.body.invoiceType) invoiceFields.invoiceType = req.body.invoiceType;

    invoice = new Invoice(invoiceFields);
    await invoice.save();
    await invoice.populate("sellerOrganisation").execPopulate();
    await invoice.populate("buyerOrganisation").execPopulate();

    res.send(invoice);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
// @route   Patch api/invoice/:InvoiceId
// @desc    Patch InvoiceNo and invoice Details in the delivery
// @access  Private

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    let invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!invoice) {
      return res.status(404).send("No invoice to update");
    }

    updates.forEach((update) => (invoice[update] = req.body[update]));
    await invoice.populate("buyerParty").execPopulate();
    await invoice.populate("buyerBillingAddress").execPopulate();
    await invoice.populate("sellerParty").execPopulate();
    await invoice.populate("sellerBillingAddress").execPopulate();

    await invoice.save();
    res.send(invoice);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   Get api/invoice/:InvoiceId
// @desc    Get invoice Details
// @access  Private

router.get("/:id", auth, async (req, res) => {
  try {
    invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate("sellerOrganisation")
      .populate("buyerOrganisation");
    if (!invoice) {
      return res.status(202).send("No Invoice Found, Recheck ID");
    }
    await invoice.populate("user");
    await invoice.populate("buyerParty");
    await invoice.populate("buyerBillingAddress");
    await invoice.populate("sellerParty");
    await invoice.populate("sellerBillingAddress");
    res.send(invoice);
  } catch (error) {
    console.log(error);
    res.status(400).send("Recheck Id");
  }
});

// @route   GET api/invoices/delivery/:DeliveryId
// @desc    Send Delivery Id to get Invoices including the delivery
// @access  Private

router.get("/delivery/:id", auth, async (req, res) => {
  try {
    invoice = await Invoice.find({
      deliveryIds: {
        $in: [mongoose.Types.ObjectId(req.params.id)],
      },
      user: req.user.id,
    })
      .populate("sellerOrganisation")
      .populate("buyerOrganisation")
      .populate("buyerParty")
      .populate("buyerBillingAddress")
      .populate("sellerParty")
      .populate("sellerBillingAddress")
      .sort({ _id: -1 });

    if (!invoice) {
      return res.status(202).send("Invoice not made for delivery");
    }
    // await invoice.populate('sellerOrganisation').execPopulate();
    res.status(200).send(invoice);
  } catch (error) {
    console.log(error);
    res.status(400).send("Recheck Id");
  }
});

router.get("/", auth, async (req, res) => {
  try {
    // const invoices = await Invoice.aggregate([
    //   {
    //     $match: { user: mongoose.Types.ObjectId(req.user.id) },
    //   },
    //   { $sort: { invoiceDate: -1 } },
    // ]);

    const invoices = await Invoice.find({
      user: new mongoose.Types.ObjectId(req.user.id),
    })
      .populate("sellerOrganisation")
      .populate("buyerOrganisation")
      .populate("buyerParty")
      .populate("buyerBillingAddress")
      .populate("sellerParty")
      .populate("sellerBillingAddress")
      .sort({ _id: -1 });

    res.json(invoices);
  } catch (error) {
    console.log(error);
    res.status(400).send("Recheck Id");
  }
});
module.exports = router;
