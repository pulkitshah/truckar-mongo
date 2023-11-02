import { Avatar, Link } from "@mui/material";
import moment from "moment";
import { PartyFilter } from "./ag-grid-filters";
import {
  calculateAmountForOrder,
  dataFormatter,
} from "../../utils/amount-calculation";
import { partyApi } from "../../api/party-api";
import { organisationApi } from "../../api/organisation-api";
import { vehicleApi } from "../../api/vehicle-api";
import { getOrderUnit } from "../dashboard/order/order-drawer";

const getPartiesByAccount = async (params, account) => {
  const { data } = await partyApi.getPartiesByAccount({ account });
  params.success(data.map((d) => JSON.stringify(d)));
};

const getOrganisationsByAccount = async (params, account) => {
  const { data } = await organisationApi.getOrganisationsByAccount(
    null,
    account
  );
  params.success(data.map((d) => JSON.stringify(d)));
};

const getVehiclesByAccount = async (params, account) => {
  const { data } = await vehicleApi.getVehiclesByAccount(account);
  params.success(data.map((d) => JSON.stringify(d)));
};

export const organisationTable = [
  {
    field: "initials",
    headerName: "🏢",
    headerAlign: "center",
    width: 60,
    editable: true,
    renderCell: (params) => {
      return <Avatar>{params.value}</Avatar>;
    },
  },
  {
    field: "name",
    headerName: "Business Name",
    editable: true,
    width: 250,
  },
  {
    field: "city",
    headerName: "City",
    width: 150,
    editable: true,
  },
  {
    field: "gstin",
    headerName: "GSTIN",
    width: 180,
    editable: true,
  },
];

export const vehicleTable = [
  {
    field: "initials",
    headerName: "🚚",
    headerAlign: "center",
    sx: {
      fontSize: 50,
    },
    width: 20,
  },
  {
    field: "vehicleNumber",
    headerName: "Vehicle Number",
    width: 250,
  },
  {
    field: "make",
    headerName: "Make",
    width: 150,
  },
  {
    field: "model",
    headerName: "Model",
    width: 180,
  },
];

export const branchTable = [
  {
    field: "initials",
    headerName: "🏢",
    headerAlign: "center",
    width: 20,
  },
  {
    field: "branchName",
    headerName: "Branch Name",
    width: 250,
  },
  {
    field: "city",
    headerName: "City",
    width: 150,
    valueGetter: (params) => {
      return `${params.row.city.structured_formatting.main_text}`;
    },
  },
];

export const partyTable = [
  {
    field: "name",
    headerName: "Name",
    width: 250,
  },
  {
    field: "city",
    headerName: "City",
    width: 250,
    valueGetter: (params) => {
      if (params.row.city) {
        return `${params.row.city.description}`;
      } else {
        console.log(params.row);
      }
    },
  },
  {
    field: "mobile",
    headerName: "Mobile",
    width: 150,
  },
];

export const driverTable = [
  {
    field: "initials",
    headerName: "🏢",
    headerAlign: "center",
    width: 20,
  },
  {
    field: "name",
    headerName: "Name",
    width: 250,
  },
  {
    field: "mobile",
    headerName: "Mobile",
    width: 150,
  },
];

