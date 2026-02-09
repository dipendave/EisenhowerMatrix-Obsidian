import { Quadrant, DEFAULT_DATA } from "../src/types";
import EisenhowerMatrixPlugin from "../src/main";

// Helper to create a plugin instance with mocked Obsidian internals
function createPlugin(): EisenhowerMatrixPlugin {
	const plugin = new EisenhowerMatrixPlugin(
		{} as any, // app
		{} as any  // manifest
	);
	plugin.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
	return plugin;
}

describe("EisenhowerMatrixPlugin", () => {
	describe("addTask", () => {
		it("adds a task to the data array", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("Test task", Quadrant.Q1, null);

			expect(plugin.data.tasks).toHaveLength(1);
			expect(task.title).toBe("Test task");
			expect(task.quadrant).toBe(Quadrant.Q1);
			expect(task.dueDate).toBeNull();
			expect(task.order).toBe(0);
			expect(task.id).toBeTruthy();
			expect(task.createdAt).toBeTruthy();
		});

		it("trims whitespace from the title", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("  Trimmed title  ", Quadrant.Q2, null);
			expect(task.title).toBe("Trimmed title");
		});

		it("assigns incrementing order within a quadrant", () => {
			const plugin = createPlugin();
			const t1 = plugin.addTask("First", Quadrant.Q1, null);
			const t2 = plugin.addTask("Second", Quadrant.Q1, null);
			const t3 = plugin.addTask("Third", Quadrant.Q1, null);

			expect(t1.order).toBe(0);
			expect(t2.order).toBe(1);
			expect(t3.order).toBe(2);
		});

		it("assigns order independently per quadrant", () => {
			const plugin = createPlugin();
			plugin.addTask("Q1 task", Quadrant.Q1, null);
			const q2task = plugin.addTask("Q2 task", Quadrant.Q2, null);

			expect(q2task.order).toBe(0);
		});

		it("stores a due date when provided", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("Due task", Quadrant.Q3, "2025-12-25");
			expect(task.dueDate).toBe("2025-12-25");
		});

		it("generates unique IDs for each task", () => {
			const plugin = createPlugin();
			const t1 = plugin.addTask("A", Quadrant.Q1, null);
			const t2 = plugin.addTask("B", Quadrant.Q1, null);
			expect(t1.id).not.toBe(t2.id);
		});
	});

	describe("deleteTask", () => {
		it("removes a task by ID", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("To delete", Quadrant.Q1, null);
			expect(plugin.data.tasks).toHaveLength(1);

			plugin.deleteTask(task.id);
			expect(plugin.data.tasks).toHaveLength(0);
		});

		it("does nothing when ID does not exist", () => {
			const plugin = createPlugin();
			plugin.addTask("Keep me", Quadrant.Q1, null);
			plugin.deleteTask("nonexistent-id");
			expect(plugin.data.tasks).toHaveLength(1);
		});

		it("only removes the targeted task", () => {
			const plugin = createPlugin();
			const t1 = plugin.addTask("Keep", Quadrant.Q1, null);
			const t2 = plugin.addTask("Delete", Quadrant.Q1, null);

			plugin.deleteTask(t2.id);
			expect(plugin.data.tasks).toHaveLength(1);
			expect(plugin.data.tasks[0].id).toBe(t1.id);
		});
	});

	describe("editTask", () => {
		it("updates the title", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("Old title", Quadrant.Q1, null);

			const result = plugin.editTask(task.id, "New title", null);
			expect(result).toBe(true);
			expect(plugin.data.tasks[0].title).toBe("New title");
		});

		it("updates the due date", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("Task", Quadrant.Q1, null);

			plugin.editTask(task.id, "Task", "2025-12-25");
			expect(plugin.data.tasks[0].dueDate).toBe("2025-12-25");
		});

		it("trims whitespace from the title", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("Task", Quadrant.Q1, null);

			plugin.editTask(task.id, "  Trimmed  ", null);
			expect(plugin.data.tasks[0].title).toBe("Trimmed");
		});

		it("returns false for a nonexistent task ID", () => {
			const plugin = createPlugin();
			const result = plugin.editTask("nonexistent", "Title", null);
			expect(result).toBe(false);
		});

		it("clears the due date when set to null", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("Task", Quadrant.Q1, "2025-06-15");

			plugin.editTask(task.id, "Task", null);
			expect(plugin.data.tasks[0].dueDate).toBeNull();
		});
	});

	describe("moveTask", () => {
		it("changes a task's quadrant", () => {
			const plugin = createPlugin();
			const task = plugin.addTask("Moveable", Quadrant.Q1, null);

			plugin.moveTask(task.id, Quadrant.Q4);
			expect(plugin.data.tasks[0].quadrant).toBe(Quadrant.Q4);
		});

		it("sets order to the end of the target quadrant", () => {
			const plugin = createPlugin();
			plugin.addTask("Existing in Q2", Quadrant.Q2, null);
			const task = plugin.addTask("Moving", Quadrant.Q1, null);

			plugin.moveTask(task.id, Quadrant.Q2);
			expect(task.order).toBe(1); // After the existing Q2 task
		});

		it("does nothing for a nonexistent task ID", () => {
			const plugin = createPlugin();
			plugin.addTask("Stay", Quadrant.Q1, null);
			plugin.moveTask("nonexistent", Quadrant.Q3);
			expect(plugin.data.tasks[0].quadrant).toBe(Quadrant.Q1);
		});
	});

	describe("getTasksForQuadrant", () => {
		it("returns only tasks for the specified quadrant", () => {
			const plugin = createPlugin();
			plugin.addTask("Q1", Quadrant.Q1, null);
			plugin.addTask("Q2", Quadrant.Q2, null);
			plugin.addTask("Q1 again", Quadrant.Q1, null);

			const q1Tasks = plugin.getTasksForQuadrant(Quadrant.Q1);
			expect(q1Tasks).toHaveLength(2);
			expect(q1Tasks.every((t) => t.quadrant === Quadrant.Q1)).toBe(true);
		});

		it("returns tasks sorted by order", () => {
			const plugin = createPlugin();
			plugin.addTask("First", Quadrant.Q1, null);
			plugin.addTask("Second", Quadrant.Q1, null);
			plugin.addTask("Third", Quadrant.Q1, null);

			const tasks = plugin.getTasksForQuadrant(Quadrant.Q1);
			expect(tasks[0].title).toBe("First");
			expect(tasks[1].title).toBe("Second");
			expect(tasks[2].title).toBe("Third");
		});

		it("returns an empty array when no tasks exist for the quadrant", () => {
			const plugin = createPlugin();
			expect(plugin.getTasksForQuadrant(Quadrant.Q4)).toEqual([]);
		});
	});

	describe("loadPluginData", () => {
		it("initializes with DEFAULT_DATA when loadData returns null", async () => {
			const plugin = createPlugin();
			plugin.loadData = jest.fn().mockResolvedValue(null);

			await plugin.loadPluginData();
			expect(plugin.data.tasks).toEqual([]);
			expect(plugin.data.version).toBe(1);
		});

		it("merges loaded data with defaults", async () => {
			const plugin = createPlugin();
			const savedTasks = [
				{
					id: "abc",
					title: "Saved task",
					quadrant: Quadrant.Q1,
					dueDate: null,
					createdAt: "2025-01-01T00:00:00.000Z",
					order: 0,
				},
			];
			plugin.loadData = jest.fn().mockResolvedValue({
				tasks: savedTasks,
				version: 1,
			});

			await plugin.loadPluginData();
			expect(plugin.data.tasks).toHaveLength(1);
			expect(plugin.data.tasks[0].title).toBe("Saved task");
		});

		it("resets tasks to empty array if loaded tasks is not an array", async () => {
			const plugin = createPlugin();
			plugin.loadData = jest.fn().mockResolvedValue({
				tasks: "corrupt",
				version: 1,
			});

			await plugin.loadPluginData();
			expect(plugin.data.tasks).toEqual([]);
		});
	});
});
