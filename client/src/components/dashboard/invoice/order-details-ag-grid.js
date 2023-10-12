import React, { useCallback, useRef, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import { orderTableForCreateInvoice } from "../../grids/grid-columns";
import { deliveryApi } from "../../../api/delivery-api";
import { useAuth } from "../../../hooks/use-auth";

const OrderDetailsGrid = ({ formik }) => {
  const { account } = useAuth();
  const [gridApi, setGridApi] = useState(null);
  const dataSource = {
    rowCount: undefined,
    getRows: async (params) => {
      let filter = params.filterModel;
      const sort = params.sortModel;

      filter.customer = {
        filterType: "set",
        values: [formik.values.customer._id],
      };
      let { data, count = 0 } = await deliveryApi.getDeliveriesByCustomer(
        JSON.stringify({
          account: account._id,
          customer: formik.values.customer._id,
          startRow: params.startRow,
          endRow: params.endRow,
          filter,
        })
      );
      console.log(data);

      params.successCallback(data, count);
    },
  };

  const onGridReady = useCallback((params) => {
    params.api.setDatasource(dataSource);
    setGridApi(params.api);
  }, []);

  if (gridApi) {
    gridApi.forEachNode(function (node) {
      if (node.data) {
        node.setSelected(
          Boolean(formik.values.deliveries.find((e) => e._id === node.data._id))
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
                  (del) => del._id === node.data._id
                )
                  ? formik.values.deliveries.find(
                      (del) => del._id === node.data._id
                    ).extraCharges
                    ? formik.values.deliveries.find(
                        (del) => del._id === node.data._id
                      ).extraCharges
                    : []
                  : [],
                particular: formik.values.deliveries.find(
                  (del) => del._id === node.data._id
                )
                  ? formik.values.deliveries.find(
                      (del) => del._id === node.data._id
                    ).particular
                    ? formik.values.deliveries.find(
                        (del) => del._id === node.data._id
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
