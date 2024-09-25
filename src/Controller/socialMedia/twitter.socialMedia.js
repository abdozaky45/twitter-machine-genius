import {
  checkReplyTweet,
  createReply,
  decryptTokens,
  getAllAccounts,
  getAllBrands,
  getPrompt,
  getTwitterAccounts,
  getTwitterData,
} from "../../service/socialMedia/twitter.social.service.js";
import { addReply, getTweets } from "../../service/socialMedia/twitter.api.js";
import OpenAiService from "../../service/openai/openAiService.ts";
import jwt from "jsonwebtoken";
import moment from "moment/moment";
import { campaignListEnum } from "../../utils/campaign/index.ts";
import { redis } from "../../utils/Radios/radios.js";

export const tweets = async () => {
  try {
    const brands = await getAllBrands();
    console.log("brands----->", brands);

    const today = moment().toISOString();
    const openaiService = new OpenAiService();
    const resError = [];
    for (const brand of brands) {
      console.log("brand.brand}", brand.brand);

      const twitterData = await getTwitterData(brand.brand);
      const { token } = twitterData;
      console.log("token-------------------------->", twitterData);
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const { appKey, appSecret, accessToken, accessSecret, bearerToken } =
        decryptTokens(decodedToken);
      const accounts = await getAllAccounts(brand.brand);
      let skip = parseInt(await redis.get(`${brand.brand}_skip`)) || 0;
      // console.log("Skip:", skip);
      for (let i = 0; i < Math.min(accounts.length, 9); i++) {
        //  console.log("=====skip inside loop=======", skip);
        const account = accounts[skip];
        const tweetsPage = await getTweets(account.account_id, bearerToken);
        if (tweetsPage?.status === 401 || tweetsPage?.status === 429) {
          const errorMessage =
            tweetsPage.status === 401 ? "Unauthorized" : "Too Many Requests";
          console.log("Error----:", errorMessage);
          resError.push({
            error: true,
            message: errorMessage,
            details: tweetsPage.data || tweetsPage,
            statusCode: tweetsPage.status,
          });
        }
        if (tweetsPage.length) {
          for (const tweet of tweetsPage) {
            const da = moment(tweet.created_at);
            if (da.isSame(today, "day")) {
              const checkReply = await checkReplyTweet(tweet.id);
              if (checkReply) {
                console.log("Exist");
                break;
              }
              const promptData = await getPrompt("TWITTER");
              const prompt = promptData.prompt.replace("[[1]]", tweet.text);
              const result = await openaiService.callOpenAiApi(
                prompt,
                "You are a representative of Machine Genius, a social media organization focused on multiple fields. Provide a brief and relevant comment in response to the input, ensuring clarity and engagement."
              );
              const reply = result.choices[0].message.content;
              if (account.campaignType === campaignListEnum.AUTO_COMMENT) {
                const addComment = await addReply(
                  appKey,
                  appSecret,
                  accessToken,
                  accessSecret,
                  reply,
                  tweet.id
                );
                if (addComment?.status === 401) {
                  resError.push({
                    error: true,
                    message: errorMessage,
                    details: addComment.data || addComment,
                    statusCode: addComment.status,
                  });
                }
              }
              const content = tweet.text;
              const socialComment = await createReply(
                account.sharingList,
                account.userName,
                brand.brand,
                reply,
                tweet.id,
                account.campaignType,
                content
              );
            }
          }
        }
        skip = (skip + 1) % accounts.length;
      }
      await redis.set(`${brand.brand}_skip`, skip);
    }
    return resError;
  } catch (error) {
    console.log("Error----->", error);
  }
};
