import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Telegraf } from "telegraf";
import { MergeRequest } from "./types";

const users = [
  "teaking",
  "ptendec_job",
  "sauledossym",
  "Alibekqqqq",
  "hejfjfurjhn",
  "Dahon13",
  "Miras199406",
  "addisonbk",
];

const bot = new Telegraf(process.env.BOT_TOKEN!);
const app = new Hono();

app.post("/", async (c) => {
  const mrData: MergeRequest = await c.req.json();
  if (mrData.object_attributes.action !== "open") {
    return c.json(mrData);
  }

  const random = Math.floor(Math.random() * users.length);
  let msg = "";
  if (mrData.object_attributes.action === "open") {
    msg = `**${mrData.user.username}** created new [Merge Request](${mrData.object_attributes.url}).\n\nTitle: ${mrData.object_attributes.title}\nDescription: ${mrData.object_attributes.description}\n\nRandom assignee: @${users[random]}`;
    const channels = process.env.CHANNEL_ID!.split(";");
    channels.forEach(async (channel) => {
      await bot.telegram.sendMessage(channel, msg, {
        parse_mode: "Markdown",
      });
    });
  }

  return c.json(mrData);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
