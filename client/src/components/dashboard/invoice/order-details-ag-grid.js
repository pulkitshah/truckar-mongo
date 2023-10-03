import React, { useCallback, useRef, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { orderTableForCreateInvoice } from "../../grids/grid-columns";
import { orderApi } from "../../../api/order-api";
import { deliveryApi } from "../../../api/delivery-api";

const OrderDetailsGrid = ({ formik }) => {
  const [gridApi, setGridApi] = useState(null);

  const [pageTokens, setPageTokens] = React.useState({
    noOfRows: 0,
    nextToken: null,
  });
  const pageTokensRef = useRef(null);

  useEffect(() => {
    pageTokensRef.current = pageTokens;
  }, [pageTokens]);

  const onGridReady = useCallback((params) => {
    const dataSource = {
      rowCount: undefined,
      getRows: async (params) => {
        let token = pageTokensRef.current.nextToken;

        let data = await deliveryApi.getDeliveriesByCustomer(
          formik.values.customer,
          token && token
        );
        setPageTokens((previousPageToken) => {
          return {
            noOfRows: previousPageToken.noOfRows + data.deliveries.length,
            nextToken: data.nextOrderToken,
          };
        });
        let lastRow = -1;
        if (data.deliveries.length < params.endRow - params.startRow) {
          lastRow = pageTokensRef.current.noOfRows + data.deliveries.length;
        }

        params.successCallback(data.deliveries, lastRow);
      },
    };
    params.api.setDatasource(dataSource);
    setGridApi(params.api);
  }, []);

  if (gridApi) {
    gridApi.forEachNode(function (node) {
      if (node.data) {
        node.setSelected(
          Boolean(formik.values.deliveries.find((e) => e.id === node.data.id))
        );
      }
    });
  }

  return (
    <div style={{ width: "100%", height: "70%" }}>
      <div
        style={{ width: "100%", height: "100%" }}
        className="ag-theme-balham"
      >
        <AgGridReact
          columnDefs={orderTableForCreateInvoice}
          rowModelType={"infinite"}
          onGridReady={onGridReady}
          rowSelection={"multiple"}
          onSelectionChanged={(event) => {
            let o = [];
            event.api.getSelectedNodes().map((node) =>
              o.push({
                ...node.data,
                extraCharges: formik.values.deliveries.find(
                  (del) => del.id === node.data.id
                )
                  ? formik.values.deliveries.find(
                      (del) => del.id === node.data.id
                    ).extraCharges
                    ? formik.values.deliveries.find(
                        (del) => del.id === node.data.id
                      ).extraCharges
                    : []
                  : [],
                particular: formik.values.deliveries.find(
                  (del) => del.id === node.data.id
                )
                  ? formik.values.deliveries.find(
                      (del) => del.id === node.data.id
                    ).particular
                    ? formik.values.deliveries.find(
                        (del) => del.id === node.data.id
                      ).particular
                    : null
                  : [],
              })
            );
            formik.setFieldValue("deliveries", o);
          }}
          onFirstDataRendered={(params) => {
            const autoSizeAll = (skipHeader) => {
              var allColumnIds = [];
              params.columnApi.getAllColumns().forEach(function (column) {
                allColumnIds.push(column.colId);
              });
              params.columnApi.autoSizeColumns(allColumnIds, skipHeader);
            };

            autoSizeAll();
          }}
        />
      </div>
    </div>
  );
};

export default OrderDetailsGrid;
