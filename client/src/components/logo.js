import Image from "next/image";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

export const Logo = styled((props) => {
  const { variant, ...other } = props;

  const color = variant === "light" ? "#C1C4D6" : "#5048E5";

  return <Image src="/logo.png" width={150} height={50} alt="Logo" />;
})``;

Logo.defaultProps = {
  variant: "primary",
};

Logo.propTypes = {
  variant: PropTypes.oneOf(["light", "primary"]),
};
