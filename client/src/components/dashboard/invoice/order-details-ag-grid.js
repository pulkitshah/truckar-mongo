import React, { useCallback, useRef, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";

import { orderTableForCreateInvoice } from "../../grids/grid-columns";
import { deliveryApi } from "../../../api/delivery-api";
import { useAuth } from "../../../hooks/use-auth";

const OrderDetailsGrid = ({ formik }) => {
  const gridRef = useRef();
  const { account } = useAuth();
  const dataRef = useRef(formik.values.deliveries);
  const dataSource = {
    getRows: async (params) => {
      let filter = params.request.filterModel;
      const sort = params.request.sortModel;

      filter.customer = {
        filterType: "set",
        values: [formik.values.customer._id],
      };

      let { data, count = 0 } = await deliveryApi.getDeliveriesByCustomer(
        JSON.stringify({
          account: account._id,
          customer: formik.values.customer._id,
          startRow: params.request.startRow || 0,
          endRow: params.request.endRow || 100,
          filter,
        })
      );
      console.log(data);
      if (data) {
        dataRef.current = [...dataRef.current, ...data];
        // supply rows for requested block to grid
        params.success({
          rowData: data,
          rowCount: count,
        });
      } else {
        params.fail();
      }

      // params.successCallback(data, count);
    },
  };

  const onGridReady = useCallback((params) => {
    params.api.setServerSideDatasource(dataSource);
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    gridRef.current.api.setServerSideSelectionState({
      selectAll: false,
      toggledNodes: formik.values.deliveries.map((e) => {
        return e.delivery._id;
      }),
    });
  }, []);
  console.log("order-grid");
  console.log(formik.values);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{ width: "100%", height: "100%" }}
        className="ag-theme-balham"
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={orderTableForCreateInvoice}
          getRowId={(params) => params.data.delivery._id}
          rowModelType={"serverSide"}
          onGridReady={onGridReady}
          rowSelection={"multiple"}
          onSelectionChanged={(event) => {
            let o = [];
            gridRef.current.api
              .getServerSideSelectionState()
              .toggledNodes.map((node) => {
                if (
                  formik.values.deliveries.find(
                    (del) => del.delivery._id === node
                  )
                ) {
                  o.push(
                    formik.values.deliveries.find(
                      (del) => del.delivery._id === node
                    )
                  );
                } else {
                  o.push(
                    dataRef.current.find((del) => del.delivery._id === node)
                  );
                }
              });
            formik.setFieldValue("deliveries", o);
          }}
          onFirstDataRendered={onFirstDataRendered}
        />
      </div>
    </div>
  );
};

export default OrderDetailsGrid;
