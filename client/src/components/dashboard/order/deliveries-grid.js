import React, { useCallback, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import { useAuth } from "../../../hooks/use-auth";
import { deliveryApi } from "../../../api/delivery-api";
import { deliveriesTable } from "../../grids/grid-columns";

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
        console.log(data);
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
          onSelectionChanged={(event) => {
            event.api
              .getSelectedNodes()
              .map((node) => onOpenDrawer(node.data.order, gridApi));
          }}
        />
      </div>
    </div>
  );
};

export default DeliveriesGrid;
