import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { OrganisationLogoDropzone } from "./organisation-logo-dropzone";
import { useAuth } from "../../../hooks/use-auth";
import { getInitials } from "../../../utils/get-initials";

import { Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";
import { organisationApi } from "../../../api/organisation-api";
import { useDispatch } from "../../../store";

import S3 from "react-aws-s3";

const config = {
  bucketName: "truckarprod",
  dirName: "media/logos" /* optional */,
  region: "ap-south-1",
  accessKeyId: "AKIAZRZV5R3N7OYQNHHA",
  secretAccessKey: "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",
};

const ReactS3Client = new S3(config);

export const OrganisationCreateForm = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [croppedImage, setCroppedImage] = useState();
  const [file, setFile] = useState();
  const { user, account } = useAuth();
  const formik = useFormik({
    initialValues: {
      name: "",
      initials: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      pincode: "",
      gstin: "",
      pan: "",
      invoiceTermsAndConditions: "",
      lrTermsAndConditions: "",
      logo: "",
      bankName: "",
      bankAccountNumber: "",
      bankBranchName: "",
      bankIFSC: "",
      contact: "",
      account: account._id,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
      // initials: Yup.string()
      //   .max(255)
      //   .required("Required")
      //   .test(
      //     "Unique Name",
      //     "Initials already taken", // <- key, message
      //     async function (value) {
      //       try {
      //         const response = await organisationApi.validateDuplicateInitials(
      //           value,
      //           user
      //         );
      //         return response;
      //       } catch (error) {}
      //     }
      //   ),
      addressLine1: Yup.string()
        .max(255)
        .required("Address Line 1 is required"),
      city: Yup.string().max(255).required("City is required"),
      pincode: Yup.string().max(255).required("Pincode is required"),
      pan: Yup.string().max(255).required("PAN is required"),
    }),

    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        const id = uuid();
        values.id = id;
        values.user = user.id;

        let logoBase64;
        let logo;
        if (values.logo) {
          logoBase64 = await fetch(values.logo);
          logo = await logoBase64.blob();
          values.logo = null;
          // await Storage.put(filename, logo);
        }

        const response = await organisationApi.createOrganisation(
          values,
          dispatch
        );

        ReactS3Client.uploadFile(logo, `${response.data._id}/logo`)
          .then(async (data) => {
            console.log(data);
            let updatedOrganisation = await organisationApi.updateOrganisation(
              { _id: response.data._id, logo: data },
              dispatch
            );
            console.log(updatedOrganisation);
          })
          .catch((err) => console.error(err));

        toast.success("Organisation created!");
        router.push("/dashboard/organisations");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const handleDrop = (newFile) => {
    newFile.length > 0 &&
      setFile(
        Object.assign(newFile[0], {
          preview: URL.createObjectURL(newFile[0]),
        })
      );
  };

  const handleRemove = (file) => {
    setFile();
    setCroppedImage("");
  };

  const handleSaveCroppedImage = (cropper) => {
    setCroppedImage(cropper.getCroppedCanvas().toDataURL());
    formik.setFieldValue(`logo`, cropper.getCroppedCanvas().toDataURL());
  };

  return (
    <form onSubmit={formik.handleSubmit} {...props}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Business details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={10} xs={12}>
                  <TextField
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    fullWidth
                    helperText={formik.touched.name && formik.errors.name}
                    label="Business Name"
                    name="name"
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      formik.setFieldValue(
                        `initials`,
                        `${getInitials(event.target.value)}`
                      );
                      formik.setFieldValue(`name`, event.target.value);
                    }}
                    value={formik.values.name}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.initials && formik.errors.initials
                    )}
                    fullWidth
                    helperText={
                      formik.touched.initials && formik.errors.initials
                    }
                    label="Initials"
                    name="initials"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.initials}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.addressLine1 && formik.errors.addressLine1
                    )}
                    fullWidth
                    helperText={
                      formik.touched.addressLine1 && formik.errors.addressLine1
                    }
                    label="Address Line 1"
                    name="addressLine1"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.addressLine1}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.addressLine2 && formik.errors.addressLine2
                    )}
                    fullWidth
                    helperText={
                      formik.touched.addressLine2 && formik.errors.addressLine2
                    }
                    label="Address Line 2"
                    name="addressLine2"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.addressLine2}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(formik.touched.city && formik.errors.city)}
                    fullWidth
                    helperText={formik.touched.city && formik.errors.city}
                    label="City (Jurisdication)"
                    name="city"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.city}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.pincode && formik.errors.pincode
                    )}
                    fullWidth
                    helperText={formik.touched.pincode && formik.errors.pincode}
                    label="Pincode"
                    name="pincode"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.pincode}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Bank details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.bankName && formik.errors.bankName
                    )}
                    fullWidth
                    helperText={
                      formik.touched.bankName && formik.errors.bankName
                    }
                    label="Bank name"
                    name="bankName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.bankName}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.bankAccountNumber &&
                        formik.errors.bankAccountNumber
                    )}
                    fullWidth
                    helperText={
                      formik.touched.bankAccountNumber &&
                      formik.errors.bankAccountNumber
                    }
                    label="Bank Account Number"
                    name="bankAccountNumber"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.bankAccountNumber}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.bankBranchName &&
                        formik.errors.bankBranchName
                    )}
                    fullWidth
                    helperText={
                      formik.touched.bankBranchName &&
                      formik.errors.bankBranchName
                    }
                    label="Bank Branch Name"
                    name="bankBranchName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.bankBranchName}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.bankIFSC && formik.errors.bankIFSC
                    )}
                    fullWidth
                    helperText={
                      formik.touched.bankIFSC && formik.errors.bankIFSC
                    }
                    label="Bank IFS Code"
                    name="bankIFSC"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.bankIFSC}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Billing details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.contact && formik.errors.contact
                    )}
                    fullWidth
                    helperText={formik.touched.contact && formik.errors.contact}
                    label="Contact"
                    name="contact"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.contact}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(formik.touched.email && formik.errors.email)}
                    fullWidth
                    helperText={formik.touched.email && formik.errors.email}
                    label="Email"
                    name="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(formik.touched.gstin && formik.errors.gstin)}
                    fullWidth
                    helperText={formik.touched.gstin && formik.errors.gstin}
                    label="GSTIN"
                    name="gstin"
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      formik.setFieldValue(`gstin`, `${event.target.value}`);
                      formik.setFieldValue(
                        `pan`,
                        `${event.target.value.substr(2, 11)}`
                      );
                    }}
                    value={formik.values.gstin}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(formik.touched.pan && formik.errors.pan)}
                    fullWidth
                    helperText={formik.touched.pan && formik.errors.pan}
                    label="PAN"
                    name="pan"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.pan}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    multiline
                    error={Boolean(
                      formik.touched.lrTermsAndConditions &&
                        formik.errors.lrTermsAndConditions
                    )}
                    fullWidth
                    helperText={
                      formik.touched.lrTermsAndConditions &&
                      formik.errors.lrTermsAndConditions
                    }
                    label="LR Terms and Conditions"
                    name="lrTermsAndConditions"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.lrTermsAndConditions}
                    variant="outlined"
                    rows={6}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    multiline
                    error={Boolean(
                      formik.touched.invoiceTermsAndConditions &&
                        formik.errors.invoiceTermsAndConditions
                    )}
                    fullWidth
                    helperText={
                      formik.touched.invoiceTermsAndConditions &&
                      formik.errors.invoiceTermsAndConditions
                    }
                    label="Bill Terms and Conditions"
                    name="invoiceTermsAndConditions"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.invoiceTermsAndConditions}
                    variant="outlined"
                    rows={6}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Business Logo</Typography>
              <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
                Logo will appear on your LR, Bill and other documents.
              </Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <OrganisationLogoDropzone
                accept="image/*"
                file={file}
                croppedImage={croppedImage}
                onDrop={handleDrop}
                onRemove={handleRemove}
                maxFiles={1}
                onSaveCroppedImage={handleSaveCroppedImage}
              />
              {croppedImage && (
                <img
                  style={{ width: "675px", height: "150px" }}
                  src={croppedImage}
                  alt="cropped"
                />
              )}
              {croppedImage && (
                <Box
                  sx={{
                    display: "flex",

                    mt: 2,
                  }}
                >
                  <Button onClick={handleRemove} size="small" type="button">
                    Remove Logo
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
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
};
