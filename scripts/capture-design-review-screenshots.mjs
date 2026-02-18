/**
 * Captures screenshots for the follow-up design review.
 * Run: node scripts/capture-design-review-screenshots.mjs
 */
import { chromium } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = `file://${resolve(root, "tests/fixtures/matrix.html").replace(/\\/g, "/")}`;
const outDir = resolve(root, "screenshots/design-review");

const darkCSSOverrides = `
	:root {
		--background-primary: #1e1e1e;
		--background-primary-alt: #262626;
		--background-modifier-border: #444;
		--interactive-accent: #7c5cbf;
		--text-on-accent: #ffffff;
		--text-normal: #ddd;
		--text-muted: #888;
	}
	html, body {
		background: #1e1e1e;
		color: #ddd;
	}
`;

const shots = [
	{
		name: "followup-desktop-populated.png",
		viewport: { width: 1280, height: 720 },
		selector: "#populated-state",
		deviceScaleFactor: 2,
	},
	{
		name: "followup-desktop-dark.png",
		viewport: { width: 1280, height: 720 },
		selector: "#populated-state",
		deviceScaleFactor: 2,
		dark: true,
	},
	{
		name: "followup-desktop-empty.png",
		viewport: { width: 1280, height: 720 },
		selector: "#empty-state",
		deviceScaleFactor: 2,
	},
	{
		name: "followup-desktop-overloaded.png",
		viewport: { width: 1280, height: 720 },
		selector: "#overloaded-state",
		deviceScaleFactor: 2,
	},
	{
		name: "followup-desktop-form-open.png",
		viewport: { width: 1280, height: 720 },
		selector: "#form-open-state",
		deviceScaleFactor: 2,
	},
	{
		name: "followup-mobile-populated.png",
		viewport: { width: 375, height: 667 },
		selector: "#populated-state",
		deviceScaleFactor: 2,
		isMobile: true,
	},
	{
		name: "followup-mobile-empty.png",
		viewport: { width: 375, height: 667 },
		selector: "#empty-state",
		deviceScaleFactor: 2,
		isMobile: true,
	},
];

async function main() {
	const browser = await chromium.launch();

	for (const shot of shots) {
		const context = await browser.newContext({
			viewport: shot.viewport,
			deviceScaleFactor: shot.deviceScaleFactor,
			isMobile: shot.isMobile || false,
		});
		const page = await context.newPage();
		await page.goto(fixture, { waitUntil: "networkidle" });

		if (shot.dark) {
			await page.addStyleTag({ content: darkCSSOverrides });
			await page.evaluate(() => document.body.classList.add("theme-dark"));
		}

		const el = page.locator(shot.selector);
		await el.screenshot({ path: resolve(outDir, shot.name) });

		console.log(`  captured ${shot.name}`);
		await context.close();
	}

	await browser.close();
	console.log(`\nDone — ${shots.length} screenshots saved to screenshots/design-review/`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
