import UserModel from "../models/userModel.js";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const storagePDF = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/pdf");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const storageImg = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("thise is not PDF, please upload PDF!"), false);
  }
};

const imgFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isImage = allowedTypes.test(file.mimetype) && allowedTypes.test(file.originalname.split('.').pop());
  
  if (isImage) {
    cb(null, true);
  } else {
    cb(new Error("this is not image, plase upload image!"), false);
  }
};

const uploadPDF = multer({
  storage: storagePDF,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadImg = multer({
  storage: storageImg,
  fileFilter: imgFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const registerUserPDF = async (req, res) => {
  try {
    uploadPDF.single("file")(req, res, (err) => {
      if (err) {
        return res.status(500).send({
          message: "Error uploading file",
          error: err.message || "Unknown error occurred",
        });
      }
      const filePath = `/public/pdf/${req.file.filename}`;
      return res.status(200).send({
        message: "PDF file uploaded successfully",
        filePath: filePath,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const registerUserImage = async (req, res) => {
  try {
    uploadImg.single("file")(req, res, (err) => {
      if (err) {
        return res.status(500).send({
          message: "Error uploading file",
          error: err.message || "Unknown error occurred",
        });
      }
      const filePath = `/public/images/${req.file.filename}`;
      return res.status(200).send({
        message: "Image uploaded successfully",
        filePath: filePath,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      email,
      residentialAddress,
      permanentAddress,
      isSameAsResidential,
      documents,
    } = req.body;

    if (isSameAsResidential === false) {
      if (!permanentAddress.street1 || !permanentAddress.street2) {
        return res.status(400).json({
          message: "Please provide all required data of permanent address",
        });
      }
    }

    if (
      !firstName ||
      !lastName ||
      !dob ||
      !email ||
      !residentialAddress.street1 ||
      !documents ||
      documents.length < 2
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields. Minimum 2 documents are required." });
    }

    const existUser = await UserModel.findOne({ email });
    
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new UserModel({
      firstName,
      lastName,
      dob,
      email,
      residentialAddress,
      permanentAddress,
      documents: documents.map((doc, index) => ({
        filePath: doc.filePath,
        fileName: doc.fileName,
        fileType: doc.fileType,
        id : doc.id,
      })),
    });
    await newUser.save();
    return res.status(200).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
