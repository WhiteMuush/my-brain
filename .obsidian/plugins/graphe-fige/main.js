// Plugin Obsidian qui garde chaque note du graphe à la place où on l'a figée.
const { Plugin, Notice } = require('obsidian');

const CHECK_DELAY_MS = 200;
const STABLE_CHECKS = 3;
const MAX_CHECKS = 30;

function readPositions(nodes) {
    const positions = {};
    for (const node of nodes) positions[node.id] = { x: node.x, y: node.y };
    return positions;
}

function pinAll(renderer, positions) {
    for (const [id, pos] of Object.entries(positions)) {
        renderer.worker.postMessage({ forceNode: { id, x: pos.x, y: pos.y } });
    }
}

function releaseAll(renderer, positions) {
    for (const id of Object.keys(positions)) {
        renderer.worker.postMessage({ forceNode: { id, x: null, y: null } });
    }
}

// Obsidian libère un nœud quand on le lâche, on le rebloque donc à l'endroit du lâcher.
function keepDroppedNodes(renderer, getPositions, onMove) {
    const worker = renderer.worker;
    if (worker.grapheFigePatched) return;
    const post = worker.postMessage.bind(worker);

    worker.postMessage = (message) => {
        const force = message && message.forceNode;
        if (force && force.x === null && force.y === null && getPositions()[force.id]) {
            const node = renderer.nodes.find((n) => n.id === force.id);
            if (node) {
                const pos = { x: node.x, y: node.y };
                onMove(force.id, pos);
                post({ forceNode: { id: force.id, x: pos.x, y: pos.y } });
                return;
            }
        }
        post(message);
    };
    worker.grapheFigePatched = true;
}

// Le graphe crée ses nœuds petit à petit, on attend que leur nombre ne bouge plus.
function whenNodesStable(renderer, onStable, schedule = (fn) => setTimeout(fn, CHECK_DELAY_MS)) {
    let last = -1;
    let same = 0;
    let checks = 0;

    const check = () => {
        checks++;
        const count = renderer.nodes.length;
        same = count > 0 && count === last ? same + 1 : 0;
        last = count;
        if (same >= STABLE_CHECKS) {
            onStable();
            return;
        }
        if (checks < MAX_CHECKS) schedule(check);
    };
    schedule(check);
}

class GrapheFige extends Plugin {
    async onload() {
        const data = await this.loadData();
        this.positions = (data && data.positions) || {};

        this.addCommand({ id: 'figer', name: 'Figer le graphe', callback: () => this.freeze() });
        this.addCommand({ id: 'liberer', name: 'Libérer le graphe', callback: () => this.release() });
        this.registerEvent(this.app.workspace.on('layout-change', () => this.restoreGraphs()));
        this.registerEvent(this.app.vault.on('rename', (file, oldPath) => this.rename(oldPath, file.path)));
        this.app.workspace.onLayoutReady(() => this.restoreGraphs());
    }

    renderers() {
        return this.app.workspace
            .getLeavesOfType('graph')
            .map((leaf) => leaf.view && leaf.view.renderer)
            .filter((renderer) => renderer && renderer.worker && Array.isArray(renderer.nodes));
    }

    restoreGraphs() {
        for (const renderer of this.renderers()) {
            keepDroppedNodes(renderer, () => this.positions, (id, pos) => {
                this.positions[id] = pos;
                this.save();
            });
            if (renderer.grapheFigeRestored) continue;
            renderer.grapheFigeRestored = true;
            whenNodesStable(renderer, () => pinAll(renderer, this.positions));
        }
    }

    async freeze() {
        const [renderer] = this.renderers();
        if (!renderer) {
            new Notice('Ouvre le graphe avant de le figer.');
            return;
        }
        this.positions = readPositions(renderer.nodes);
        pinAll(renderer, this.positions);
        await this.save();
        new Notice(`Graphe figé : ${Object.keys(this.positions).length} notes.`);
    }

    async release() {
        const previous = this.positions;
        this.positions = {};
        for (const renderer of this.renderers()) releaseAll(renderer, previous);
        await this.save();
        new Notice('Graphe libéré.');
    }

    async rename(oldPath, newPath) {
        if (!this.positions[oldPath]) return;
        this.positions[newPath] = this.positions[oldPath];
        delete this.positions[oldPath];
        await this.save();
    }

    save() {
        return this.saveData({ positions: this.positions });
    }
}

GrapheFige.helpers = { readPositions, pinAll, releaseAll, keepDroppedNodes, whenNodesStable };
module.exports = GrapheFige;
