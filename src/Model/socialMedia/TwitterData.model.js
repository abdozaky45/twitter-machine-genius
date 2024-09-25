import { Schema, model,Types } from "mongoose";
import { EnumStringRequired } from "../../utils/schemas/EnumString";
import { brandArr } from "../../utils/Brand";

const TwitterDataSchema = new Schema({
  brand: EnumStringRequired(brandArr),
  token: { type: String, required: true },
});

const twitterModel = model("twitterData",TwitterDataSchema);

export default twitterModel;