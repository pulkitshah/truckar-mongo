import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { driverTable } from "../../grids/grid-columns";

const Table = ({ drivers, onOpenDrawer }) => {
  return (
    <DataGrid
      onRowClick={onOpenDrawer}
      rows={drivers}
      columns={driverTable}
      disableSelectionOnClick
      experimentalFeatures={{ newEditingApi: true }}
    />
  );
};

export default Table;
