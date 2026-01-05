import { useState } from "react";
import { LuUpload } from "react-icons/lu";
import { IoMdAdd } from "react-icons/io";
import { CiCircleRemove } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import axios from "axios";
import * as Yup from "yup";
import { registerSchema } from "../../validations";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axios";

const RegisterUser = () => {
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    residentialAddress: {
      street1: "",
      street2: "",
    },
    permanentAddress: {
      street1: "",
      street2: "",
    },
    documents: [{ id: Date.now(), fileName: "", fileType: "" }],
  });

  const handleCheckboxChange = () => {
    setIsSameAddress(!isSameAddress);
    if (isSameAddress === true) {
      formData.permanentAddress = {
        street1: "",
        street2: "",
      };
    }

    // Clear permanent address errors when checkbox changes
    if (errors["permanentAddress.street1"]) {
      setErrors({
        ...errors,
        "permanentAddress.street1": "",
        "permanentAddress.street2": "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Clear error for this field when user starts typing
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleAddressChange = (e, type, field) => {
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        [field]: e.target.value,
      },
    });

    // Clear error for this address field when user starts typing
    const errorKey = `${type}.${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: "" });
    }
  };

  const handleDocumentChange = (id, field, value) => {
    // File validation when a file is selected
    if (field === "file" && value) {
      const doc = formData.documents.find((d) => d.id === id);
      if (doc && doc.fileType) {
        const fileType = value.type;
        const isValidFile =
          (doc.fileType === "image" && fileType.startsWith("image/")) ||
          (doc.fileType === "pdf" && fileType === "application/pdf");

        if (!isValidFile) {
          toast.error(`Please select a valid ${doc.fileType} file`);
          return;
        }
      }
    }

    const updatedDocs = formData.documents.map((doc) =>
      doc.id === id ? { ...doc, [field]: value } : doc,
    );
    setFormData({ ...formData, documents: updatedDocs });

    // Clear document errors when user makes changes
    const docIndex = formData.documents.findIndex((doc) => doc.id === id);
    const errorKey = `documents[${docIndex}].${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: "" });
    }
  };

  const handleAddDocument = () => {
    setFormData({
      ...formData,
      documents: [
        ...formData.documents,
        { id: Date.now(), fileName: "", fileType: "" },
      ],
    });
  };

  const handleRemoveDocument = (id) => {
    if (formData.documents.length <= 1) {
      toast.error("At least one document field is required");
      return;
    }
    setFormData({
      ...formData,
      documents: formData.documents.filter((doc) => doc.id !== id),
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Create dynamic validation schema based on checkbox state
      const dynamicSchema = registerSchema.shape({
        permanentAddress: isSameAddress
          ? Yup.object().shape({
              street1: Yup.string(),
              street2: Yup.string(),
            })
          : Yup.object().shape({
              street1: Yup.string()
                .required("Permanent address street 1 is required")
                .min(3, "Street must be at least 3 characters")
                .max(20, "Street cannot be more than 20 characters"),
              street2: Yup.string()
                .min(3, "Street must be at least 3 characters")
                .max(20, "Street cannot be more than 20 characters"),
            }),
      });

      if (isSameAddress === true) {
        formData.permanentAddress = {
          street1: formData.residentialAddress.street1,
          street2: formData.residentialAddress.street2,
        };
      }

      await dynamicSchema.validate(formData, { abortEarly: false });
      const updatedDocuments = await Promise.all(
        formData.documents.map(async (doc) => {
          const { fileType, fileName } = doc;

          if (fileType === "image" || fileType === "pdf") {
            const formDataObj = new FormData();
            formDataObj.append("file", doc.file);
            const endpoint =
              fileType === "image"
                ? "/auth/registerUserImage"
                : "/auth/registerPDF";

            const res = await axiosInstance.post(endpoint, formDataObj, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            console.log("file respose : ", res);

            return {
              id: doc.id,
              fileName,
              fileType,
              filePath: res.data.filePath,
            };
          }
          return doc;
        }),
      );

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        email: formData.email,
        residentialAddress: formData.residentialAddress,
        permanentAddress: formData.permanentAddress,
        documents: updatedDocuments,
        isSameAsResidential: isSameAddress,
      };

      const { data, status } = await axios.post(
        "http://localhost:5000/auth/register",
        payload,
      );
      console.log("response", data?.message);
      if (status == 200) {
        toast.success(data?.message);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          dob: "",
          residentialAddress: {
            street1: "",
            street2: "",
          },
          permanentAddress: {
            street1: "",
            street2: "",
          },
          documents: [{ id: Date.now(), fileName: "", fileType: "" }],
        });
      }
    } catch (err) {
      const validationErrors = {};

      // Handle validation errors
      if (err?.inner) {
        err.inner.forEach((error) => {
          validationErrors[error?.path] = error?.message;
        });
        setErrors(validationErrors);

        // Show toast for minimum documents validation
        const docErrors = err.inner.filter(
          (error) => error.path === "documents",
        );
        if (docErrors.length > 0) {
          toast.error("Minimum 2 documents are required");
        } else {
          toast.error("Please fill in all required fields");
        }
      } else {
        // Handle API errors
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.data?.error) {
          toast.error(err.response.data.error);
        } else {
          toast.error("An error occurred. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Registration Form
          </h1>
          <p className="text-gray-600">
            Please fill in all the required information
          </p>
        </div>

        <form className="bg-white shadow-xl rounded-lg p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="date"
                id="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
              />
              <small className="text-gray-500 text-xs">
                Minimum age should be 18 years
              </small>
              {errors.dob && (
                <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
              )}
            </div>
          </div>

          {/* Residential Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Residential Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="resStreet1"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street 1 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="resStreet1"
                  value={formData.residentialAddress.street1}
                  onChange={(e) =>
                    handleAddressChange(e, "residentialAddress", "street1")
                  }
                  placeholder="Enter street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
                />
                {errors["residentialAddress.street1"] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors["residentialAddress.street1"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="resStreet2"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street 2 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="resStreet2"
                  value={formData.residentialAddress.street2}
                  onChange={(e) =>
                    handleAddressChange(e, "residentialAddress", "street2")
                  }
                  placeholder="Apartment, suite, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
                />
                {errors["residentialAddress.street2"] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors["residentialAddress.street2"]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Same as Residential Address Checkbox */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="sameAddress"
              checked={isSameAddress}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded focus:outline-none"
            />
            <label
              htmlFor="sameAddress"
              className="text-sm font-medium text-gray-700"
            >
              Same as Residential Address
            </label>
          </div>

          {/* Permanent Address */}
          {!isSameAddress && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Permanent Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="permStreet1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Street 1 <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="permStreet1"
                    value={formData.permanentAddress.street1}
                    onChange={(e) =>
                      handleAddressChange(e, "permanentAddress", "street1")
                    }
                    placeholder="Enter street address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
                  />
                  {errors["permanentAddress.street1"] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors["permanentAddress.street1"]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="permStreet2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Street 2 <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="permStreet2"
                    value={formData.permanentAddress.street2}
                    onChange={(e) =>
                      handleAddressChange(e, "permanentAddress", "street2")
                    }
                    placeholder="Apartment, suite, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-200"
                  />
                  {errors["permanentAddress.street2"] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors["permanentAddress.street2"]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Upload Documents
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Minimum 2 documents are required
              </p>
            </div>

            {formData.documents.map((doc, index) => (
              <div
                key={doc.id}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* File Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`fileName-${doc.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      File Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id={`fileName-${doc.id}`}
                      value={doc.fileName}
                      onChange={(e) =>
                        handleDocumentChange(doc.id, "fileName", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-blue-500 bg-white rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-600 focus:outline-none transition duration-200 text-gray-900"
                      placeholder="Enter file name"
                    />
                    {errors[`documents[${index}].fileName`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`documents[${index}].fileName`]}
                      </p>
                    )}
                  </div>

                  {/* Type of File */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`fileType-${doc.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      File Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id={`fileType-${doc.id}`}
                      value={doc.fileType}
                      onChange={(e) =>
                        handleDocumentChange(doc.id, "fileType", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-blue-500 bg-white rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-600 focus:outline-none transition duration-200 text-gray-900 appearance-none bg-no-repeat bg-right pr-10"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="">Select type</option>
                      <option value="image">Image</option>
                      <option value="pdf">PDF</option>
                    </select>
                    <small className="text-gray-500 text-xs block mt-1">
                      Supported: Image, PDF
                    </small>
                    {errors[`documents[${index}].fileType`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`documents[${index}].fileType`]}
                      </p>
                    )}
                  </div>

                  {/* Upload Document */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`file-${doc.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Upload Document
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-${doc.id}`}
                        onChange={(e) =>
                          handleDocumentChange(
                            doc.id,
                            "file",
                            e.target.files[0],
                          )
                        }
                        className="absolute inset-0 opacity-0 z-10 cursor-pointer focus:outline-none"
                      />
                      <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition duration-200 p-3.5 rounded-lg w-full flex items-center justify-end bg-white min-h-[50px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                        <div className="pointer-events-none">
                          {doc.file ? (
                            <FaCheck className="h-5 w-5 text-gray-500" />
                          ) : (
                            <LuUpload className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    {errors[`documents[${index}].file`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`documents[${index}].file`]}
                      </p>
                    )}
                  </div>

                  {/* Add/Remove Button */}
                  <div className="flex items-end justify-center pb-6">
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={handleAddDocument}
                        className="bg-black/80 hover:bg-black/80 text-white rounded-lg transition duration-200 flex items-center justify-center w-12 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-black "
                        title="Add Document"
                      >
                        <IoMdAdd className="h-6 w-6" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 flex items-center justify-center w-12 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-red-300"
                        title="Remove Document"
                      >
                        <CiCircleRemove className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <CircularProgress size={20} />
                <span className="text-gray-600">Submitting...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-black/80 hover:from-black-700 hover:to-black-800 text-white font-semibold py-3 px-14 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
