export var getSumOfExpensesByCategory = (expenses) => {
  console.log(expenses);
  var result = expenses.reduce(
    (acc, n) => {
      if (acc.hasOwnProperty(n.expenseName.name))
        acc[n.expenseName.name] += parseFloat(n.expenseAmount);
      else acc[n.expenseName.name] = parseFloat(n.expenseAmount);

      return acc;
    },

    {}
  );
  return result;
};

export var getSumOfExpensesByCategoryForOthers = (expenses) => {
  console.log(expenses);
  var result = 0;
  if (expenses) {
    result = expenses.reduce(
      (acc, n) => {
        if (acc.hasOwnProperty(n.expenseName))
          acc[n.expenseName] += parseFloat(n.expenseAmount);
        else acc[n.expenseName] = parseFloat(n.expenseAmount);

        return acc;
      },

      {}
    );
  }
  return result;
};

export var getSumOfExpensesByDisplayForOthers = (expenses) => {
  console.log(expenses);
  var result = expenses.reduce(
    (acc, n) => {
      if (acc.hasOwnProperty(n.expenseDisplay))
        acc[n.expenseDisplay] += parseFloat(n.expenseAmount);
      else acc[n.expenseDisplay] = parseFloat(n.expenseAmount);

      return acc;
    },

    {}
  );
  return result;
};

export var calculateAmountForDelivery2 = (trips, delivery, type) => {
  let sumOfBillQuantity = 0;

  trips.map((trip) => {
    if (Boolean(trip.billQuantity)) {
      return (sumOfBillQuantity =
        sumOfBillQuantity + parseFloat(trip.billQuantity));
    }
    return sumOfBillQuantity;
  });
  let amount = 0;
  if (type === "sale") {
    if (
      delivery.saleType === "quantity" &&
      Boolean(delivery.minimumSaleGuarantee)
    ) {
      if (
        parseFloat(sumOfBillQuantity) <
        parseFloat(delivery.minimumSaleGuarantee)
      ) {
        amount =
          (parseFloat(delivery.minimumSaleGuarantee) *
            parseFloat(delivery.saleRate) *
            parseFloat(delivery.billQuantity || 1)) /
          parseFloat(sumOfBillQuantity || trips.length);
      } else {
        amount =
          parseFloat(delivery.billQuantity) * parseFloat(delivery.saleRate);
      }
    } else if (delivery.saleType === "quantity") {
      amount =
        parseFloat(delivery.billQuantity) * parseFloat(delivery.saleRate);
    } else {
      if (_id === delivery._id) {
        amount = parseFloat(delivery.saleRate);
      } else {
        amount = parseFloat(0);
      }
    }
    if (Boolean(amount || amount === 0)) {
      return (
        parseFloat(amount) +
        parseFloat(getSumOfExpenses(delivery.saleOthers) || 0)
      );
    } else {
      return getSumOfExpenses(delivery.saleOthers) || 0;
    }
  } else {
    if (delivery.transporter) {
      if (
        delivery.purchaseType === "quantity" &&
        Boolean(delivery.minimumPurchaseGuarantee)
      ) {
        if (
          parseFloat(sumOfBillQuantity) <
          parseFloat(delivery.minimumPurchaseGuarantee)
        ) {
          amount =
            (parseFloat(delivery.minimumPurchaseGuarantee) *
              parseFloat(delivery.purchaseRate) *
              parseFloat(delivery.billQuantity || 1)) /
            parseFloat(sumOfBillQuantity || trips.length);
        } else {
          amount =
            parseFloat(delivery.billQuantity) *
            parseFloat(delivery.purchaseRate);
        }
      } else if (delivery.purchaseType === "quantity") {
        amount =
          parseFloat(delivery.billQuantity) * parseFloat(delivery.purchaseRate);
      } else {
        if (delivery.billQuantity) {
          amount =
            (parseFloat(delivery.purchaseRate) *
              parseFloat(delivery.billQuantity)) /
            parseFloat(sumOfBillQuantity);
        } else {
          amount = parseFloat(delivery.purchaseRate);
        }
      }
    } else {
      amount = getSumOfExpenses(delivery.tripExpenses);
    }
    if (amount) {
      return parseFloat(amount) + parseFloat(delivery.purchaseOthers || 0);
    } else {
      return delivery.purchaseOthers || 0;
    }
  }
};

