import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { partyTable } from "../../grids/grid-columns";

const Table = ({ parties, onOpenDrawer }) => {
  return (
    <DataGrid
      onRowClick={onOpenDrawer}
      rows={parties}
      columns={partyTable}
      disableSelectionOnClick
      experimentalFeatures={{ newEditingApi: true }}
    />
  );
};

export default Table;
