import moment from "moment";

export const getFiscalYearTimestamps = (date) => {
  const startMonthName = "April";
  const endMonthName = "March";
  if (moment(date).quarter() == 1) {
    return {
      current: {
        start: moment(date)
          .subtract(1, "year")
          .month(startMonthName)
          .startOf("month"),
        end: moment(date).month(endMonthName).endOf("month"),
      },
      last: {
        start: moment(date)
          .subtract(2, "year")
          .month(startMonthName)
          .startOf("month"),
        end: moment(date)
          .subtract(1, "year")
          .month(endMonthName)
          .endOf("month"),
      },
    };
  } else {
    return {
      current: {
        start: moment(date).month(startMonthName).startOf("month"),
        end: moment(date).add(1, "year").month(endMonthName).endOf("month"),
      },
      last: {
        start: moment(date)
          .subtract(1, "year")
          .month(startMonthName)
          .startOf("month"),
        end: moment(date).month(endMonthName).endOf("month"),
      },
    };
  }
};