export var calculateAmountForDeliveryForLr = (trips, delivery, type) => {
  let sumOfBillQuantity = 0;

  trips.map((trip) => {
    if (Boolean(trip.billQuantity)) {
      return (sumOfBillQuantity =
        sumOfBillQuantity + parseFloat(trip.billQuantity));
    }
    return sumOfBillQuantity;
  });
  let amount = 0;
  if (type === "sale") {
    if (
      delivery.saleType === "quantity" &&
      Boolean(delivery.minimumSaleGuarantee)
    ) {
      if (
        parseFloat(sumOfBillQuantity) <
        parseFloat(delivery.minimumSaleGuarantee)
      ) {
        amount =
          (parseFloat(delivery.minimumSaleGuarantee) *
            parseFloat(delivery.saleRate) *
            parseFloat(delivery.billQuantity || 1)) /
          parseFloat(sumOfBillQuantity || trips.length);
      } else {
        amount =
          parseFloat(delivery.billQuantity) * parseFloat(delivery.saleRate);
      }
    } else if (delivery.saleType === "quantity") {
      amount =
        parseFloat(delivery.billQuantity) * parseFloat(delivery.saleRate);
    } else {
      amount = parseFloat(delivery.saleRate);
    }
    console.log(delivery);
    console.log(amount);
    if (amount) {
      return (
        parseFloat(amount) +
        (delivery.saleOthers
          ? parseFloat(
              getSumOfExpensesByDisplayForOthers(delivery.saleOthers)[
                "lorryReceipt"
              ]
            ) || 0
          : 0)
      );
    } else {
      return delivery.saleOthers
        ? parseFloat(
            getSumOfExpensesByDisplayForOthers(delivery.saleOthers)[
              "lorryReceipt"
            ]
          )
        : 0;
    }
  } else {
    if (delivery.transporter) {
      if (
        delivery.purchaseType === "quantity" &&
        Boolean(delivery.minimumPurchaseGuarantee)
      ) {
        if (
          parseFloat(sumOfBillQuantity) <
          parseFloat(delivery.minimumPurchaseGuarantee)
        ) {
          amount =
            (parseFloat(delivery.minimumPurchaseGuarantee) *
              parseFloat(delivery.purchaseRate) *
              parseFloat(delivery.billQuantity || 1)) /
            parseFloat(sumOfBillQuantity || trips.length);
        } else {
          amount =
            parseFloat(sumOfBillQuantity) * parseFloat(delivery.purchaseRate);
        }
      } else if (delivery.purchaseType === "quantity") {
        amount =
          parseFloat(sumOfBillQuantity) * parseFloat(delivery.purchaseRate);
      } else {
        if (delivery.billQuantity) {
          amount =
            (parseFloat(delivery.purchaseRate) *
              parseFloat(delivery.billQuantity)) /
            parseFloat(sumOfBillQuantity);
        } else {
          amount = parseFloat(delivery.purchaseRate);
        }
      }
    } else {
      amount = getSumOfExpenses(delivery.tripExpenses);
    }
    if (amount) {
      return parseFloat(amount) + parseFloat(delivery.purchaseOthers || 0);
    } else {
      return delivery.purchaseOthers || 0;
    }
  }
};

// export var calculateAmount = (trips, type, advance = false) => {
//   let sumOfBillQuantity = 0;
//   trips.map(trip => {
//     if (Boolean(trip.billQuantity)) {
//       return (sumOfBillQuantity = sumOfBillQuantity + parseFloat(trip.billQuantity));
//     }
//     return sumOfBillQuantity;

//     // return sumOfBillQuantity * parseFloat(trip.sale.saleRate);
//   });
//   let amount = 0;

