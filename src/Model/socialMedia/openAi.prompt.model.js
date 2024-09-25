import { Schema, model } from "mongoose";
const promptsSchema = new Schema({
  service: { type: String, required: true },
  brand:String,
  prompt: { type: String, required: true },
});

const promptsModel = model("prompt", promptsSchema);
export default promptsModel;
