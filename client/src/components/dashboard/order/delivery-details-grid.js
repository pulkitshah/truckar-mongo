import React, { useEffect, useCallback, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch } from "../../../store";
import { deliveryDetailsTableForOrderDrawer } from "../../grids/grid-columns";
import { deliveryApi } from "../../../api/delivery-api";
import { useMounted } from "../../../hooks/use-mounted";

const Table = ({ order, gridApi }) => {
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const [deliveries, setDeliveries] = useState();

  const updateDelivery = React.useCallback(async (newRow, error) => {
    try {
      let newDelivery = {
        id: newRow.id,
        billQuantity: newRow.billQuantity,
        unloadingQuantity: newRow.unloadingQuantity,
        _version: newRow._version,
      };

      const response = await deliveryApi.updateDelivery(newDelivery, dispatch);
      gridApi.refreshInfiniteCache();
      return response;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getDeliveriesByOrder = useCallback(async () => {
    try {
      let data = await deliveryApi.getDeliveriesByOrder(order, dispatch);
      if (isMounted()) {
        setDeliveries(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, order]);

  useEffect(() => {
    try {
      getDeliveriesByOrder();
    } catch (error) {
      console.log(error);
    }
  }, [order]);

  if (!deliveries) {
    return "...Loading";
  }

  return (
    <React.Fragment>
      <DataGrid
        rows={deliveries}
        autoHeight={true}
        columns={deliveryDetailsTableForOrderDrawer}
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        processRowUpdate={updateDelivery}
      />
    </React.Fragment>
  );
};

export default Table;