//   if (type === 'sale') {
//     if (
//       order.saleType === 'quantity' &&
//       Boolean(order.minimumSaleGuarantee)
//     ) {
//       if (
//         parseFloat(sumOfBillQuantity) < parseFloat(order.minimumSaleGuarantee)
//       ) {
//         amount =
//           parseFloat(order.minimumSaleGuarantee) *
//           parseFloat(order.saleRate);
//       } else {
//         amount = parseFloat(sumOfBillQuantity) * parseFloat(order.saleRate);
//       }
//     } else if (order.saleType === 'quantity') {
//       amount = parseFloat(sumOfBillQuantity) * parseFloat(order.saleRate);
//     } else {
//       amount = parseFloat(order.saleRate);
//     }
//   } else {
//     if (order.transporter) {
//       if (
//         order.purchaseType === 'quantity' &&
//         Boolean(order.minimumPurchaseGuarantee)
//       ) {
//         if (
//           parseFloat(sumOfBillQuantity) <
//           parseFloat(order.minimumPurchaseGuarantee)
//         ) {
//           amount =
//             parseFloat(order.minimumPurchaseGuarantee) *
//             parseFloat(order.purchaseRate);
//         } else {
//           amount =
//             parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//         }
//       } else if (order.purchaseType === 'quantity') {
//         amount =
//           parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//       } else {
//         amount = parseFloat(order.purchaseRate);
//       }
//     } else {
//       // Add for all purchase
//       amount = 0;
//     }
//   }
//   if (amount) {
//     if (type === 'sale') {
//       return (
//         parseFloat(amount) +
//         //Adding Sale others of every delivery
//         trips.reduce(function(sum, current) {
//           return parseFloat(sum) + (parseFloat(current.saleOthers) || 0);
//         }, 0) -
//         (advance && parseFloat(order.saleAdvance || 0))
//       );
//     } else if (type === 'purchase') {
//       return (
//         parseFloat(amount) +
//         //Adding Trip Expenses
//         getSumOfExpenses(order.tripExpenses) +
//         //Adding Purchase others of every delivery
//         trips.reduce(function(sum, current) {
//           return parseFloat(sum) + (parseFloat(current.purchaseOthers) || 0);
//         }, 0) -
//         (advance && parseFloat(order.purchaseAdvance || 0))
//       );
//     } else {
//       console.log('Warning, check usage of Calculate Amount');
//       return parseFloat(amount);
//     }
//   } else {
//     return 0;
//   }
// };

export var checkTripStatus = (trips) => {
  let status = "Completed";
  trips.map((delivery) => {
    if (delivery.status === "pending") {
      status = "Pending";
    }
    return status;
  });
  return status;
};

// export var calculateAmount = (trips, type, advance = false) => {
//   let sumOfBillQuantity = 0;
//   trips.map(trip => {
//     if (Boolean(trip.billQuantity)) {
//       return (sumOfBillQuantity = sumOfBillQuantity + parseFloat(trip.billQuantity));
//     }
//     return sumOfBillQuantity;

//     // return sumOfBillQuantity * parseFloat(trip.sale.saleRate);
//   });
//   let amount = 0;

//   switch (type) {
//     case 'sale':
//       if (
//         order.saleType === 'quantity' &&
//         Boolean(order.minimumSaleGuarantee)
//       ) {
//         if (
//           parseFloat(sumOfBillQuantity) < parseFloat(order.minimumSaleGuarantee)
//         ) {
//           amount =
//             parseFloat(order.minimumSaleGuarantee) *
//             parseFloat(order.saleRate);
//         } else {
//           amount = parseFloat(sumOfBillQuantity) * parseFloat(order.saleRate);
//         }
//       } else if (order.saleType === 'quantity') {
//         amount = parseFloat(sumOfBillQuantity) * parseFloat(order.saleRate);
//       } else {
//         amount = parseFloat(order.saleRate);
//       }
//       return (
//         parseFloat(amount) +
//         //Adding Sale others of every delivery
//         trips.reduce(function(sum, current) {
//           return parseFloat(sum) + (parseFloat(current.saleOthers) || 0);
//         }, 0) -
//         (advance && parseFloat(order.saleAdvance || 0))
//       );

