import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { organisationTable } from "../../grids/grid-columns";

const Table = ({ organisations, onOpenDrawer }) => {
  return (
    <DataGrid
      onRowClick={onOpenDrawer}
      rows={organisations}
      columns={organisationTable}
      disableSelectionOnClick
      experimentalFeatures={{ newEditingApi: true }}
    />
  );
};

export default Table;