export const orderTable = (account) => {
  return [
    {
      field: "orderNo",
      headerName: "Order No",
      width: 100,
      filter: "agNumberColumnFilter",
      filterParams: {
        buttons: ["reset"],
        filterOptions: ["equals", "lessThan", "greaterThan"],
        debounceMs: 1000,
        maxNumConditions: 1,
      },
    },
    {
      field: "saleDate",
      headerName: "Date",
      width: 120,
      valueGetter: (params) => {
        if (params.data) {
          return moment(params.data.saleDate).format("DD-MM-YY");
        }
      },
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 150,
      filter: "agSetColumnFilter",
      filterParams: {
        values: (params) => getPartiesByAccount(params, account),
        keyCreator: (params) => {
          const v = JSON.parse(params.value);
          return v._id;
        },
        valueFormatter: (params) => {
          const v = JSON.parse(params.value);
          return `${v.name}`;
        },
      },
      valueGetter: (params) => {
        if (params.data && params.data.customer) {
          return params.data.customer.name;
        }
      },
    },
    {
      field: "route",
      headerName: "Route",
      width: 250,
      valueGetter: (params) => {
        if (params.data) {
          let deliveries = params.data.deliveries;
          let route = [];
          let waypoints = [];

          deliveries.map((delivery, index) => {
            if (index === 0)
              route[0] = delivery.loading.structured_formatting.main_text;
            if (index === deliveries.length - 1)
              route[-1] = delivery.unloading.structured_formatting.main_text;
            waypoints.push(delivery.loading.structured_formatting.main_text);
            waypoints.push(delivery.unloading.structured_formatting.main_text);
          });

          waypoints = waypoints.filter(
            (waypoint) =>
              waypoint !== deliveries[0].loading.structured_formatting.main_text
          );
          waypoints = waypoints.filter(
            (waypoint) =>
              waypoint !==
              deliveries[deliveries.length - 1].unloading.structured_formatting
                .main_text
          );

          waypoints = [
            ...new Map(waypoints.map((item) => [item, item])).values(),
          ];

          return [route[0], ...waypoints, route[-1]].join("-");
        }
      },
    },
    {
      field: "vehicleNumber",
      headerName: "Vehicle Number",
      width: 150,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["reset"],
        filterOptions: ["contains", "equals"],
        debounceMs: 1000,
        maxNumConditions: 1,
      },
    },
    {
      field: "transporter",
      headerName: "Transporter",
      width: 150,
      valueGetter: (params) => {
        if (params.data) {
          if (params.data.vehicle) {
            return params.data.vehicle.organisation.name;
          } else {
            return params.data.transporter.name;
          }
        }
      },
    },
    {
      field: "saleRate",
      headerName: "Sale Rate",
      width: 130,
      valueGetter: (params) => {
        if (params.data) {
          return `Rs. ${params.data.saleRate} / ${getOrderUnit(params.data)}`;
        } else {
          return "-";
        }
      },
    },
    {
      field: "sales",
      headerName: "Sales",
      width: 100,
      valueGetter: (params) => {
        if (params.data) {
          return calculateAmountForOrder(params.data, "sale", false);
        }
      },
      valueFormatter: (params) => {
        if (params.value) {
          return dataFormatter(params.value, "currency");
        }
      },
    },
    {
      field: "expenses",
      headerName: "Expenses",
      width: 100,
      valueGetter: (params) => {
        if (params.data) {
          return calculateAmountForOrder(params.data, "outflow", false);
        }
      },
      valueFormatter: (params) => {
        if (params.value) {
          return dataFormatter(params.value, "currency");
        }
      },
    },
    {
      field: "profit",
      headerName: "Profit",
      width: 100,
      valueGetter: (params) => {
        if (params.data) {
          return (
            calculateAmountForOrder(params.data, "sale", false) -
            calculateAmountForOrder(params.data, "outflow", false)
          );
        }
      },
      valueFormatter: (params) => {
        if (params.value) {
          return dataFormatter(params.value, "currency");
        }
      },
    },
  ];
};

