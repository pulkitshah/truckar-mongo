import React, { useEffect, useCallback, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch } from "../../../store";
import { deliveryDetailsTableForOrderDrawer } from "../../grids/grid-columns";
import { deliveryApi } from "../../../api/delivery-api";
import { useMounted } from "../../../hooks/use-mounted";
import { useAuth } from "../../../hooks/use-auth";
import unwind from "../../../utils/unwind";

const Table = ({ order, gridApi }) => {
  const dispatch = useDispatch();
  let deliveries = unwind("deliveries", order);

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

  if (!deliveries) {
    return "...Loading";
  }

  return (
    <React.Fragment>
      <DataGrid
        getRowId={(row) => row.deliveries._id}
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
