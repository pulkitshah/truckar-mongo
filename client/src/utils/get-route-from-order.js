export const getRouteFromOrder = (deliveries) => {
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

  waypoints = [...new Map(waypoints.map((item) => [item, item])).values()];

  return [route[0], ...waypoints, route[-1]].join("-");
};
