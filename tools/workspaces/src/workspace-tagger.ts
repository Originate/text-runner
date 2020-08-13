export class WorkspaceTagger {
  /** the known workspaces and whether they are tagged right now */
  workspaces: Map<string, boolean>

  constructor(knownWorkspaces: string[]) {
    this.workspaces = new Map()
    for (const knownWorkspace of knownWorkspaces) {
      this.workspaces.set(knownWorkspace, false)
    }
    this.workspaces.set(".", false)
  }

  /** provides the workspace that the given file is in */
  getWorkspace(filepath: string): string {
    for (const workspace of this.workspaces.keys()) {
      if (filepath.startsWith(workspace)) {
        return workspace
      }
    }
    return "."
  }

  /** indicates whether the given workspace is tagged */
  isTagged(workspace: string): boolean {
    return this.workspaces.get(workspace) || false
  }

  /** tags the given workspace */
  tag(workspace: string) {
    if (this.workspaces.has(workspace)) {
      this.workspaces.set(workspace, true)
    } else {
      this.workspaces.set(".", true)
    }
  }

  /** tags the given workspaces */
  tagMany(workspaces: string[]) {
    for (const workspace of workspaces) {
      this.tag(workspace)
    }
  }

  /** provides all tagged workspaces */
  tagged(): string[] {
    const result: string[] = []
    for (const workspace of this.workspaces.keys()) {
      if (this.workspaces.get(workspace)) {
        result.push(workspace)
      }
    }
    return result
  }
}