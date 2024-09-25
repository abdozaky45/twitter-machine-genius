import { Schema, model, Types } from "mongoose";
import { EnumStringRequired } from "../../utils/schemas/EnumString";
import { PlatformArr } from "../../utils/Platform";
import { campaignListArr } from "../../utils/campaign";
import { brandArr } from "../../utils/Brand";

const socialAccountSchema = new Schema({
  sharingList: EnumStringRequired(PlatformArr),
  brand: EnumStringRequired(brandArr),
  userName: {
    type: String,
    required: true,
  },
  accountName: { type: String, required: true },
  accountLink: { type: String, required: true },
  account_id: { type: String, required: true },
  employeeId: {
    type: Types.ObjectId,
    required: true,
    ref: "employee",
  },
  // Add Niche
  campaignType: EnumStringRequired(campaignListArr),
});

const socialAccountModel = model("socialAccount", socialAccountSchema);
export default socialAccountModel;
