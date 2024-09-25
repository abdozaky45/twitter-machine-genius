import "dotenv/config";
import cron from "node-cron";
import { DBConnection } from "./Model/connection";
import {tweets } from "./Controller/socialMedia/twitter.socialMedia";
import sendEmail from "./utils/sendEmail/nodemailer";
(async () => {
  await DBConnection();
})();
let isRunning = false;
const job = cron.schedule("*/15 * * * *", async () => {
  if (isRunning) {
    console.log("Job is already running. Skipping this execution.");
    return;
  }
  isRunning = true;

  try {
    const response = await tweets();

    if (Array.isArray(response) && response.length > 0) {
      const firstResponse = response[0];

      if (firstResponse.statusCode === 401 || firstResponse.statusCode === 429) {
        if (firstResponse.statusCode === 401) {
          await sendEmail({
            subject: "Authentication Error twitter api cron job",
            text: "Unauthorized access. Please check your credentials.",
          });
          job.stop();
        } else if (firstResponse.statusCode === 429) {
          await sendEmail({
            subject: "Too Many Requests Error twitter api cron job",
            text: "Too Many Requests. Stopping the job temporarily.",
          });
        }
      }
    }
  } catch (error: any) {
    console.log(error);
  } finally {
    isRunning = false;
  }
});
job.start();
