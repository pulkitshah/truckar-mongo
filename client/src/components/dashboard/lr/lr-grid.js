import React, { useCallback, useMemo, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useAuth } from "../../../hooks/use-auth";
import { lrApi } from "../../../api/lr-api";
import { lrTable } from "../../grids/grid-columns";
import { checkJsonString } from "../../../utils/check-json-string";

const Table = ({ onOpenDrawer }) => {
  const { account } = useAuth();
  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    const dataSource = {
      rowCount: undefined,
      getRows: async (params) => {
        let filter = params.filterModel;
        const sort = params.sortModel;

        if (filter.customer) {
          let filteredCustomers = filter.customer.values.map((c) => {
            if (checkJsonString(c)) {
              return JSON.parse(c)._id;
            } else {
              return c;
            }
          });

          filter.customer = { filterType: "set", values: filteredCustomers };
        }

        if (filter.organisation) {
          let filteredOrganisations = filter.organisation.values.map((c) => {
            if (checkJsonString(c)) {
              return JSON.parse(c)._id;
            } else {
              return c;
            }
          });

          console.log(filter.organisation);

          filter.organisation = {
            filterType: "set",
            values: filteredOrganisations,
          };
        }

        let { data, count = 0 } = await lrApi.getLrsByAccount(
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
          columnDefs={lrTable(account)}
          defaultColDef={defaultColDef}
          rowModelType={"infinite"}
          onGridReady={onGridReady}
          rowSelection="multiple"
          onSelectionChanged={(event) => {
            event.api
              .getSelectedNodes()
              .map((node) => onOpenDrawer(node.data, gridApi));
          }}
        />
      </div>
    </div>
  );
};

export default Table;
