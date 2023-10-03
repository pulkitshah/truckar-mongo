import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { vehicleTable } from "../../grids/grid-columns";

const Table = ({ vehicles, onOpenDrawer }) => {
  return (
    <DataGrid
      onRowClick={onOpenDrawer}
      rows={vehicles}
      columns={vehicleTable}
      disableSelectionOnClick
      experimentalFeatures={{ newEditingApi: true }}
    />
  );
};

export default Table;
