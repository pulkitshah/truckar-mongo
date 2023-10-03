import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Typography,
} from "@mui/material";

const languageOptions = {
  english: {
    icon: "/static/icons/uk_flag.svg",
    label: "English",
  },
  hindi: {
    icon: "/static/icons/es_flag.svg",
    label: "हिन्दी",
  },
};

export const LanguagePopover = (props) => {
  const { anchorEl, onClose, open, ...other } = props;
  const { i18n, t } = useTranslation();

  const handleChange = (language) => {
    onClose?.();
    i18n.changeLanguage(language);
    toast.success(t("Language changed"));
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "center",
        vertical: "bottom",
      }}
      keepMounted
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 240 } }}
      transitionDuration={0}
      {...other}
    >
      {Object.keys(languageOptions).map((language) => (
        <MenuItem onClick={() => handleChange(language)} key={language}>
          <ListItemIcon>
            

              {/* <img
                alt={languageOptions[language].label}
                src={languageOptions[language].icon}
              /> */}

          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="subtitle2">
                {languageOptions[language].label}
              </Typography>
            }
          />
        </MenuItem>
      ))}
    </Popover>
  );
};

LanguagePopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
