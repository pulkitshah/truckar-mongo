import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useAuth } from "../../../hooks/use-auth";
import { orderApi } from "../../../api/order-api";
import { orderTable } from "../../grids/grid-columns";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { FilterDrawer } from "./filter-drawer";
import { checkJsonString } from "../../../utils/check-json-string";

const Table = ({ onOpenDrawer, open, toggleDrawer }) => {
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

        let { data, count = 0 } = await orderApi.getOrdersByAccount(
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
      // filter: true,
      menuTabs: ["filterMenuTab"],
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <FilterDrawer
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
        open={open}
        gridApi={gridApi}
      />
      <div
        style={{ width: "100%", height: "100%" }}
        className="ag-theme-balham"
      >
        <AgGridReact
          columnDefs={orderTable(account)}
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
