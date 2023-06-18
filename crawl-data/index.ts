import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

interface ISarcasmHeadlines {
	article_link: string;
	headline: string;
	is_sarcastic: number;
}

async function getPage(url: string) {
	try {
		return await axios.get(url);
	} catch (error) {
		console.log(error);
	}
}

async function crawlOnePage(
	url: string,
	selector: string,
	domain: string,
	is_sarcastic: number
): Promise<ISarcasmHeadlines[]> {
	const result: ISarcasmHeadlines[] = [];
	try {
		const html = (await getPage(url))?.data;
		const $ = cheerio.load(html);
		$(selector).each((index, el) => {
			const headline = $(el).text();
			const article_link = `${domain}${$(el).attr("href")}`;
			result.push({
				article_link,
				headline,
				is_sarcastic
			});
		});
	} catch (error) {
		console.log(error);
	}
	return result;
}

async function crawlTuoiTreCuoi() {
	try {
		let result: ISarcasmHeadlines[] = [];
		for (let pageNum = 1; pageNum <= 100; pageNum++) {
			let url = `https://cuoi.tuoitre.vn/timeline-list-boxtab/0/200073/trang-${pageNum}.htm`;
			const data = await crawlOnePage(
				url,
				"body > article > div > h3 > a",
				"https://cuoi.tuoitre.vn",
				1
			);
			result = result.concat(data);
			console.log(data);
			await new Promise((r) => setTimeout(r, 1000));
		}
		fs.writeFileSync("tuoitrecuoi.json", JSON.stringify(result));
	} catch (error) {
		console.log(error);
	}
}

async function crawlBaoMoi() {
	let result: ISarcasmHeadlines[] = [];
	for (let pageNum = 1; pageNum <= 100; pageNum++) {
		let url = `https://baomoi.com/tag/Ch%C3%A2m-bi%E1%BA%BFm/trang${pageNum}.epi`;
		const data = await crawlOnePage(
			url,
			"#__next > div.bm_v > div > div > div.bm_MK > div.bm_ML.bm_m > div > div.bm_o > div > div.bm_s > div.bm_r > h4 > span > a",
			"https://baomoi.com",
			1
		);
		result = result.concat(data);
		console.log(data);
		// await new Promise(r => setTimeout(r, 5000));
	}
	fs.writeFileSync("data.json", JSON.stringify(result));
}

async function crawlThanhNien() {
	let result: ISarcasmHeadlines[] = [];
	for (let pageNum = 1; pageNum <= 100; pageNum++) {
		let url = `https://thanhnien.vn/timelinelist/1854/${pageNum}.htm`;
		const data = await crawlOnePage(
			url,
			"body > div > div > h3 > a",
			"https://thanhnien.vn",
			0
		);
		result = result.concat(data);
		console.log(data);
		// await new Promise(r => setTimeout(r, 5000));
	}
	fs.writeFileSync("thanhnien.json", JSON.stringify(result));
}

async function main() {
	await crawlTuoiTreCuoi();
	// await crawlThanhNien();
	const tuoitrecuoi: ISarcasmHeadlines[] = require("./tuoitrecuoi.json");
	const thanhnien: ISarcasmHeadlines[] = require("./thanhnien.json");
	const result = tuoitrecuoi.concat(thanhnien)
	fs.writeFileSync("data.json", JSON.stringify(result));
}

main();