//     case 'purchase':
//       if (order.transporter) {
//         if (
//           order.purchaseType === 'quantity' &&
//           Boolean(order.minimumPurchaseGuarantee)
//         ) {
//           if (
//             parseFloat(sumOfBillQuantity) <
//             parseFloat(order.minimumPurchaseGuarantee)
//           ) {
//             amount =
//               parseFloat(order.minimumPurchaseGuarantee) *
//               parseFloat(order.purchaseRate);
//           } else {
//             amount =
//               parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//           }
//         } else if (order.purchaseType === 'quantity') {
//           amount =
//             parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//         } else if (order.purchaseType === 'commission') {
//           if (order.commissionType === 'quantity') {
//             if (
//               parseFloat(sumOfBillQuantity) <
//               parseFloat(order.minimumSaleGuarantee)
//             ) {
//               amount =
//                 parseFloat(order.minimumPurchaseGuarantee) *
//                 parseFloat(order.purchaseRate);
//             } else {
//               amount =
//                 parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//             }
//           } else if (order.commissionType === 'percentage') {
//             if (
//               parseFloat(sumOfBillQuantity) <
//               parseFloat(order.minimumSaleGuarantee)
//             ) {
//               amount =
//                 parseFloat(order.minimumPurchaseGuarantee) *
//                 parseFloat(order.purchaseRate) *
//                 parseFloat(order.saleRate / 100);
//             } else {
//               amount =
//                 (parseFloat(sumOfBillQuantity) *
//                   parseFloat(order.purchaseRate) *
//                   parseFloat(order.saleRate)) /
//                 100;
//             }
//           } else {
//             amount = parseFloat(order.purchaseRate);
//           }
//         } else {
//           amount = parseFloat(order.purchaseRate);
//         }
//       } else {
//         amount = 0;
//       }
//       return (
//         parseFloat(amount) +
//         //Adding Purchase others of every delivery
//         trips.reduce(function(sum, current) {
//           return parseFloat(sum) + (parseFloat(current.purchaseOthers) || 0);
//         }, 0) -
//         (advance && parseFloat(order.purchaseAdvance || 0))
//       );

//     case 'outflow':
//       if (order.transporter) {
//         if (
//           order.purchaseType === 'quantity' &&
//           Boolean(order.minimumPurchaseGuarantee)
//         ) {
//           if (
//             parseFloat(sumOfBillQuantity) <
//             parseFloat(order.minimumPurchaseGuarantee)
//           ) {
//             amount =
//               parseFloat(order.minimumPurchaseGuarantee) *
//               parseFloat(order.purchaseRate);
//           } else {
//             amount =
//               parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//           }
//         } else if (order.purchaseType === 'quantity') {
//           amount =
//             parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//         } else if (order.purchaseType === 'commission') {
//           if (order.commissionType === 'quantity') {
//             if (
//               parseFloat(sumOfBillQuantity) <
//               parseFloat(order.minimumSaleGuarantee)
//             ) {
//               amount =
//                 parseFloat(order.minimumPurchaseGuarantee) *
//                 parseFloat(order.purchaseRate);
//             } else {
//               amount =
//                 parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
//             }
//           } else if (order.commissionType === 'percentage') {
//             if (
//               parseFloat(sumOfBillQuantity) <
//               parseFloat(order.minimumSaleGuarantee)
//             ) {
//               amount =
//                 parseFloat(order.minimumPurchaseGuarantee) *
//                 parseFloat(order.purchaseRate) *
//                 parseFloat(order.saleRate / 100);
//             } else {
//               amount =
//                 (parseFloat(sumOfBillQuantity) *
//                   parseFloat(order.purchaseRate) *
//                   parseFloat(order.saleRate)) /
//                 100;
//             }
//           } else {
//             amount = parseFloat(order.purchaseRate);
//           }
//         } else {
//           amount = parseFloat(order.purchaseRate);
//         }
//       } else {
//         amount = 0;
//       }
//       return (
//         parseFloat(amount) +
//         //Adding Trip Expenses
//         (getSumOfExpenses(order.tripExpenses) || 0) +
//         //Adding Purchase others of every delivery
//         trips.reduce(function(sum, current) {
//           return parseFloat(sum) + (parseFloat(current.purchaseOthers) || 0);
//         }, 0) -
//         parseFloat(order.purchaseAdvance || 0)
//       );

//     default:
//       return 0;
//   }
// };

