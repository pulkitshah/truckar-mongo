import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { useAuth } from "../../../hooks/use-auth";
import { orderApi } from "../../../api/order-api";
import { orderTable } from "../../grids/grid-columns";

const Table = ({ onOpenDrawer }) => {
  const { account } = useAuth();

  const [gridApi, setGridApi] = useState(null);
  const [pageTokens, setPageTokens] = useState([
    {
      startRow: 0,
      endRow: 100,
      nextToken: null,
    },
  ]);
  const [noOfRows, setNoOfRows] = useState(0);
  const pageTokensRef = useRef(null);
  const noOfRowsRef = useRef(null);

  useEffect(() => {
    pageTokensRef.current = pageTokens;
    noOfRowsRef.current = noOfRows;
  }, [pageTokens, noOfRows]);

  const onGridReady = useCallback((params) => {
    const dataSource = {
      rowCount: undefined,
      getRows: async (params) => {
        let currentPageToken = pageTokensRef.current.find(
          (pageToken) => pageToken.startRow === params.startRow
        );
        let { data } = await orderApi.getOrdersByAccount(account);
        console.log(data);
        // setPageTokens((previousPageTokens) => {
        //   let currentPageToken = previousPageTokens.find(
        //     (pageToken) => pageToken.startRow === params.endRow
        //   );

        //   if (currentPageToken) {
        //     return previousPageTokens;
        //   } else {
        //     setNoOfRows(noOfRowsRef.current + data.orders.length);
        //     noOfRowsRef.current = noOfRowsRef.current + data.orders.length;
        //     pageTokensRef.current = [
        //       ...previousPageTokens,
        //       {
        //         startRow: params.endRow,
        //         endRow: params.endRow + 100,
        //         nextToken: data.nextOrderToken,
        //       },
        //     ];
        //     return [
        //       ...previousPageTokens,
        //       {
        //         startRow: params.endRow,
        //         endRow: params.endRow + 100,
        //         nextToken: data.nextOrderToken,
        //       },
        //     ];
        //   }
        // });
        let lastRow = -1;
        // if (data.orders.length < params.endRow - params.startRow) {
        //   lastRow = noOfRowsRef.current;
        // }

        params.successCallback(data, lastRow);
      },
    };
    params.api.setDatasource(dataSource);
    setGridApi(params.api);
  }, []);

  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{ width: "100%", height: "100%" }}
        className="ag-theme-balham"
      >
        <AgGridReact
          columnDefs={orderTable}
          defaultColDef={defaultColDef}
          rowModelType={"infinite"}
          onGridReady={onGridReady}
          rowSelection="multiple"
          onSelectionChanged={(event) => {
            event.api
              .getSelectedNodes()
              .map((node) => onOpenDrawer(node.data, gridApi));
          }}
          infiniteInitialRowCount={150}
        />
      </div>
    </div>
  );
};

export default Table;
