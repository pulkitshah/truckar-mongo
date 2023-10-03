import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { invoiceTable } from "../../grids/grid-columns";

const Table = ({ invoices, onOpenDrawer }) => {
  return (
    <DataGrid
      onRowClick={onOpenDrawer}
      rows={invoices}
      columns={invoiceTable}
      disableSelectionOnClick
      experimentalFeatures={{ newEditingApi: true }}
    />
  );
};

export default Table;
