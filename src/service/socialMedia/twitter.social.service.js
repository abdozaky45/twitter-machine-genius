import promptsModel from "../../Model/socialMedia/openAi.prompt.model";
import socialAccountModel from "../../Model/socialMedia/SocialMediaAccount.model";
import socialCommentModel from "../../Model/socialMedia/SocialMediaComments.model";
import twitterModel from "../../Model/socialMedia/TwitterData.model";
import { campaignListEnum } from "../../utils/campaign/index.ts";
import crypto from "crypto";
function decrypt(encryptedText) {
  const algorithm = "aes-256-cbc";
  const secretKeyHex = process.env.SECRET_KEY;
  if (!secretKeyHex) {
    throw new Error("SECRET_KEY environment variable is not set.");
  }
  if (secretKeyHex.length !== 64) {
    throw new Error("SECRET_KEY must be a 64-character hexadecimal string.");
  }
  const secretKey = Buffer.from(secretKeyHex, "hex");
  // Split the encrypted text into IV and the actual encrypted data
  const [ivHex, encryptedData] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
export const decryptTokens = (decodedToken) => {
  return {
    appKey: decrypt(decodedToken.appKey),
    appSecret: decrypt(decodedToken.appSecret),
    accessToken: decrypt(decodedToken.accessToken),
    accessSecret: decrypt(decodedToken.accessSecret),
    bearerToken: decrypt(decodedToken.bearerToken),
  };
};
export const convertToMilliseconds = (timeString) => {
  const timeValue = parseInt(timeString); 
  return timeValue * 60 * 1000; 
};

export const getTwitterData = async (brand) => {
  const twitterData = await twitterModel.findOne({ brand });
  return twitterData;
};
export const getTwitterAccounts = async () => {
  const accounts = await socialAccountModel.find({
    sharingList: "TWITTER",
  });
  return accounts;
};
export const checkReplyTweet = async (tweetId) => {
  const checkReply = await socialCommentModel.findOne({
    post_id: tweetId,
  });
  return checkReply;
};
export const createReply = async (
  platform,
  accountName,
  brand,
  reply,
  post_id,
  campaignType,
  content
) => {
  if (campaignType === campaignListEnum.AUTO_COMMENT) {
    const socialComment = await socialCommentModel.create({
      platform,
      accountName,
      brand,
      comment: reply,
      post_id,
      campaignType: campaignListEnum.AUTO_COMMENT,
    });
    return socialComment;
  } else {
    const socialContent = await socialCommentModel.create({
      platform,
      accountName,
      brand,
      comment: reply,
      post_id,
      content,
      campaignType: campaignListEnum.MUST_APPROVE,
    });
    return socialContent;
  }
};
export const getPrompt = async (service) => {
  const prompt = await promptsModel.findOne({ service });
  return prompt;
};
export const getAllBrands = async () => {
  const brands = await twitterModel.find({});
  return brands;
};
export const getAllAccounts = async (brand) => {
  const accounts = await socialAccountModel.find({ brand });
  return accounts;
};

