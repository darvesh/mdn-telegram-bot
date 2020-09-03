import { Telegraf } from "telegraf";
import { InlineQueryResultArticle } from "telegraf/typings/telegram-types";

import { BOT_TOKEN } from "./config";
import { search, applyTemplate } from "./helpers";

const bot = new Telegraf(BOT_TOKEN);

bot.on("inline_query", async context => {
	const query = context.inlineQuery?.query || "";
	const result = await search(query);
	const response = result.map(
		(doc, index: number): InlineQueryResultArticle => {
			const formattedMessage = applyTemplate(doc);
			return {
				id: String(index),
				type: "article",
				title: doc.title,
				input_message_content: {
					parse_mode: "HTML",
					message_text: formattedMessage,
					disable_web_page_preview: true
				}
			};
		}
	);
	return context.answerInlineQuery(response);
});

bot.command("start", ({ replyWithHTML }) =>
	replyWithHTML(`<b>An inline bot for searching MDN docs.</b>\n
<b>Source</b>: <a href="https://github.com/darvesh/mdn-telegram-bot">MDN Wiki Telegram Bot</a>
<b>Built By</b>: @solooo7`)
);
bot.command("help", ({ replyWithHTML }) =>
	replyWithHTML(`<b>MDN Wiki Bot is an inline bot.</b>\n
Type <code>@mdnwikibot &lt;query&gt;</code> to search MDN docs.
`)
);

bot.catch((error: Error) => console.log(error.message));

void bot.launch();