export const deliveriesTable = (account) => {
  return [
    {
      field: "saleDate",
      headerName: "Sale Date",
      width: 120,
      valueGetter: (params) => {
        // console.log(params.data);
        if (params.data) {
          return moment(params.data.saleDate).format("DD-MM-YY");
        }
      },
    },
    {
      field: "lr",
      headerName: "LR",
      width: 90,
      cellRenderer: (params) => {
        console.log(params.data);
        if (params.data) {
          if (Object.keys(params.data.delivery.lr).length) {
            return (
              <Link
                color="secondary"
                href={`/dashboard/lrs/?deliveryId=${params.data.delivery._id}&orderId=${params.data._id}`}
                variant="body"
              >
                {`${params.data.delivery.lr.organisation.initials}-${params.data.delivery.lr.lrNo}`}
              </Link>
            );
          } else {
            return (
              <Link
                color="primary"
                href={`/dashboard/lrs/new?deliveryId=${params.data.delivery._id}&orderId=${params.data._id}`}
                variant="body"
              >
                Make LR
              </Link>
            );
          }
        }
      },
    },
    // {
    //   field: "salesInvoice",
    //   headerName: "Sale Bill No",
    //   width: 90,
    //   cellRenderer: (params) => {
    //     console.log(params.data);
    //     if (params.data) {
    //       if (params.data.delivery.invoices.length) {
    //         console.log(params.data.delivery.invoices);
    //         return params.data.delivery.invoices
    //           .map(
    //             (invoice) =>
    //               `${invoice.organisation.initials}-${invoice.invoiceNo}`
    //           )
    //           .join(" - ");
    //       } else {
    //         return (
    //           <Link
    //             color="primary"
    //             href={`/dashboard/sales/new?deliveryId=${params.data.delivery._id}&orderId=${params.data._id}`}
    //             variant="body"
    //           >
    //             Make Invoice
    //           </Link>
    //         );
    //       }
    //     }
    //   },
    // },
    {
      field: "orderNo",
      headerName: "Order No",
      width: 120,
      valueGetter: (params) => {
        // console.log(params.data);
        if (params.data) {
          return params.data.orderNo;
        }
      },
    },
    {
      field: "vehicleNo",
      headerName: "Vehicle No",
      width: 150,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.vehicleNumber;
        }
      },
    },
    {
      field: "transporter",
      headerName: "Transporter",
      width: 200,
      valueGetter: (params) => {
        if (params.data) {
          if (params.data.vehicle) {
            return params.data.vehicle.organisation.name;
          } else {
            return params.data.transporter.name;
          }
        }
      },
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 200,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.customer.name;
        }
      },
    },

    {
      field: "consignor",
      headerName: "Consignor",
      width: 200,
      valueGetter: (params) => {
        if (params.data) {
          if (params.data.delivery.lr) {
            if (params.data.delivery.lr.consignor) {
              return params.data.delivery.lr.consignor.name;
            } else {
              return "N/A";
            }
          }
        }
      },
    },
    {
      field: "consignee",
      headerName: "Consignee",
      width: 200,
      valueGetter: (params) => {
        if (params.data) {
          if (params.data.delivery.lr) {
            if (params.data.delivery.lr.consignee) {
              return params.data.delivery.lr.consignee.name;
            } else {
              return "N/A";
            }
          }
        }
      },
    },
    {
      field: "loading",
      headerName: "Loading",
      width: 130,
      valueGetter: (params) => {
        if (params.data) {
          console.log(params.data);
          return params.data.delivery.loading.structured_formatting.main_text;
        }
      },
    },
    {
      field: "unloading",
      headerName: "Unloading",
      width: 130,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.delivery.unloading.structured_formatting.main_text;
        }
      },
    },
    {
      field: "saleRate",
      headerName: "Sale Rate",
      width: 130,
      valueGetter: (params) => {
        if (params.data) {
          return `Rs. ${params.data.saleRate} / ${getOrderUnit(params.data)}`;
        } else {
          return "-";
        }
      },
    },
    {
      field: "billQuantity",
      headerName: "Bill Wt",
      width: 120,
      editable: true,
      valueGetter: (params) => {
        if (params.data) {
          if (params.data.delivery.billQuantity) {
            return `Rs. ${params.data.delivery.billQuantity} / ${getOrderUnit(
              params.data
            )}`;
          } else {
            return "-";
          }
        }
      },
      // valueFormatter: (params) => {
      //   if (params.value) {
      //     return `${params.value} ${params.data.saleType.unit}`;
      //   } else {
      //     return "-";
      //   }
      // },
    },
    {
      field: "unloadingQuantity",
      headerName: "Unloading Wt",
      width: 120,
      editable: true,
      valueGetter: (params) => {
        if (params.data.delivery.unloadingQuantity) {
          return `Rs. ${
            params.data.delivery.unloadingQuantity
          } / ${getOrderUnit(params.data)}`;
        } else {
          return "-";
        }
      },
      // valueFormatter: (params) => {
      //   if (params.value) {
      //     return `${params.value} ${params.data.saleType.unit}`;
      //   } else {
      //     return "-";
      //   }
      // },
    },
  ];
};