/////////////////////////////////////   NEW AMOUNT CALCULATION   ///////////////////////////////////////////

export var formatNumber = (number) => {
  return Math.round(number).toLocaleString("en-IN");
};

export var dataFormatter = (value, expr) => {
  if (typeof value === "string") {
    return value;
  }
  let o = value;
  switch (expr) {
    case "currency":
      o = value ? `₹ ${formatNumber(value)}` : "₹ 0";
      break;
    case "Expenses":
      o = value ? `₹ ${formatNumber(value)}` : "₹ 0";
      break;
    case "Profit":
      o = value ? `₹ ${formatNumber(value)}` : "₹ 0";
      break;
    case "Profit / Trip":
      o = value ? `₹ ${formatNumber(value)}` : "₹ 0";
      break;
    case "Profit / Day":
      o = value ? `₹ ${formatNumber(value)}` : "₹ 0";
      break;
    case "Profit / Turnover":
      o = value ? Math.round(value * 10000) / 100 + " %" : "0 %";
      break;

    default:
      return o;
  }
  return o;
};

export var getSumOfLrCharges = (lrCharges) => {
  if (lrCharges && lrCharges.length > 0) {
    var total = 0;
    for (var i = 0; i < lrCharges.length; i++) {
      total += parseFloat(lrCharges[i].chargeDefaultAmount || 0);
    }
    return total;
  } else {
    return 0;
  }
};

export var getSumOfInvoiceCharges = (invoiceCharges) => {
  if (invoiceCharges && invoiceCharges.length > 0) {
    var total = 0;
    for (var i = 0; i < invoiceCharges.length; i++) {
      total += parseFloat(invoiceCharges[i].amount || 0);
    }
    return total;
  } else {
    return 0;
  }
};

export var calculateAmountForOrder = (order, type, advance = false) => {
  let sumOfBillQuantity = 0;

  order.deliveries.map((delivery) => {
    if (Boolean(delivery.billQuantity)) {
      return (sumOfBillQuantity =
        sumOfBillQuantity + parseFloat(delivery.billQuantity));
    }
    return sumOfBillQuantity;
  });

  let amount = 0;

  switch (type) {
    case "sale":
      switch (order.saleType.value) {
        case "quantity":
          amount = parseFloat(sumOfBillQuantity) * parseFloat(order.saleRate);
          if (
            parseFloat(sumOfBillQuantity) <
            parseFloat(order.minimumSaleGuarantee || 0)
          ) {
            amount =
              parseFloat(order.minimumSaleGuarantee || 0) *
              parseFloat(order.saleRate);
          }

          break;
        case "fixed":
          amount = parseFloat(order.saleRate);
          break;

        default:
          break;
      }

      let lrAmount = order.deliveries.reduce(function (sum, delivery) {
        if (delivery.lr) {
          if (delivery.lr.lrCharges) {
            return (
              parseFloat(sum) +
              parseFloat(getSumOfLrCharges(delivery.lr.lrCharges || 0))
            );
          } else return 0;
        } else return 0;
      }, 0);

      let invoiceAmount = order.deliveries.reduce(function (sum, delivery) {
        if (delivery.invoiceCharges) {
          return (
            parseFloat(sum) +
            parseFloat(getSumOfInvoiceCharges(delivery.invoiceCharges || 0))
          );
        } else return 0;
      }, 0);

      return (
        parseFloat(amount) +
        lrAmount +
        invoiceAmount -
        (advance && parseFloat(order.saleAdvance || 0))
      );

    case "purchase":
      if (order.transporter) {
        switch (order.purchaseType) {
          case "quantity":
            amount =
              parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
            if (
              parseFloat(sumOfBillQuantity) <
              parseFloat(order.minimumPurchaseGuarantee || 0)
            ) {
              amount =
                parseFloat(order.minimumPurchaseGuarantee || 0) *
                parseFloat(order.purchaseRate);
            }

            break;
          case "fixed":
            amount = parseFloat(order.purchaseRate);
            break;

          case "commission":
            switch (order.commissionType) {
              case "quantity":
                amount =
                  calculateAmount(trips, "sale") -
                  parseFloat(sumOfBillQuantity) *
                    parseFloat(order.purchaseRate);
                if (
                  parseFloat(sumOfBillQuantity) <
                  parseFloat(order.minimumSaleGuarantee || 0)
                ) {
                  amount =
                    calculateAmount(trips, "sale") -
                    parseFloat(order.minimumSaleGuarantee) *
                      parseFloat(order.purchaseRate);
                }
                break;

              case "percentage":
                amount =
                  calculateAmount(trips, "sale") -
                  (parseFloat(sumOfBillQuantity) *
                    parseFloat(order.purchaseRate) *
                    parseFloat(order.saleRate)) /
                    100;
                if (
                  parseFloat(sumOfBillQuantity) <
                  parseFloat(order.minimumSaleGuarantee || 0)
                ) {
                  amount =
                    calculateAmount(trips, "sale") -
                    parseFloat(order.minimumSaleGuarantee) *
                      parseFloat(order.purchaseRate);
                }
                break;
              case "fixed":
                amount =
                  calculateAmount(trips, "sale") -
                  parseFloat(order.purchaseRate);
                break;
              default:
                amount = 0;
            }

            break;

          default:
            break;
        }
      } else {
        amount = 0;
      }

      let orderExpenses = 0;
      if (order.orderExpenses) {
        orderExpenses = order.orderExpenses.reduce(function (sum, current) {
          return (
            parseFloat(sum) + (parseFloat(current.orderExpenseAmount) || 0)
          );
        }, 0);
      }
      return (
        parseFloat(amount) +
        //Adding expenses of orders made for fulfilling the order
        +orderExpenses -
        (advance && parseFloat(order.purchaseAdvance || 0))
      );

    case "outflow":
      amount = calculateAmountForOrder(order, "purchase");
      return Math.round(
        parseFloat(amount)
        //Adding Trip Expenses
        // + (getSumOfExpenses(order.tripExpenses) || 0)
      );

    default:
      return 0;
  }
};

