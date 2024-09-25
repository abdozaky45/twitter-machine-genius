import { Schema, model } from "mongoose";
import { EnumStringRequired } from "../../utils/schemas/EnumString";
import { PlatformArr } from "../../utils/Platform";
import { brandArr } from "../../utils/Brand";
import { campaignListArr } from "../../utils/campaign";

const SocialMediaCommentSchema = new Schema({
  platform: EnumStringRequired(PlatformArr),
  brand: EnumStringRequired(brandArr),
  accountName: { type: String, required: true },
  comment: String,
  content: String,
  post_id: { type: String, required: true },
  campaignType: EnumStringRequired(campaignListArr),
});

const socialCommentModel = model(
  "socialMediaComment",
  SocialMediaCommentSchema
);

export default socialCommentModel;