export const deliveryDetailsTableForOrderDrawer = [
  {
    field: "lr",
    headerName: "LR",
    width: 90,
    renderCell: (params) => {
      if (Object.keys(params.row.deliveries.lr).length) {
        return (
          <Link
            color="secondary"
            href={`/dashboard/lrs/?deliveryId=${params.row.deliveries._id}&orderId=${params.row._id}`}
            variant="body"
          >
            {`${params.row.deliveries.lr.organisation.initials}-${params.row.deliveries.lr.lrNo}`}
          </Link>
        );
      } else {
        return (
          <Link
            color="secondary"
            href={`/dashboard/lrs/new?deliveryId=${params.row.deliveries._id}&orderId=${params.row._id}`}
            variant="body"
          >
            Make LR
          </Link>
        );
      }
    },
  },
  {
    field: "loading",
    headerName: "Loading",
    width: 120,
    valueGetter: (params) => {
      if (params.row) {
        return params.row.deliveries.loading.structured_formatting.main_text;
      }
    },
  },
  {
    field: "unloading",
    headerName: "Unloading",
    width: 120,
    valueGetter: (params) => {
      if (params.row) {
        return params.row.deliveries.unloading.structured_formatting.main_text;
      }
    },
  },
  {
    field: "billQuantity",
    headerName: "Bill Wt",
    width: 90,
    valueFormatter: (params) => {
      if (params.api.getRow(params.id).deliveries.billQuantity) {
        return `${params.api.getRow(params.id).deliveries.billQuantity} ${
          params.api.getRow(params.id).saleType.unit
        }`;
      } else {
        return "-";
      }
    },
  },
  {
    field: "unloadingQuantity",
    headerName: "Unloading Wt",
    width: 90,
    valueFormatter: (params) => {
      if (params.api.getRow(params.id).deliveries.unloadingQuantity) {
        return `${params.api.getRow(params.id).deliveries.unloadingQuantity} ${
          params.api.getRow(params.id).saleType.unit
        }`;
      } else {
        return "-";
      }
    },
  },
];

export const lrTable = (account) => {
  return [
    {
      field: "lrDate",
      headerName: "Date",
      width: 130,
      valueGetter: (params) => {
        if (params.data !== undefined) {
          return moment(params.data.deliveries.lr.lrDate).format("DD-MM-YY");
        }
      },
    },
    {
      field: "lrNo",
      headerName: "LR No",
      width: 100,
      valueGetter: (params) => {
        if (params.data !== undefined) {
          return `${params.data.deliveries.lr.organisation.initials} - ${params.data.deliveries.lr.lrNo}`;
        }
      },
      filter: "agNumberColumnFilter",
      filterParams: {
        buttons: ["reset"],
        filterOptions: ["equals", "lessThan", "greaterThan"],
        debounceMs: 1000,
        maxNumConditions: 1,
      },
    },
    {
      field: "organisation",
      headerName: "Organisation",
      width: 80,
      valueGetter: (params) => {
        if (params.data) {
          return `${params.data.deliveries.lr.organisation.name}`;
        }
      },
      filter: "agSetColumnFilter",
      filterParams: {
        values: (params) => getOrganisationsByAccount(params, account),
        keyCreator: (params) => {
          const v = JSON.parse(params.value);
          return v._id;
        },
        valueFormatter: (params) => {
          const v = JSON.parse(params.value);
          return `${v.name}`;
        },
      },
    },
    {
      field: "orderNo",
      headerName: "Order No",
      width: 80,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.orderNo;
        }
      },
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 250,
      valueGetter: (params) => {
        if (params.data !== undefined) {
          return params.data.customer.name;
        }
      },
    },
    {
      field: "vehicleNo",
      headerName: "Vehicle Number",
      width: 150,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.vehicleNumber;
        }
      },
    },
    {
      field: "loading",
      headerName: "Loading",
      width: 130,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.deliveries.loading.structured_formatting.main_text;
        }
      },
    },
    {
      field: "unloading",
      headerName: "Unoading",
      width: 130,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.deliveries.unloading.structured_formatting
            .main_text;
        }
      },
    },
    {
      field: "consignor",
      headerName: "Consignor",
      width: 250,
      valueGetter: (params) => {
        if (params.data && params.data.deliveries.lr.consignor) {
          return params.data.deliveries.lr.consignor.name;
        }
      },
    },
    {
      field: "consignee",
      headerName: "Consignee",
      width: 250,
      valueGetter: (params) => {
        if (params.data && params.data.deliveries.lr.consignee) {
          return params.data.deliveries.lr.consignee.name;
        }
      },
    },
    {
      field: "saleBillNo",
      headerName: "Sale Bill No",
      width: 130,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.deliveries.invoiceId
            ? `${params.data.delivery.invoice.organisation.initials}-${params.data.delivery.invoice.invoiceNo}`
            : "Not Issued";
        }
      },
    },
  ];
};

