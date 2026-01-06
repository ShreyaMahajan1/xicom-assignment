import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  residentialAddress: {
    street1: {
      type: String,
      required: true,
    },
    street2: {
      type: String,
      required: true,
    },
  },
  permanentAddress: {
    street1: {
      type: String,
      required: true,
    },
    street2: {
      type: String,
      required: true,
    },
  },
  documents: [
    {
      fileName: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
      filePath: {
        type: String,
        required: true,
      },
      id: {
        type: Number,
        required: true,
      },
    },
  ],
});

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel;
