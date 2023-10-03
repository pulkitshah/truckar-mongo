import React, { useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

const GoogleMaps = ({ sx, addresses }) => {
  const [googleResponse, setResponse] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);

  let directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === "OK") {
        if (JSON.stringify(googleResponse) === JSON.stringify(response)) {
          return;
        } else {
          setTotalDistance(0);
          setResponse(response);

          response.routes[0].legs.map((leg) => {
            setTotalDistance(totalDistance + leg.distance.value);
          });
        }
      } else {
        console.log("response: ");
      }
    }
  };
  // console.log(totalDistance);

  return (
    <GoogleMap
      sx={sx}
      options={{ mapTypeId: "hybrid", disableDefaultUI: true }}
      mapContainerStyle={{
        width: "100%",
        height: "100%",
        minHeight: "12rem",
        maxHeight: "16rem",
      }}
      center={{
        lat: 22.309425,
        lng: 72.13623,
      }}
      zoom={5}
    >
      {addresses.origin && addresses.destination && (
        <DirectionsService
          // required
          options={{
            origin: addresses.origin,
            destination: addresses.destination,
            waypoints: addresses.waypoints,
            travelMode: "DRIVING",
            optimizeWaypoints: true,
          }}
          // required
          callback={directionsCallback}
        />
      )}

      {googleResponse && (
        <DirectionsRenderer
          // required
          options={{
            // eslint-disable-line react-perf/jsx-no-new-object-as-prop
            directions: googleResponse,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default React.memo(GoogleMaps);
