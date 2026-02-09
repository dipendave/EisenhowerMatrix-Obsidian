export class Plugin {
	app: any = { workspace: { getLeavesOfType: () => [], getLeaf: () => ({}) } };
	manifest: any = {};

	constructor(app: any, manifest: any) {
		this.app = app || this.app;
		this.manifest = manifest || this.manifest;
	}

	loadData(): Promise<any> {
		return Promise.resolve(null);
	}

	saveData(_data: any): Promise<void> {
		return Promise.resolve();
	}

	registerView() {}
	addRibbonIcon() {}
	addCommand() {}
}

export class ItemView {
	leaf: any;
	contentEl: any = { empty: () => {}, addClass: () => {}, createDiv: () => ({}) };

	constructor(leaf: any) {
		this.leaf = leaf;
	}

	getViewType(): string {
		return "";
	}

	getDisplayText(): string {
		return "";
	}

	getIcon(): string {
		return "";
	}
}

export class WorkspaceLeaf {}
