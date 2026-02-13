import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import {
	VIEW_TYPE_EISENHOWER,
	Quadrant,
	QUADRANT_META,
	QuadrantMeta,
	Task,
} from "./types";
import EisenhowerMatrixPlugin from "./main";

export class EisenhowerMatrixView extends ItemView {
	plugin: EisenhowerMatrixPlugin;

	private draggedTaskId: string | null = null;
	private touchClone: HTMLElement | null = null;
	private touchTimeout: number | null = null;
	private draggedEl: HTMLElement | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: EisenhowerMatrixPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_EISENHOWER;
	}

	getDisplayText(): string {
		return "Eisenhower matrix";
	}

	getIcon(): string {
		return "layout-grid";
	}

	onOpen(): Promise<void> {
		this.renderMatrix();
		return Promise.resolve();
	}

	onClose(): Promise<void> {
		this.cleanupTouchDrag();
		return Promise.resolve();
	}

	// ==================== RENDERING ====================

	renderMatrix(): void {
		const container = this.contentEl;
		container.empty();
		container.addClass("em-container");

		const header = container.createDiv({ cls: "em-header" });
		header.createEl("h2", { text: "Eisenhower matrix", cls: "em-title" });

		const matrixWrapper = container.createDiv({ cls: "em-matrix-wrapper" });

		// Urgency axis label
		const urgencyLabel = matrixWrapper.createDiv({ cls: "em-axis-label em-axis-urgency" });
		urgencyLabel.createSpan({ text: "URGENT", cls: "em-axis-left" });
		urgencyLabel.createSpan({ text: "NOT URGENT", cls: "em-axis-right" });

		// Grid
		const grid = matrixWrapper.createDiv({ cls: "em-grid" });

		// Render quadrants: Q1 (top-left), Q2 (top-right), Q3 (bottom-left), Q4 (bottom-right)
		const quadrantOrder = [Quadrant.Q1, Quadrant.Q2, Quadrant.Q3, Quadrant.Q4];
		for (const q of quadrantOrder) {
			this.renderQuadrant(grid, QUADRANT_META[q]);
		}

		// Version footer
		const version = this.plugin.manifest.version;
		container.createDiv({ cls: "em-version", text: `v${version}` });
	}

	private renderQuadrant(gridEl: HTMLElement, meta: QuadrantMeta): void {
		const quadrantEl = gridEl.createDiv({
			cls: `em-quadrant ${meta.colorClass}`,
			attr: { "data-quadrant": meta.id },
		});

		// Header
		const headerEl = quadrantEl.createDiv({ cls: "em-quadrant-header" });
		const titleGroup = headerEl.createDiv({ cls: "em-quadrant-title-group" });
		titleGroup.createEl("h3", { text: meta.action, cls: "em-quadrant-action" });
		titleGroup.createEl("span", { text: meta.label, cls: "em-quadrant-subtitle" });

		const addBtn = headerEl.createEl("button", {
			cls: "em-add-btn",
			attr: { "aria-label": `Add task to ${meta.action}` },
		});
		setIcon(addBtn, "plus");

		// Task list
		const listEl = quadrantEl.createDiv({ cls: "em-task-list" });

		const tasks = this.plugin.getTasksForQuadrant(meta.id);
		if (tasks.length === 0) {
			this.renderEmptyState(listEl);
		} else {
			for (const task of tasks) {
				this.renderTask(listEl, task);
			}
		}

		// Add form (hidden by default)
		const formEl = quadrantEl.createDiv({ cls: "em-add-form em-hidden" });
		this.renderAddTaskForm(formEl, meta.id);

		addBtn.addEventListener("click", () => {
			const isHidden = formEl.hasClass("em-hidden");
			formEl.toggleClass("em-hidden", !isHidden);
			if (isHidden) {
				const input = formEl.querySelector(".em-task-input") as HTMLInputElement;
				input?.focus();
				// Scroll form into view after keyboard opens
				setTimeout(() => {
					formEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
				}, 300);
			}
		});

		// Drop zone
		this.setupQuadrantDropZone(quadrantEl, meta.id);
	}

	private renderTask(listEl: HTMLElement, task: Task): void {
		const taskEl = listEl.createDiv({
			cls: "em-task",
			attr: {
				"data-task-id": task.id,
				draggable: "true",
			},
		});

		// Drag handle
		const dragHandle = taskEl.createDiv({ cls: "em-task-drag-handle" });
		dragHandle.textContent = "\u2630";

		// Content
		const contentEl = taskEl.createDiv({ cls: "em-task-content" });
		contentEl.createDiv({ cls: "em-task-title", text: task.title });

		if (task.dueDate) {
			const dueDateEl = contentEl.createDiv({ cls: "em-task-due" });
			if (isDueDatePast(task.dueDate)) {
				dueDateEl.addClass("em-overdue");
			}
			dueDateEl.setText(formatDueDate(task.dueDate));
		}

		// Click to edit
		contentEl.addEventListener("click", (e) => {
			e.stopPropagation();
			this.renderEditForm(taskEl, task);
		});

		// Delete button
		const deleteBtn = taskEl.createEl("button", {
			cls: "em-task-delete",
			attr: { "aria-label": "Delete task" },
		});
		deleteBtn.textContent = "\u00d7";

		deleteBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			void this.handleDeleteTask(task.id);
		});

		// Drag setup
		this.setupDesktopDrag(taskEl, task.id);
		this.setupTouchDrag(taskEl, task.id);
	}

	private renderAddTaskForm(formEl: HTMLElement, quadrant: Quadrant): void {
		const inputEl = formEl.createEl("input", {
			cls: "em-task-input",
			attr: {
				type: "text",
				placeholder: "Task title...",
			},
		});

		const dateRow = formEl.createDiv({ cls: "em-form-date-row" });
		dateRow.createEl("label", { text: "Due:", cls: "em-date-label" });
		const dateInput = dateRow.createEl("input", {
			cls: "em-date-input",
			attr: { type: "date" },
		});

		const btnRow = formEl.createDiv({ cls: "em-form-btn-row" });
		const submitBtn = btnRow.createEl("button", {
			text: "Add",
			cls: "em-form-submit",
		});
		const cancelBtn = btnRow.createEl("button", {
			text: "Cancel",
			cls: "em-form-cancel",
		});

		const submit = () => {
			const title = inputEl.value.trim();
			if (!title) {
				inputEl.addClass("em-input-error");
				return;
			}
			const dueDate = dateInput.value || null;
			void this.handleAddTask(quadrant, title, dueDate);
			inputEl.value = "";
			dateInput.value = "";
			inputEl.removeClass("em-input-error");
			formEl.addClass("em-hidden");
		};

		submitBtn.addEventListener("click", submit);

		inputEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				submit();
			} else if (e.key === "Escape") {
				formEl.addClass("em-hidden");
			}
		});

		inputEl.addEventListener("input", () => {
			inputEl.removeClass("em-input-error");
		});

		// Scroll form into view when keyboard opens on mobile
		inputEl.addEventListener("focus", () => {
			setTimeout(() => {
				formEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
			}, 300);
		});

		cancelBtn.addEventListener("click", () => {
			inputEl.value = "";
			dateInput.value = "";
			inputEl.removeClass("em-input-error");
			formEl.addClass("em-hidden");
		});
	}

	private renderEmptyState(listEl: HTMLElement): void {
		listEl.createDiv({ cls: "em-empty-state", text: "No tasks yet" });
	}

	// ==================== TASK ACTIONS ====================

	private async handleAddTask(quadrant: Quadrant, title: string, dueDate: string | null): Promise<void> {
		this.plugin.addTask(title, quadrant, dueDate);
		await this.plugin.savePluginData();
		this.renderMatrix();
	}

	private async handleDeleteTask(taskId: string): Promise<void> {
		this.plugin.deleteTask(taskId);
		await this.plugin.savePluginData();
		this.renderMatrix();
	}

	private async handleEditTask(taskId: string, title: string, dueDate: string | null): Promise<void> {
		this.plugin.editTask(taskId, title, dueDate);
		await this.plugin.savePluginData();
		this.renderMatrix();
	}

	private renderEditForm(taskEl: HTMLElement, task: Task): void {
		// Disable drag while editing
		taskEl.setAttribute("draggable", "false");
		taskEl.empty();
		taskEl.addClass("em-task-editing");

		const formEl = taskEl.createDiv({ cls: "em-edit-form" });

		const titleInput = formEl.createEl("input", {
			cls: "em-task-input",
			attr: { type: "text", value: task.title },
		});

		const dateRow = formEl.createDiv({ cls: "em-form-date-row" });
		dateRow.createEl("label", { text: "Due:", cls: "em-date-label" });
		const dateInput = dateRow.createEl("input", {
			cls: "em-date-input",
			attr: { type: "date", value: task.dueDate || "" },
		});

		const btnRow = formEl.createDiv({ cls: "em-form-btn-row" });
		const saveBtn = btnRow.createEl("button", { text: "Save", cls: "em-form-submit" });
		const cancelBtn = btnRow.createEl("button", { text: "Cancel", cls: "em-form-cancel" });

		const save = () => {
			const title = titleInput.value.trim();
			if (!title) {
				titleInput.addClass("em-input-error");
				return;
			}
			const dueDate = dateInput.value || null;
			void this.handleEditTask(task.id, title, dueDate);
		};

		saveBtn.addEventListener("click", save);
		cancelBtn.addEventListener("click", () => this.renderMatrix());

		titleInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") save();
			else if (e.key === "Escape") this.renderMatrix();
		});

		titleInput.addEventListener("input", () => {
			titleInput.removeClass("em-input-error");
		});

		// Scroll form into view when keyboard opens on mobile
		titleInput.addEventListener("focus", () => {
			setTimeout(() => {
				formEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
			}, 300);
		});

		// Prevent clicks inside form from bubbling to drag handlers
		formEl.addEventListener("mousedown", (e) => e.stopPropagation());
		formEl.addEventListener("touchstart", (e) => e.stopPropagation());

		titleInput.focus();
		titleInput.select();
	}

	// ==================== DESKTOP DRAG & DROP ====================

	private setupDesktopDrag(taskEl: HTMLElement, taskId: string): void {
		taskEl.addEventListener("dragstart", (e: DragEvent) => {
			if (e.dataTransfer) {
				e.dataTransfer.setData("text/plain", taskId);
				e.dataTransfer.effectAllowed = "move";
			}
			taskEl.addClass("em-dragging");
			this.draggedTaskId = taskId;
		});

		taskEl.addEventListener("dragend", () => {
			taskEl.removeClass("em-dragging");
			this.draggedTaskId = null;
			this.contentEl.querySelectorAll(".em-drop-target").forEach((el) => {
				(el as HTMLElement).removeClass("em-drop-target");
			});
		});
	}

	private setupQuadrantDropZone(quadrantEl: HTMLElement, quadrant: Quadrant): void {
		quadrantEl.addEventListener("dragover", (e: DragEvent) => {
			e.preventDefault();
			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = "move";
			}
			quadrantEl.addClass("em-drop-target");
		});

		quadrantEl.addEventListener("dragleave", (e: DragEvent) => {
			const relatedTarget = e.relatedTarget as HTMLElement;
			if (!quadrantEl.contains(relatedTarget)) {
				quadrantEl.removeClass("em-drop-target");
			}
		});

		quadrantEl.addEventListener("drop", (e: DragEvent) => {
			e.preventDefault();
			quadrantEl.removeClass("em-drop-target");

			const taskId = e.dataTransfer?.getData("text/plain");
			if (!taskId) return;

			const task = this.plugin.data.tasks.find((t) => t.id === taskId);
			if (task && task.quadrant !== quadrant) {
				this.plugin.moveTask(taskId, quadrant);
				this.renderMatrix();
				void this.plugin.savePluginData();
			}
		});
	}

	// ==================== MOBILE TOUCH DRAG & DROP ====================

	private setupTouchDrag(taskEl: HTMLElement, taskId: string): void {
		let startX = 0;
		let startY = 0;
		let isDragging = false;

		const onTouchStart = (e: TouchEvent) => {
			if (e.touches.length !== 1) return;

			const touch = e.touches[0];
			startX = touch.clientX;
			startY = touch.clientY;
			isDragging = false;

			this.touchTimeout = window.setTimeout(() => {
				isDragging = true;
				this.draggedEl = taskEl;
				this.draggedTaskId = taskId;

				// Create visual clone
				const clone = taskEl.cloneNode(true) as HTMLElement;
				clone.addClass("em-touch-clone");
				clone.setCssStyles({
					left: `${startX - 50}px`,
					top: `${startY - 20}px`,
					width: `${taskEl.offsetWidth}px`,
				});
				document.body.appendChild(clone);
				this.touchClone = clone;

				taskEl.addClass("em-dragging");

				if (navigator.vibrate) {
					navigator.vibrate(50);
				}
			}, 250);
		};

		const onTouchMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			const dx = Math.abs(touch.clientX - startX);
			const dy = Math.abs(touch.clientY - startY);

			// Cancel drag initiation if finger moves too much before timeout
			if (!isDragging && (dx > 10 || dy > 10)) {
				if (this.touchTimeout !== null) {
					clearTimeout(this.touchTimeout);
					this.touchTimeout = null;
				}
				return;
			}

			if (!isDragging || !this.touchClone) return;

			e.preventDefault(); // Prevent scrolling while dragging

			this.touchClone.setCssStyles({
				left: `${touch.clientX - 50}px`,
				top: `${touch.clientY - 20}px`,
			});

			// Highlight quadrant under finger
			const targetQuadrant = this.getQuadrantAtPoint(touch.clientX, touch.clientY);
			this.contentEl.querySelectorAll(".em-quadrant").forEach((el) => {
				(el as HTMLElement).removeClass("em-drop-target");
			});
			if (targetQuadrant) {
				const targetEl = this.contentEl.querySelector(`[data-quadrant="${targetQuadrant}"]`);
				if (targetEl) {
					(targetEl as HTMLElement).addClass("em-drop-target");
				}
			}
		};

		const onTouchEnd = (e: TouchEvent) => {
			if (this.touchTimeout !== null) {
				clearTimeout(this.touchTimeout);
				this.touchTimeout = null;
			}

			if (!isDragging || !this.draggedTaskId) {
				this.cleanupTouchDrag();
				return;
			}

			const touch = e.changedTouches[0];
			const targetQuadrant = this.getQuadrantAtPoint(touch.clientX, touch.clientY);

			if (targetQuadrant && this.draggedTaskId) {
				const task = this.plugin.data.tasks.find((t) => t.id === this.draggedTaskId);
				if (task && task.quadrant !== targetQuadrant) {
					this.plugin.moveTask(this.draggedTaskId, targetQuadrant);
					void this.plugin.savePluginData();
				}
			}

			isDragging = false;
			this.cleanupTouchDrag();
			this.renderMatrix();
		};

		const onTouchCancel = () => {
			if (this.touchTimeout !== null) {
				clearTimeout(this.touchTimeout);
				this.touchTimeout = null;
			}
			isDragging = false;
			this.cleanupTouchDrag();
		};

		taskEl.addEventListener("touchstart", onTouchStart, { passive: true });
		taskEl.addEventListener("touchmove", onTouchMove, { passive: false });
		taskEl.addEventListener("touchend", onTouchEnd);
		taskEl.addEventListener("touchcancel", onTouchCancel);
	}

	private cleanupTouchDrag(): void {
		if (this.touchClone) {
			this.touchClone.remove();
			this.touchClone = null;
		}
		if (this.draggedEl) {
			this.draggedEl.removeClass("em-dragging");
			this.draggedEl = null;
		}
		this.draggedTaskId = null;

		this.contentEl.querySelectorAll(".em-drop-target").forEach((el) => {
			(el as HTMLElement).removeClass("em-drop-target");
		});
	}

	private getQuadrantAtPoint(x: number, y: number): Quadrant | null {
		const quadrants = this.contentEl.querySelectorAll(".em-quadrant");
		for (const qEl of Array.from(quadrants)) {
			const rect = qEl.getBoundingClientRect();
			if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
				return qEl.getAttribute("data-quadrant") as Quadrant;
			}
		}
		return null;
	}

}

// ==================== EXPORTED UTILITIES ====================

export function formatDueDate(dateStr: string): string {
	const date = new Date(dateStr + "T00:00:00");
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const diffMs = date.getTime() - today.getTime();
	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays === -1) return "Yesterday";
	if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
	if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
	});
}

export function isDueDatePast(dateStr: string): boolean {
	const date = new Date(dateStr + "T23:59:59");
	return date < new Date();
}
