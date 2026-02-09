import { Plugin, WorkspaceLeaf } from "obsidian";
import { EisenhowerMatrixView } from "./view";
import {
	EisenhowerMatrixData,
	DEFAULT_DATA,
	VIEW_TYPE_EISENHOWER,
	Task,
	Quadrant,
} from "./types";

export default class EisenhowerMatrixPlugin extends Plugin {
	data: EisenhowerMatrixData = DEFAULT_DATA;

	async onload(): Promise<void> {
		await this.loadPluginData();

		this.registerView(
			VIEW_TYPE_EISENHOWER,
			(leaf: WorkspaceLeaf) => new EisenhowerMatrixView(leaf, this)
		);

		this.addRibbonIcon("layout-grid", "Eisenhower Matrix", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-eisenhower-matrix",
			name: "Open Eisenhower Matrix",
			callback: () => {
				this.activateView();
			},
		});
	}

	onunload(): void {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EISENHOWER);
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_EISENHOWER);

		if (leaves.length > 0) {
			workspace.revealLeaf(leaves[0]);
			return;
		}

		const leaf = workspace.getLeaf(false);
		await leaf.setViewState({
			type: VIEW_TYPE_EISENHOWER,
			active: true,
		});
		workspace.revealLeaf(leaf);
	}

	async loadPluginData(): Promise<void> {
		const loaded = await this.loadData();
		this.data = Object.assign({}, DEFAULT_DATA, loaded);
		if (!Array.isArray(this.data.tasks)) {
			this.data.tasks = [];
		}
	}

	async savePluginData(): Promise<void> {
		await this.saveData(this.data);
	}

	getTasksForQuadrant(quadrant: Quadrant): Task[] {
		return this.data.tasks
			.filter((t) => t.quadrant === quadrant)
			.sort((a, b) => a.order - b.order);
	}

	addTask(title: string, quadrant: Quadrant, dueDate: string | null): Task {
		const tasksInQuadrant = this.getTasksForQuadrant(quadrant);
		const newTask: Task = {
			id: this.generateId(),
			title: title.trim(),
			quadrant,
			dueDate,
			createdAt: new Date().toISOString(),
			order: tasksInQuadrant.length,
		};
		this.data.tasks.push(newTask);
		return newTask;
	}

	deleteTask(taskId: string): void {
		this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
	}

	editTask(taskId: string, title: string, dueDate: string | null): boolean {
		const task = this.data.tasks.find((t) => t.id === taskId);
		if (!task) return false;
		task.title = title.trim();
		task.dueDate = dueDate;
		return true;
	}

	moveTask(taskId: string, targetQuadrant: Quadrant): void {
		const task = this.data.tasks.find((t) => t.id === taskId);
		if (task) {
			task.quadrant = targetQuadrant;
			const tasksInTarget = this.data.tasks.filter(
				(t) => t.quadrant === targetQuadrant && t.id !== taskId
			);
			task.order = tasksInTarget.length;
		}
	}

	private generateId(): string {
		if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
			return crypto.randomUUID();
		}
		return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
	}
}