export const invoiceTable = (account) => {
  return [
    {
      field: "invoiceDate",
      headerName: "Date",
      width: 130,
      cellRenderer: (params) => {
        if (params.value !== undefined) {
          return moment(params.data.invoiceDate).format("DD-MM-YY");
        }
      },
    },
    {
      field: "invoiceNo",
      headerName: "Invoice No",
      width: 120,
      cellRenderer: (params) => {
        if (params.value !== undefined) {
          return (
            <Link href={`/dashboard/invoices/${params.data._id}`} passHref>
              {`${params.data.organisation.initials}-${params.data.invoiceNo}`}
            </Link>
          );
        }
      },
      filter: "agNumberColumnFilter",
      filterParams: {
        buttons: ["reset"],
        filterOptions: ["equals", "lessThan", "greaterThan"],
        debounceMs: 1000,
        maxNumConditions: 1,
      },
    },
    {
      field: "organisation",
      headerName: "Organisation",
      width: 180,
      valueGetter: (params) => {
        if (params.data) {
          return params.data.organisation.name;
        }
      },
      filter: "agSetColumnFilter",
      filterParams: {
        values: (params) => getOrganisationsByAccount(params, account),
        keyCreator: (params) => {
          const v = JSON.parse(params.value);
          return v._id;
        },
        valueFormatter: (params) => {
          const v = JSON.parse(params.value);
          return `${v.name}`;
        },
      },
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 250,
      filter: "agSetColumnFilter",
      filterParams: {
        values: (params) => getPartiesByAccount(params, account),
        keyCreator: (params) => {
          const v = JSON.parse(params.value);
          console.log(v);
          return v._id;
        },
        valueFormatter: (params) => {
          const v = JSON.parse(params.value);
          return `${v.name} - ${v.mobile} - ${v.city.structured_formatting.main_text}`;
        },
      },
      valueGetter: (params) => {
        if (params.data && params.data.customer) {
          return params.data.customer.name;
        }
      },
    },
  ];
};

export const orderTableForCreateInvoice = [
  {
    field: "initials",
    headerName: "🚚",
    checkboxSelection: true,
    width: 60,
  },
  {
    field: "lr",
    headerName: "LR",
    width: 90,
    cellRenderer: (params) => {
      if (params.data) {
        if (Object.keys(params.data.delivery.lr).length) {
          return (
            <Link
              color="secondary"
              href={`/dashboard/lrs/?deliveryId=${params.data.delivery._id}&orderId=${params.data._id}`}
              variant="body"
            >
              {`${params.data.delivery.lr.organisation.initials}-${params.data.delivery.lr.lrNo}`}
            </Link>
          );
        } else {
          return (
            <Link
              color="primary"
              href={`/dashboard/lrs/new?deliveryId=${params.data.delivery._id}&orderId=${params.data._id}`}
              variant="body"
            >
              Make LR
            </Link>
          );
        }
      }
    },
  },
  {
    field: "orderNo",
    headerName: "Order No",
    width: 100,
    valueFormatter: (params) => {
      return params.data && params.data.orderNo;
    },
  },
  {
    field: "saleDate",
    headerName: "Sale Date",
    width: 100,
    valueFormatter: (params) => {
      return params.data && moment(params.data.saleDate).format("DD-MM-YY");
    },
  },
  {
    field: "vehicleNumber",
    headerName: "Vehicle Number",
    width: 150,
    valueGetter: (params) => {
      return params.data && params.data.vehicleNumber;
    },
  },
  {
    field: "loading",
    headerName: "Loading From",
    width: 160,
    valueGetter: (params) => {
      return (
        params.data &&
        params.data.delivery.loading.structured_formatting.main_text
      );
    },
  },
  {
    field: "loading",
    headerName: "Unloading At",
    width: 160,
    valueGetter: (params) => {
      return (
        params.data &&
        params.data.delivery.unloading.structured_formatting.main_text
      );
    },
  },
  {
    field: "billWeight",
    headerName: "Bill Weight",
    width: 120,
    editable: true,
    valueSetter: (params) => {
      return true;
    },
    valueGetter: (params) => {
      return params.data && params.data.delivery.billQuantity;
    },
    valueFormatter: (params) => {
      return params.value && `${params.value} ${params.data.saleType.unit}`;
    },
  },
  {
    field: "saleRate",
    headerName: "Sale Rate",
    width: 150,
    valueGetter: (params) => {
      return params.data && params.data.saleRate;
    },
    valueFormatter: (params) => {
      return (
        params.value && `Rs. ${params.value} / ${params.data.saleType.unit}`
      );
    },
  },
];
