import { forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { v4 as uuid } from "uuid";
import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import GoogleMaps from "../branch/google-places-autocomplete";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import { branchApi } from "../../../api/branch-api";
import { userApi } from "../../../api/user-api";

export const BranchCreateForm = forwardRef(({ handleNext, ...props }, ref) => {
  const { user, initialize } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

  useImperativeHandle(ref, () => ({
    handleFormSubmit() {
      formik.handleSubmit();
    },
  }));

  const formik = useFormik({
    initialValues: {
      branchName: "",
      city: "",
      branchType: "main",
      submit: null,
    },
    validationSchema: Yup.object({
      branchName: Yup.string().max(255).required("Please enter a branch name."),
      city: Yup.object().required("Please select a city."),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const id = uuid();
        const newBranch = {
          id: id,
          branchName: values.branchName,
          city: JSON.stringify(values.city),
          branchType: values.branchType,
          user: user.id,
        };
        await branchApi.createBranch(newBranch, dispatch);
        await userApi.updateUser({
          onBoardingRequired: false,
          id: user.id,
          _version: user._version,
        });

        await initialize();
        toast.success("Branch created!");
        router.push("/dashboard/branches");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} {...props}>
      <Grid container spacing={5} alignItems="center" sx={{ mb: 4, mt: 2 }}>
        <Grid item md={4} xs={12}>
          <Typography variant="h6">Tell us your city</Typography>
        </Grid>
        <Grid item md={8} xs={12}>
          <GoogleMaps
            formik={formik}
            error={Boolean(formik.touched.city && formik.errors.city)}
            label={"Your city in India"}
            field={"city"}
            setFieldValue={formik.setFieldValue}
            handleBlur={formik.handleBlur}
            values={formik.values}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item md={4} xs={12}>
          <Typography variant="h6">Please pick a branch name</Typography>
        </Grid>
        <Grid item md={8} xs={12}>
          <TextField
            error={Boolean(
              formik.touched.branchName && formik.errors.branchName
            )}
            fullWidth
            helperText={formik.touched.branchName && formik.errors.branchName}
            label="Your branch name"
            name="branchName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.branchName}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "right",
          mx: -1,
          mb: -1,
          mt: 3,
        }}
      >
        <Button sx={{ m: 1 }} variant="outlined">
          Cancel
        </Button>
        <Button sx={{ m: 1 }} type="submit" variant="contained">
          Create
        </Button>
      </Box>
    </form>
  );
});
