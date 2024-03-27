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
  const random = Math.floor(Math.random() * users.length);
  const mrData: MergeRequest = await c.req.json();
  console.log(mrData);

  let msg = "";
  if (mrData.object_attributes.action === "open") {
    msg = `**${mrData.user.username}** created new [Merge Request](${mrData.object_attributes.url}).\n\nTitle: ${mrData.object_attributes.title}\nDescription: ${mrData.object_attributes.description}\n\nRandom assignee: @${users[random]}`;

    await bot.telegram.sendMessage(process.env.CHANNEL_ID!, msg, {
      parse_mode: "Markdown",
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
