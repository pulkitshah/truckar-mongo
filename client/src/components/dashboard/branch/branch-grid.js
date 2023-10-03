import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { branchTable } from "../../grids/grid-columns";

const Table = ({ branches, onOpenDrawer }) => {
  return (
    <DataGrid
      onRowClick={onOpenDrawer}
      rows={branches}
      columns={branchTable}
      disableSelectionOnClick
      experimentalFeatures={{ newEditingApi: true }}
    />
  );
};

export default Table;
