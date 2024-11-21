import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Telegraf } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/types";
import { MergeRequest } from "./types";

function extractRandomAssignee(message: string) {
  const regex = /Random assignee: @(\w+)/;
  const match = message.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function getRandomUser(users: string[], excludeUser: string) {
  let randomUser;

  do {
    randomUser = users[Math.floor(Math.random() * users.length)];
  } while (randomUser === excludeUser);

  return randomUser;
}

const users = [
  "teaking",
  "ptendec_job",
  "sauledossym",
  "Alibekqqqq",
  "hejfjfurjhn",
  "Miras199406",
  "addisonbk",
];

const bot = new Telegraf(process.env.BOT_TOKEN!);
const app = new Hono();

bot.action("refresh_random", async (ctx) => {
  try {
    const assignee =
      extractRandomAssignee((ctx.msg as { text: string })?.text) ?? "";
    const random = getRandomUser(users, assignee);

    await bot.telegram.editMessageText(
      ctx.msg.chat.id,
      ctx.msg.message_id,
      undefined,
      (ctx.msg as { text: string })?.text?.replaceAll(assignee, random),
      {
        parse_mode: "HTML",
        reply_markup: (ctx.msg as { reply_markup: InlineKeyboardMarkup })
          .reply_markup,
      }
    );
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return;
  }
});

app.post("/", async (c) => {
  try {
    const mrData: MergeRequest = await c.req.json();
    console.log(mrData);
    if (
      mrData.object_attributes.action !== "open" &&
      mrData.object_attributes.action !== "reopen"
    ) {
      return c.json(mrData);
    }

    const random = getRandomUser(users, "");
    let msg = "";
    if (mrData.object_attributes.action === "open") {
      msg = `<b>${mrData.user.username}</b> created new <b>Merge Request</b>.\n\nTitle: ${mrData.object_attributes.title}\nDescription: ${mrData.object_attributes.description}\n\nRandom assignee: @${random}`;
      const channels = process.env.CHANNEL_ID!.split(";");
      channels.forEach(async (channel) => {
        await bot.telegram.sendMessage(channel, msg, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Open Merge Request",
                  url: mrData.object_attributes.url,
                },
              ],
              [
                {
                  text: "Refresh Random User",
                  callback_data: "refresh_random",
                },
              ],
            ],
          },
        });
      });
    }

    return c.json(mrData);
  } catch (error) {
    return c.json({ error: JSON.stringify(error, null, 2) });
  }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
