import React, { useCallback, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import { useAuth } from "../../../hooks/use-auth";
import { deliveryApi } from "../../../api/delivery-api";
import { deliveriesTable } from "../../grids/grid-columns";
import { orderApi } from "../../../api/order-api";

const DeliveriesGrid = ({ onOpenDrawer }) => {
  const { account } = useAuth();
  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    const dataSource = {
      rowCount: undefined,
      getRows: async (params) => {
        let filter = params.filterModel;
        const sort = params.sortModel;

        let { data, count = 0 } = await deliveryApi.getDeliveriesByAccount(
          JSON.stringify({
            account: account._id,
            startRow: params.startRow,
            endRow: params.endRow,
            filter,
          })
        );
        params.successCallback(data, count);
      },
    };
    params.api.setDatasource(dataSource);
    setGridApi(params.api);
  }, []);

  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
      filter: true,
      menuTabs: ["filterMenuTab"],
    };
  }, []);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{ width: "100%", height: "100%" }}
        className="ag-theme-balham"
      >
        <AgGridReact
          columnDefs={deliveriesTable(account)}
          rowModelType={"infinite"}
          onGridReady={onGridReady}
          rowSelection="multiple"
          onSelectionChanged={async (event) => {
            event.api.getSelectedNodes().map(async (node) => {
              let response = await orderApi.getOrderById(node.data._id);

              onOpenDrawer(response.data, gridApi);
            });
          }}
        />
      </div>
    </div>
  );
};

export default DeliveriesGrid;
