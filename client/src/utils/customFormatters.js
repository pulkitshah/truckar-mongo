import React from "react";
import MaskedInput, { conformToMask } from "react-text-mask";
import PropTypes from "prop-types";

export const vehicleNumberFormatter = React.forwardRef((props, inputRef) => {
  return (
    <MaskedInput
      {...props}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={function (rawValue) {
        let mask = false;
        let b = rawValue.replace(/-/g, "");
        if (b.length > 2 && b.charAt(2).match(/[A-Z]/i)) {
          mask = [
            /[a-zA-Z]/,
            /[a-zA-Z]/,
            /[a-zA-Z]/,
            "-",
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
          ];
        }
        if (
          b.length > 3 &&
          b.charAt(2).match(/[0-9]/i) &&
          b.charAt(3).match(/[A-Z]/i) &&
          b.charAt(4).match(/[0-9]/i)
        ) {
          mask = [
            /[a-zA-Z]/,
            /[a-zA-Z]/,
            "-",
            /[0-9]/,
            "-",
            /[a-zA-Z]/,
            "-",
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
          ];
        }

        if (
          b.length > 3 &&
          b.charAt(2).match(/[0-9]/i) &&
          b.charAt(3).match(/[A-Z]/i) &&
          b.charAt(4).match(/[A-Z]/i)
        ) {
          mask = [
            /[a-zA-Z]/,
            /[a-zA-Z]/,
            "-",
            /[0-9]/,
            "-",
            /[a-zA-Z]/,
            /[a-zA-Z0-9]/,
            "-",
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
          ];
        }

        if (
          b.length > 4 &&
          b.charAt(2).match(/[0-9]/i) &&
          b.charAt(3).match(/[0-9]/i) &&
          b.charAt(4).match(/[A-Z]/i) &&
          b.charAt(5).match(/[0-9]/i)
        ) {
          mask = [
            /[a-zA-Z]/,
            /[a-zA-Z]/,
            "-",
            /[0-9]/,
            /[0-9]/,
            "-",
            /[a-zA-Z]/,
            "-",
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
            /[0-9]/,
          ];
        }
        if (mask) return mask;
        return [
          /[a-zA-Z]/,
          /[a-zA-Z]/,
          "-",
          /[a-zA-Z0-9]/,
          /[a-zA-Z0-9]/,
          "-",
          /[a-zA-Z]/,
          /[a-zA-Z]/,
          "-",
          /[0-9]/,
          /[0-9]/,
          /[0-9]/,
          /[0-9]/,
        ];
      }}
      guide={false}
      //   keepCharPositions={true}
    />
  );
});

export function conformVehicleNumber(value) {
  let b = value.toUpperCase();
  let mask = [
    /[A-Z]/,
    /[A-Z]/,
    "-",
    /[0-9]/,
    /[0-9]/,
    "-",
    /[A-Z]/,
    /[A-Z]/,
    "-",
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
  ];

  if (b.length > 2 && b.charAt(2).match(/[A-Z]/i)) {
    mask = [
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      "-",
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
    ];
  }
  if (
    b.length > 3 &&
    b.charAt(2).match(/[0-9]/i) &&
    b.charAt(3).match(/[A-Z]/i) &&
    b.charAt(4).match(/[0-9]/i)
  ) {
    mask = [
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      "-",
      /[0-9]/,
      "-",
      /[a-zA-Z]/,
      "-",
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
    ];
  }

  if (
    b.length > 3 &&
    b.charAt(2).match(/[0-9]/i) &&
    b.charAt(3).match(/[A-Z]/i) &&
    b.charAt(4).match(/[A-Z]/i)
  ) {
    mask = [
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      "-",
      /[0-9]/,
      "-",
      /[a-zA-Z]/,
      /[a-zA-Z0-9]/,
      "-",
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
    ];
  }

  if (
    b.length > 4 &&
    b.charAt(2).match(/[0-9]/i) &&
    b.charAt(3).match(/[0-9]/i) &&
    b.charAt(4).match(/[A-Z]/i) &&
    b.charAt(5).match(/[0-9]/i)
  ) {
    mask = [
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      "-",
      /[0-9]/,
      /[0-9]/,
      "-",
      /[a-zA-Z]/,
      "-",
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
    ];
  }

  let a = conformToMask(b, mask, {
    guide: false,
  });
  console.log(a);
  return a;
}
