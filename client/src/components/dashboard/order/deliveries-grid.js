import React, { useCallback, useRef, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import { useAuth } from "../../../hooks/use-auth";
import { deliveryApi } from "../../../api/delivery-api";
import { deliveriesTable } from "../../grids/grid-columns";

const DeliveriesGrid = ({ onOpenDrawer }) => {
  const { user } = useAuth();
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

        let data = await deliveryApi.getDeliveriesByUser(
          user,
          currentPageToken && currentPageToken.nextToken
        );

        console.log(data);

        setPageTokens((previousPageTokens) => {
          let currentPageToken = previousPageTokens.find(
            (pageToken) => pageToken.startRow === params.endRow
          );

          if (currentPageToken) {
            return previousPageTokens;
          } else {
            setNoOfRows(noOfRowsRef.current + data.deliveries.length);
            noOfRowsRef.current = noOfRowsRef.current + data.deliveries.length;
            pageTokensRef.current = [
              ...previousPageTokens,
              {
                startRow: params.endRow,
                endRow: params.endRow + 100,
                nextToken: data.nextOrderToken,
              },
            ];
            return [
              ...previousPageTokens,
              {
                startRow: params.endRow,
                endRow: params.endRow + 100,
                nextToken: data.nextOrderToken,
              },
            ];
          }
        });
        let lastRow = -1;
        if (data.deliveries.length < params.endRow - params.startRow) {
          lastRow = noOfRowsRef.current;
        }

        params.successCallback(data.deliveries, lastRow);
      },
    };
    params.api.setDatasource(dataSource);
    setGridApi(params.api);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{ width: "100%", height: "100%" }}
        className="ag-theme-balham"
      >
        <AgGridReact
          columnDefs={deliveriesTable}
          rowModelType={"infinite"}
          onGridReady={onGridReady}
          rowSelection="multiple"
          onSelectionChanged={(event) => {
            event.api
              .getSelectedNodes()
              .map((node) => onOpenDrawer(node.data.order, gridApi));
          }}
          infiniteInitialRowCount={150}
        />
      </div>
    </div>
  );
};

export default DeliveriesGrid;