export var calculateAmountForDelivery = (delivery, type) => {
  let sumOfBillQuantity = 0;

  delivery.deliveries.map((delivery) => {
    if (Boolean(delivery.billQuantity)) {
      return (sumOfBillQuantity =
        sumOfBillQuantity + parseFloat(delivery.billQuantity));
    }
    return sumOfBillQuantity;
  });

  let amount = 0;

  switch (type) {
    case "sale":
      switch (delivery.saleType.value) {
        case "quantity":
          if (delivery.delivery.billQuantity) {
            amount =
              parseFloat(delivery.delivery.billQuantity) *
              parseFloat(delivery.saleRate);
          }
          if (
            parseFloat(sumOfBillQuantity) <
            parseFloat(delivery.minimumSaleGuarantee || 0)
          ) {
            amount =
              (parseFloat(delivery.minimumSaleGuarantee || 0) *
                parseFloat(delivery.saleRate) *
                parseFloat(delivery.delivery.billQuantity || 1)) /
              parseFloat(sumOfBillQuantity || delivery.deliveries.length);
          }
          // console.log("amount");
          // console.log(amount);
          break;
        case "fixed":
          amount = parseFloat(delivery.saleRate);
          break;

        default:
          break;
      }

      let lrAmount = 0;
      if (delivery.delivery.lr) {
        if (delivery.delivery.lr.lrCharges) {
          lrAmount = parseFloat(
            getSumOfLrCharges(delivery.delivery.lr.lrCharges || 0)
          );
        }
      }

      let invoiceAmount = 0;
      console.log(delivery);
      if (delivery.invoiceCharges) {
        invoiceAmount = parseFloat(
          getSumOfInvoiceCharges(delivery.invoiceCharges || 0)
        );
      }

      return parseFloat(amount) + lrAmount + invoiceAmount;

    // case "purchase":
    //   if (order.transporter) {
    //     switch (order.purchaseType) {
    //       case "quantity":
    //         amount =
    //           parseFloat(sumOfBillQuantity) * parseFloat(order.purchaseRate);
    //         if (
    //           parseFloat(sumOfBillQuantity) <
    //           parseFloat(order.minimumPurchaseGuarantee || 0)
    //         ) {
    //           amount =
    //             parseFloat(order.minimumPurchaseGuarantee || 0) *
    //             parseFloat(order.purchaseRate);
    //         }

    //         break;
    //       case "fixed":
    //         amount = parseFloat(order.purchaseRate);
    //         break;

    //       case "commission":
    //         switch (order.commissionType) {
    //           case "quantity":
    //             amount =
    //               calculateAmount(trips, "sale") -
    //               parseFloat(sumOfBillQuantity) *
    //                 parseFloat(order.purchaseRate);
    //             if (
    //               parseFloat(sumOfBillQuantity) <
    //               parseFloat(order.minimumSaleGuarantee || 0)
    //             ) {
    //               amount =
    //                 calculateAmount(trips, "sale") -
    //                 parseFloat(order.minimumSaleGuarantee) *
    //                   parseFloat(order.purchaseRate);
    //             }
    //             break;

    //           case "percentage":
    //             amount =
    //               calculateAmount(trips, "sale") -
    //               (parseFloat(sumOfBillQuantity) *
    //                 parseFloat(order.purchaseRate) *
    //                 parseFloat(order.saleRate)) /
    //                 100;
    //             if (
    //               parseFloat(sumOfBillQuantity) <
    //               parseFloat(order.minimumSaleGuarantee || 0)
    //             ) {
    //               amount =
    //                 calculateAmount(trips, "sale") -
    //                 parseFloat(order.minimumSaleGuarantee) *
    //                   parseFloat(order.purchaseRate);
    //             }
    //             break;
    //           case "fixed":
    //             amount =
    //               calculateAmount(trips, "sale") -
    //               parseFloat(order.purchaseRate);
    //             break;
    //           default:
    //             amount = 0;
    //         }

    //         break;

    //       default:
    //         break;
    //     }
    //   } else {
    //     amount = 0;
    //   }
    //   return (
    //     parseFloat(amount) +
    //     //Adding Purchase others of every delivery
    //     // trips.reduce(function (sum, current) {
    //     //   return parseFloat(sum) + (parseFloat(current.purchaseOthers) || 0);
    //     // }, 0)
    //     -(advance && parseFloat(order.purchaseAdvance || 0))
    //   );

    // case "outflow":
    //   amount = calculateAmountForOrder(order, "purchase");
    //   return Math.round(
    //     parseFloat(amount)
    //     //Adding Trip Expenses
    //     // + (getSumOfExpenses(order.tripExpenses) || 0)
    //   );

    default:
      return 0;
  }
};

