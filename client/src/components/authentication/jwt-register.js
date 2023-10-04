import { useRouter } from "next/router";
import * as Yup from "yup";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Checkbox,
  FormHelperText,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { useAuth } from "../../hooks/use-auth";
import { useMounted } from "../../hooks/use-mounted";

export const JWTRegister = (props) => {
  const isMounted = useMounted();
  const router = useRouter();
  const { register } = useAuth();
  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      password: "",
      policy: false,
      submit: null,
    },
    validationSchema: Yup.object({
      mobile: Yup.number()
        .integer()
        .max(9999999999, "Mobile Number is not valid")
        .min(6000000000, "Mobile Number is not valid")
        .required("Mobile is required"),
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      name: Yup.string().max(255).required("Name is required"),
      password: Yup.string().min(7).max(255).required("Password is required"),
      policy: Yup.boolean().oneOf([true], "This field must be checked"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        let response = await register(
          values.mobile,
          values.email,
          values.name,
          values.password
        );

        console.log(response);

        if (response.status === 200) {
          if (isMounted()) {
            const returnUrl = router.query.returnUrl || "/dashboard";
            router.push(returnUrl);
          }
        } else {
          console.error(response.error);
          toast.error(response.error);
          helpers.setErrors({ submit: response.error });
        }
      } catch (err) {
        console.error(err);
        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  return (
    <form noValidate onSubmit={formik.handleSubmit} {...props}>
      <TextField
        error={Boolean(formik.touched.name && formik.errors.name)}
        fullWidth
        helperText={formik.touched.name && formik.errors.name}
        label="Name"
        margin="normal"
        name="name"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.name}
      />
      <TextField
        error={Boolean(formik.touched.mobile && formik.errors.mobile)}
        fullWidth
        helperText={formik.touched.mobile && formik.errors.mobile}
        label="Mobile"
        margin="normal"
        name="mobile"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.mobile}
      />
      <TextField
        error={Boolean(formik.touched.email && formik.errors.email)}
        fullWidth
        helperText={formik.touched.email && formik.errors.email}
        label="Email Address"
        margin="normal"
        name="email"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="email"
        value={formik.values.email}
      />
      <TextField
        error={Boolean(formik.touched.password && formik.errors.password)}
        fullWidth
        helperText={formik.touched.password && formik.errors.password}
        label="Password"
        margin="normal"
        name="password"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="password"
        value={formik.values.password}
      />
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          ml: -1,
          mt: 2,
        }}
      >
        <Checkbox
          checked={formik.values.policy}
          name="policy"
          onChange={formik.handleChange}
        />
        <Typography color="textSecondary" variant="body2">
          I have read the{" "}
          <Link component="a" href="#">
            Terms and Conditions
          </Link>
        </Typography>
      </Box>
      {Boolean(formik.touched.policy && formik.errors.policy) && (
        <FormHelperText error>{formik.errors.policy}</FormHelperText>
      )}
      {formik.errors.submit && (
        <Box sx={{ mt: 3 }}>
          <FormHelperText error>{formik.errors.submit}</FormHelperText>
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        <Button
          disabled={formik.isSubmitting}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
        >
          Register
        </Button>
      </Box>
    </form>
  );
};
