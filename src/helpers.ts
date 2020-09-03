import axios from "axios";
import { pipe } from "ramda";

const MDN = "https://developer.mozilla.org/en-US/docs";

interface MDNResponse {
	documents: {
		title: string;
		excerpt: string;
		slug: string;
	}[];
}

export const search = async (
	query: string
): Promise<MDNResponse["documents"]> => {
	const response = await axios
		.get<string>(`https://developer.mozilla.org/en-US/search?q=${query}`, {
			headers: {
				accept: "application/json",
				referer: "https://www.google.com/",
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 Edg/84.0.522.63"
			},
			responseType: "text"
		})
		.then(({ data }) => data);
	try {
		const text = response
			?.match(/"documents\\":\[.*\]/g)?.[0]
			?.replace(/\\/g, "");
		if (!text) return [];
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const result: MDNResponse = JSON.parse("{" + text + "}");
		return result.documents;
	} catch (error) {
		return [];
	}
};

// https://github.com/telecraft/telegram/blob/master/src/utils.ts#L1
const escapables = {
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;",
	"'": "&#39;",
	'"': "&quot;"
};
export const escapeHTML = (s: string) =>
	s.replace(/<|>|&|"|'/g, r => escapables[r as keyof typeof escapables] || r);

const code = (s: string) => `<code>${s}</code>`;
const bold = (s: string) => `<b>${s}</b>`;
const italic = (s: string) => `<i>${s}</i>`;

const replaceAt = (str: string) => str.replace(/@/g, code("@"));
const replaceTag = (str: string) => str.replace(/<\/?.*>/g, "");
export const replaceGtAndLt = (str: string) =>
	str.replace(/(<\/?)(.*)(>)/, "$2(tag)");
export const applyTemplate = ({
	title,
	excerpt,
	slug
}: MDNResponse["documents"][0]): string => {
	const name = pipe(replaceAt, escapeHTML, bold)(title);
	const link = escapeHTML(`${MDN}/${slug}`);
	const description = pipe(
		replaceTag,
		escapeHTML,
		italic,
		replaceAt
	)(excerpt);
	return `⌕ ${name}\n${description}\n\n${link}`;
};