export var getInvoiceWeight = (delivery, type) => {
  let sumOfBillQuantity = 0;
  let deliveryArray = [];
  delivery.deliveries.map((del) => {
    if (Boolean(del.billQuantity)) {
      deliveryArray.push(`${del.billQuantity} MT`);
      return (sumOfBillQuantity =
        sumOfBillQuantity + parseFloat(del.billQuantity));
    }
    deliveryArray.push(`${0} MT`);
    return sumOfBillQuantity;

    // return sumOfBillQuantity * parseFloat(trip.sale.saleRate);
  });
  let weight;
  let guarantee = false;
  let deliveryString = [];
  if (
    parseFloat(sumOfBillQuantity) < parseFloat(delivery.minimumSaleGuarantee)
  ) {
    deliveryString = deliveryArray.join(" + ");
  } else {
    deliveryString = `${delivery.billQuantity || 0} MT`;
  }
  switch (type) {
    case "sale":
      if (
        parseFloat(sumOfBillQuantity) <
        parseFloat(delivery.minimumSaleGuarantee)
      ) {
        weight = parseFloat(delivery.minimumSaleGuarantee);
        guarantee = true;
      } else {
        weight = parseFloat(delivery.billQuantity);
      }
      return { deliveryString, weight, guarantee };
    case "purchase":
      if (
        parseFloat(sumOfBillQuantity) <
        parseFloat(delivery.minimumPurchaseGuarantee)
      ) {
        weight = parseFloat(delivery.minimumPurchaseGuarantee);
        guarantee = true;
      } else {
        weight = parseFloat(delivery.billQuantity);
      }
      return { deliveryString, weight, guarantee };

    default:
      return { deliveryString, weight: 0, guarantee };
  }
};
