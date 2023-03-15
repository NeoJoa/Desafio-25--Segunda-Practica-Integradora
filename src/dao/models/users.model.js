import mongoose, { mongo } from "mongoose";

const usersCollection = "users";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: Number,
  password: String,
  cartId: {
    type: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "carts",
      },
    ],
    default: [],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const userModel = mongoose.model(usersCollection, userSchema);
export default userModel;
