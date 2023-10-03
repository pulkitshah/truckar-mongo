import React, { useCallback, useRef, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import { useAuth } from "../../../hooks/use-auth";
import { lrApi } from "../../../api/lr-api";
import { lrTable } from "../../grids/grid-columns";

const LrsByOrganisationTable = ({ onOpenDrawer, organisationId }) => {
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
  }, [pageTokens, noOfRows, organisationId]);

  const onGridReady = useCallback(
    (params) => {
      const dataSource = {
        rowCount: undefined,
        getRows: async (params) => {
          let currentPageToken = pageTokensRef.current.find(
            (pageToken) => pageToken.startRow === params.startRow
          );

          let data = await lrApi.getLrsByOrganisation(
            organisationId,
            currentPageToken && currentPageToken.nextToken
          );

          setPageTokens((previousPageTokens) => {
            let currentPageToken = previousPageTokens.find(
              (pageToken) => pageToken.startRow === params.endRow
            );

            if (currentPageToken) {
              return previousPageTokens;
            } else {
              setNoOfRows(noOfRowsRef.current + data.lrs.length);
              noOfRowsRef.current = noOfRowsRef.current + data.lrs.length;
              pageTokensRef.current = [
                ...previousPageTokens,
                {
                  startRow: params.endRow,
                  endRow: params.endRow + 100,
                  nextToken: data.nextLrToken,
                },
              ];
              return [
                ...previousPageTokens,
                {
                  startRow: params.endRow,
                  endRow: params.endRow + 100,
                  nextToken: data.nextLrToken,
                },
              ];
            }
          });
          let lastRow = -1;
          if (data.lrs.length < params.endRow - params.startRow) {
            lastRow = noOfRowsRef.current;
          }

          params.successCallback(data.lrs, lastRow);
        },
      };
      params.api.setDatasource(dataSource);
      setGridApi(params.api);
    },
    [organisationId]
  );
  if (noOfRowsRef.current === 0) {
    return "...Loading";
  }
  return (
    <div key={organisationId} style={{ width: "100%", height: "100%" }}>
      <div
        style={{ width: "100%", height: "100%" }}
        className="ag-theme-balham"
      >
        <AgGridReact
          columnDefs={lrTable}
          rowModelType={"infinite"}
          onGridReady={onGridReady}
          rowSelection="multiple"
          onSelectionChanged={(event) => {
            event.api
              .getSelectedNodes()
              .map((node) => onOpenDrawer(node.data, gridApi));
          }}
          infiniteInitialRowCount={150}
        />
      </div>
    </div>
  );
};

export default LrsByOrganisationTable;
