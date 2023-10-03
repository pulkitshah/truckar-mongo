export const getRouteFromOrder = (deliveries) => {
  let route = [];
  let waypoints = [];

  deliveries.map((delivery, index) => {
    if (index === 0)
      route[0] = JSON.parse(delivery.loading).structured_formatting.main_text;
    if (index === deliveries.length - 1)
      route[-1] = JSON.parse(
        delivery.unloading
      ).structured_formatting.main_text;
    waypoints.push(
      JSON.parse(delivery.loading).structured_formatting.main_text
    );
    waypoints.push(
      JSON.parse(delivery.unloading).structured_formatting.main_text
    );
  });

  waypoints = waypoints.filter(
    (waypoint) =>
      waypoint !==
      JSON.parse(deliveries[0].loading).structured_formatting.main_text
  );
  waypoints = waypoints.filter(
    (waypoint) =>
      waypoint !==
      JSON.parse(deliveries[deliveries.length - 1].unloading)
        .structured_formatting.main_text
  );

  waypoints = [...new Map(waypoints.map((item) => [item, item])).values()];

  return [route[0], ...waypoints, route[-1]].join("-");
};
