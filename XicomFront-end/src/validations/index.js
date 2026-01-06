import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .min(3, "First name must be at least 3 characters")
    .max(20, "First name cannot be more than 20 characters"),
  lastName: Yup.string()
    .required("Last name is required")
    .min(3, "Last name must be at least 3 characters")
    .max(20, "Last name cannot be more than 20 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  dob: Yup.string()
    .required("Date of birth is required")
    .test(
      "is-valid-date",
      "Please enter a valid date",
      function (value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    )
    .test(
      "is-18-years-old",
      "You must be at least 18 years old",
      function (value) {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        if (isNaN(birthDate.getTime())) return false;
        
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age > 18;
        }
        return age >= 18;
      }
    ),

  residentialAddress: Yup.object().shape({
    street1: Yup.string()
      .required("Residential address street 1 is required")
      .min(3, "Street must be at least 2 characters")
      .max(20, "Street cannot be more than 20 characters"),
    street2: Yup.string()
      .min(3, "Street must be at least 3 characters")
      .max(20, "Street cannot be more than 20 characters"),
  }),
  permanentAddress: Yup.object().shape({
    street1: Yup.string()
      .required("Permanent address street 1 is required")
      .min(3, "Street must be at least 3 characters")
      .max(20, "Street cannot be more than 20 characters"),
    street2: Yup.string()
      .min(3, "Street must be at least 3 characters")
      .max(20, "Street cannot be more than 20 characters"),
  }),
  documents: Yup.array()
    .min(2, "Minimum 2 documents are required")
    .of(
      Yup.object().shape({
        fileName: Yup.string()
          .required("File name is required")
          .min(3, "File name must be at least 3 characters")
          .max(20, "File name cannot be more than 20 characters"),
        fileType: Yup.string()
          .required("File type is required"),
        file: Yup.mixed()
          .required("File is required"),
      })
    ),
});