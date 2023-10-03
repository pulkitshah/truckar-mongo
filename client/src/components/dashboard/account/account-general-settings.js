import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "../../../utils/axios";
import { useAuth } from "../../../hooks/use-auth";
import { LanguagePopover } from "../language-popover";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { UserCircle as UserCircleIcon } from "../../../icons/user-circle";

const languages = {
  english: "English",
  hindi: "हिन्दी",
};

const LanguageButton = () => {
  const anchorRef = useRef(null);
  const { i18n } = useTranslation();
  const [openPopover, setOpenPopover] = useState(false);

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  return (
    <>
      <IconButton onClick={handleOpenPopover} ref={anchorRef} sx={{ ml: 1 }}>
        <Typography variant="button" color="primary">
          {languages[i18n.language]}
        </Typography>
      </IconButton>
      <LanguagePopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  );
};

export const AccountGeneralSettings = (props) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: user.name || "",
        marketName: user.marketName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        accountType: user.accountType || {
          vehicleOwner: false,
          trader: true,
          commissionAgent: false,
        },
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().max(255).required("Name is required"),
        marketName: Yup.string().max(255).required("Market Name is required"),
        mobile: Yup.string().max(10).required("Phone Number is required"),
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        try {
          // NOTE: Make API request
          console.log(values);
          await axios.patch("/api/auth/", values);
          await initialise();
          resetForm();
          setStatus({ success: true });
          setSubmitting(false);
          toast.success(t("User updated"));
        } catch (err) {
          console.error(err);
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        setFieldValue,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
      }) => (
        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 4 }} {...props}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <Typography variant="h6">{t("Basic Details")}</Typography>
                  </Grid>
                  <Grid item md={8} xs={12}>
                    <Box
                      sx={{
                        alignItems: "center",
                        display: "flex",
                      }}
                    >
                      <Avatar
                        src={user.avatar}
                        sx={{
                          height: 64,
                          mr: 2,
                          width: 64,
                        }}
                      >
                        <UserCircleIcon fontSize="small" />
                      </Avatar>
                      <Button>Change</Button>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        mt: 3,
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        error={Boolean(touched.name && errors.name)}
                        fullWidth
                        helperText={touched.name && errors.name}
                        label={t("Full Name")}
                        name="name"
                        size="small"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        required
                        value={values.name}
                        sx={{
                          flexGrow: 1,
                          mr: 3,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        mt: 3,
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        error={Boolean(touched.marketName && errors.marketName)}
                        fullWidth
                        helperText={touched.marketName && errors.marketName}
                        label={t("Market Name")}
                        name="marketName"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        required
                        value={values.marketName}
                        size="small"
                        sx={{
                          flexGrow: 1,
                          mr: 3,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        mt: 3,
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        error={Boolean(touched.email && errors.email)}
                        fullWidth
                        helperText={
                          touched.email && errors.email
                            ? errors.email
                            : "We will use this email to contact you"
                        }
                        label={t("Email Address")}
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        required
                        type="email"
                        value={values.email}
                        size="small"
                        sx={{
                          flexGrow: 1,
                          mr: 3,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        mt: 3,
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        error={Boolean(touched.mobile && errors.mobile)}
                        fullWidth
                        helperText={
                          touched.mobile && errors.mobile
                            ? errors.mobile
                            : "We will use this connect with you on call and Whatsapp"
                        }
                        label={t("Mobile Number")}
                        name="mobile"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        required
                        value={values.mobile}
                        size="small"
                        sx={{
                          flexGrow: 1,
                          mr: 3,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        mt: 3,
                        alignItems: "center",
                      }}
                    >
                      {/* {user.id.toString() === user.createdBy.toString() && (
                        <Grid item xs={12}>
                          <Typography
                            gutterBottom
                            variant="h6"
                            color="textPrimary"
                          >
                            Account Type
                          </Typography>
                          <FormGroup>
                            <FormControlLabel
                              checked={values.accountType.vehicleOwner}
                              onChange={() =>
                                setFieldValue(
                                  "accountType.vehicleOwner",
                                  !values.accountType.vehicleOwner
                                )
                              }
                              control={<Checkbox />}
                              label="Vehicle Owner"
                            />
                            <FormControlLabel
                              checked={values.accountType.trader}
                              onChange={() =>
                                setFieldValue(
                                  "accountType.trader",
                                  !values.accountType.trader
                                )
                              }
                              control={<Checkbox />}
                              label="Trader"
                            />
                            <FormControlLabel
                              checked={values.accountType.commissionAgent}
                              onChange={() =>
                                setFieldValue(
                                  "accountType.commissionAgent",
                                  !values.accountType.commissionAgent
                                )
                              }
                              control={<Checkbox />}
                              label="Commission Agent"
                            />
                          </FormGroup>
                        </Grid>
                      )} */}
                    </Box>
                    <Box p={2} display="flex" justifyContent="flex-end">
                      <Button
                        color="secondary"
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <Typography variant="h6">Other Settings</Typography>
                  </Grid>
                  <Grid item md={8} sm={12} xs={12}>
                    <Box
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 3,
                      }}
                    >
                      <div>
                        <Typography variant="subtitle1">
                          {t("Select your preferred language")}
                        </Typography>
                      </div>
                      <LanguageButton />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </form>
      )}
    </Formik>
  );
};
