const getSumOfExpenses = (expenses) => {
  if (expenses && expenses.length > 0) {
    var total = 0;
    for (var i = 0; i < expenses.length; i++) {
      total += parseFloat(expenses[i].expenseAmount);
    }
    return total;
  } else {
    return 0;
  }
};

const calculateAmountForDelivery = (trip, deliveries, delivery, type) => {
  console.log('asdasdasdsdasdasdas');
  console.log(deliveries);
  let sumOfBillWeight = 0;
  deliveries.map((delivery) => {
    if (Boolean(delivery.billWeight)) {
      return (sumOfBillWeight =
        sumOfBillWeight + parseFloat(delivery.billWeight));
    }
    return sumOfBillWeight;
  });

  if (type === 'sale') {
    if (
      trip.sale.saleType === 'quantity' &&
      Boolean(trip.sale.saleMinimumQuantity)
    ) {
      if (
        parseFloat(sumOfBillWeight) < parseFloat(trip.sale.saleMinimumQuantity)
      ) {
        return (
          (parseFloat(trip.sale.saleMinimumQuantity) *
            parseFloat(trip.sale.saleRate) *
            parseFloat(delivery.billWeight)) /
          parseFloat(sumOfBillWeight)
        );
      } else {
        return parseFloat(delivery.billWeight) * parseFloat(trip.sale.saleRate);
      }
    } else if (trip.sale.saleType === 'quantity') {
      return parseFloat(delivery.billWeight) * parseFloat(trip.sale.saleRate);
    } else {
      return (
        (parseFloat(trip.sale.saleRate) * parseFloat(delivery.billWeight)) /
        parseFloat(sumOfBillWeight)
      );
    }
  } else {
    if (!trip.isVehicleOwned) {
      if (
        trip.purchase.purchaseType === 'quantity' &&
        Boolean(trip.purchase.purchaseMinimumQuantity)
      ) {
        if (
          parseFloat(sumOfBillWeight) <
          parseFloat(trip.purchase.purchaseMinimumQuantity)
        ) {
          return (
            parseFloat(trip.purchase.purchaseMinimumQuantity) *
            parseFloat(trip.purchase.purchaseRate)
          );
        } else {
          return (
            parseFloat(sumOfBillWeight) * parseFloat(trip.purchase.purchaseRate)
          );
        }
      } else if (trip.purchase.purchaseType === 'quantity') {
        return (
          parseFloat(sumOfBillWeight) * parseFloat(trip.purchase.purchaseRate)
        );
      } else {
        return parseFloat(trip.purchase.purchaseRate);
      }
    } else {
      return getSumOfExpenses(trip.tripExpenses);
    }
  }
};

module.exports = calculateAmountForDelivery;
