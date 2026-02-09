import { test, expect } from "@playwright/test";
import path from "path";

const fixtureUrl = "file://" + path.resolve(__dirname, "fixtures/matrix.html").replace(/\\/g, "/");

test.describe("Mobile layout — empty state", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(fixtureUrl);
	});

	test("all four quadrants are visible (height >= 80px)", async ({ page }) => {
		const quadrants = page.locator("#empty-state .em-quadrant");
		await expect(quadrants).toHaveCount(4);

		for (let i = 0; i < 4; i++) {
			const box = await quadrants.nth(i).boundingBox();
			expect(box, `Quadrant ${i + 1} should have a bounding box`).not.toBeNull();
			expect(box!.height, `Quadrant ${i + 1} height`).toBeGreaterThanOrEqual(80);
		}
	});

	test("quadrant headers are visible (height >= 30px)", async ({ page }) => {
		const headers = page.locator("#empty-state .em-quadrant-header");
		await expect(headers).toHaveCount(4);

		for (let i = 0; i < 4; i++) {
			const box = await headers.nth(i).boundingBox();
			expect(box, `Header ${i + 1} should have a bounding box`).not.toBeNull();
			expect(box!.height, `Header ${i + 1} height`).toBeGreaterThanOrEqual(30);
		}
	});

	test("add buttons meet 44x44 mobile tap target", async ({ page }) => {
		const buttons = page.locator("#empty-state .em-add-btn");
		await expect(buttons).toHaveCount(4);

		for (let i = 0; i < 4; i++) {
			const box = await buttons.nth(i).boundingBox();
			expect(box, `Button ${i + 1} should have a bounding box`).not.toBeNull();
			expect(box!.width, `Button ${i + 1} width`).toBeGreaterThanOrEqual(44);
			expect(box!.height, `Button ${i + 1} height`).toBeGreaterThanOrEqual(44);
		}
	});

	test("grid is scrollable (not overflow hidden)", async ({ page }) => {
		const overflow = await page.locator("#empty-state .em-grid").evaluate(
			(el) => getComputedStyle(el).overflowY
		);
		expect(overflow).not.toBe("hidden");
	});
});

test.describe("Mobile layout — form open with task", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(fixtureUrl);
	});

	test("task items meet 44px mobile tap target height", async ({ page }) => {
		const task = page.locator("#form-open-state .em-task").first();
		const box = await task.boundingBox();
		expect(box, "Task should have a bounding box").not.toBeNull();
		expect(box!.height, "Task height").toBeGreaterThanOrEqual(44);
	});

	test("open add form is visible within viewport", async ({ page }) => {
		const form = page.locator("#form-open-state .em-add-form:not(.em-hidden)");
		const box = await form.boundingBox();
		expect(box, "Form should have a bounding box").not.toBeNull();
		expect(box!.height, "Form height").toBeGreaterThan(0);
		expect(box!.width, "Form width").toBeGreaterThan(0);
	});

	test("form submit button is visible", async ({ page }) => {
		const btn = page.locator("#form-open-state .em-add-form:not(.em-hidden) .em-form-submit");
		const box = await btn.boundingBox();
		expect(box, "Submit button should have a bounding box").not.toBeNull();
		expect(box!.height, "Submit button height").toBeGreaterThan(0);
	});
});

test.describe("Mobile layout — constrained Obsidian workspace", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(fixtureUrl);
		// Simulate Obsidian's workspace leaf with a small fixed height (300px).
		// On mobile with keyboard + Obsidian chrome, space is very tight.
		await page.locator("#empty-state").evaluate((el) => {
			el.style.height = "300px";
		});
	});

	test("quadrants are still visible even in a 300px container", async ({ page }) => {
		const quadrants = page.locator("#empty-state .em-quadrant");

		for (let i = 0; i < 4; i++) {
			const box = await quadrants.nth(i).boundingBox();
			expect(box, `Quadrant ${i + 1} should have a bounding box`).not.toBeNull();
			expect(box!.height, `Quadrant ${i + 1} should not collapse`).toBeGreaterThanOrEqual(60);
		}
	});

	test("quadrant headers remain visible in constrained container", async ({ page }) => {
		const headers = page.locator("#empty-state .em-quadrant-header");

		for (let i = 0; i < 4; i++) {
			const box = await headers.nth(i).boundingBox();
			expect(box, `Header ${i + 1} should have a bounding box`).not.toBeNull();
			expect(box!.height, `Header ${i + 1} should not collapse`).toBeGreaterThanOrEqual(30);
		}
	});

	test("add form is usable when opened in constrained container", async ({ page }) => {
		await page.locator("#empty-state .em-quadrant-q1 .em-add-form").evaluate((el) => {
			el.classList.remove("em-hidden");
		});

		const form = page.locator("#empty-state .em-quadrant-q1 .em-add-form");
		const box = await form.boundingBox();
		expect(box, "Add form should have a bounding box").not.toBeNull();
		expect(box!.height, "Add form should be visible").toBeGreaterThan(50);
	});
});

test.describe("Mobile layout — no overflow:hidden on containers or quadrants", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(fixtureUrl);
	});

	test("em-container does not clip overflow on mobile", async ({ page }) => {
		const overflow = await page.locator("#empty-state .em-container").evaluate(
			(el) => getComputedStyle(el).overflowY
		);
		expect(overflow, "Container should not clip content").not.toBe("hidden");
	});

	test("em-matrix-wrapper does not clip overflow on mobile", async ({ page }) => {
		const overflow = await page.locator("#empty-state .em-matrix-wrapper").evaluate(
			(el) => getComputedStyle(el).overflowY
		);
		expect(overflow, "Matrix wrapper should not clip content").not.toBe("hidden");
	});

	test("em-quadrant does not clip overflow on mobile", async ({ page }) => {
		const quadrants = page.locator("#empty-state .em-quadrant");
		for (let i = 0; i < 4; i++) {
			const overflow = await quadrants.nth(i).evaluate(
				(el) => getComputedStyle(el).overflowY
			);
			expect(overflow, `Quadrant ${i + 1} should not clip content`).not.toBe("hidden");
		}
	});

	test("em-quadrant has no max-height on mobile", async ({ page }) => {
		const quadrants = page.locator("#empty-state .em-quadrant");
		for (let i = 0; i < 4; i++) {
			const maxHeight = await quadrants.nth(i).evaluate(
				(el) => getComputedStyle(el).maxHeight
			);
			expect(maxHeight, `Quadrant ${i + 1} should have no max-height`).toBe("none");
		}
	});
});
