// CoRe Challenge 2022 ISR (Token Jumping) solver (IDA*) - TypeScript port
// Original: idastar.cpp

const WORD_BITS = 32;

class BitsetDyn {
    n: number = 0;
    W: number = 0;
    w: Uint32Array = new Uint32Array(0);

    constructor(n: number = 0) {
        if (n > 0) this.init(n);
    }

    init(n: number): void {
        this.n = n;
        this.W = Math.ceil(n / WORD_BITS);
        this.w = new Uint32Array(this.W);
    }

    test(i: number): boolean {
        return ((this.w[i >>> 5] >>> (i & 31)) & 1) === 1;
    }

    set1(i: number): void {
        this.w[i >>> 5] |= (1 << (i & 31));
    }

    set0(i: number): void {
        this.w[i >>> 5] &= ~(1 << (i & 31));
    }

    popcount(): number {
        let s = 0;
        for (let i = 0; i < this.W; i++) {
            let x = this.w[i];
            // Brian Kernighan's algorithm
            while (x) {
                x &= (x - 1);
                s++;
            }
        }
        return s;
    }

    equals(other: BitsetDyn): boolean {
        if (this.W !== other.W) return false;
        for (let i = 0; i < this.W; i++) {
            if (this.w[i] !== other.w[i]) return false;
        }
        return true;
    }

    clone(): BitsetDyn {
        const b = new BitsetDyn();
        b.n = this.n;
        b.W = this.W;
        b.w = new Uint32Array(this.w);
        return b;
    }
}

function ctz32(x: number): number {
    if (x === 0) return 32;
    let c = 0;
    if ((x & 0x0000FFFF) === 0) { c += 16; x >>>= 16; }
    if ((x & 0x000000FF) === 0) { c += 8; x >>>= 8; }
    if ((x & 0x0000000F) === 0) { c += 4; x >>>= 4; }
    if ((x & 0x00000003) === 0) { c += 2; x >>>= 2; }
    if ((x & 0x00000001) === 0) { c += 1; }
    return c;
}

class Solver {
    n: number = 0;
    W: number = 0;
    adj: Uint32Array[] = [];
    Tbits: BitsetDyn = new BitsetDyn();

    cur: BitsetDyn = new BitsetDyn();
    degTok: Int32Array = new Int32Array(0);
    cur_h: number = 0;

    pathStates: BitsetDyn[] = [];
    last_x: number = -1;
    last_y: number = -1;

    nextBound: number = Number.MAX_SAFE_INTEGER;

    constructor(n: number = 0) {
        if (n > 0) this.init(n);
    }

    init(n: number): void {
        this.n = n;
        this.W = Math.ceil(n / WORD_BITS);
        this.adj = [];
        for (let i = 0; i < n; i++) {
            this.adj.push(new Uint32Array(this.W));
        }
        this.Tbits = new BitsetDyn(n);
        this.cur = new BitsetDyn(n);
        this.degTok = new Int32Array(n);
    }

    addEdge(u: number, v: number): void {
        if (u === v) return;
        this.adj[u][v >>> 5] |= (1 << (v & 31));
        this.adj[v][u >>> 5] |= (1 << (u & 31));
    }

    forEachNeighbor(v: number, cb: (u: number) => void): void {
        const row = this.adj[v];
        for (let b = 0; b < this.W; b++) {
            let x = row[b];
            while (x) {
                const bit = ctz32(x);
                const u = (b << 5) + bit;
                if (u < this.n) cb(u);
                x &= (x - 1);
            }
        }
    }

    computeDegTokFromScratch(): void {
        this.degTok.fill(0);
        for (let b = 0; b < this.W; b++) {
            let x = this.cur.w[b];
            while (x) {
                const bit = ctz32(x);
                const t = (b << 5) + bit;
                if (t < this.n) {
                    this.forEachNeighbor(t, (u) => { this.degTok[u]++; });
                }
                x &= (x - 1);
            }
        }
    }

    isIndependent(S: BitsetDyn): boolean {
        for (let b = 0; b < this.W; b++) {
            let x = S.w[b];
            while (x) {
                const bit = ctz32(x);
                const v = (b << 5) + bit;
                if (v < this.n) {
                    for (let bb = 0; bb < this.W; bb++) {
                        if (this.adj[v][bb] & S.w[bb]) return false;
                    }
                }
                x &= (x - 1);
            }
        }
        return true;
    }

    findOneTokenNeighbor(y: number): number {
        for (let b = 0; b < this.W; b++) {
            const m = this.adj[y][b] & this.cur.w[b];
            if (m) {
                const bit = ctz32(m);
                const x = (b << 5) + bit;
                if (x < this.n) return x;
            }
        }
        return -1;
    }

    inTarget(v: number): boolean { return this.Tbits.test(v); }
    inCur(v: number): boolean { return this.cur.test(v); }

    adjustNeighbors(v: number, delta: number): void {
        this.forEachNeighbor(v, (u) => { this.degTok[u] += delta; });
    }

    computeHFromScratch(): number {
        let h = 0;
        for (let b = 0; b < this.W; b++) {
            const notT = ~this.Tbits.w[b];
            let x = this.cur.w[b] & notT;
            while (x) {
                x &= (x - 1);
                h++;
            }
        }
        return h;
    }

    applyMove(x: number, y: number): void {
        const x_inT = this.inTarget(x);
        const y_inT = this.inTarget(y);
        const delta_h = (y_inT ? 0 : 1) - (x_inT ? 0 : 1);
        this.cur_h += delta_h;

        this.adjustNeighbors(x, -1);
        this.adjustNeighbors(y, +1);

        this.cur.set0(x);
        this.cur.set1(y);
    }

    undoMove(x: number, y: number): void {
        this.cur.set0(y);
        this.cur.set1(x);

        this.adjustNeighbors(y, -1);
        this.adjustNeighbors(x, +1);

        const x_inT = this.inTarget(x);
        const y_inT = this.inTarget(y);
        const delta_h = (y_inT ? 0 : 1) - (x_inT ? 0 : 1);
        this.cur_h -= delta_h;
    }

    collectTokens(): { all: number[], notInT: number[], inT: number[] } {
        const all: number[] = [];
        const notInT: number[] = [];
        const inT: number[] = [];
        for (let b = 0; b < this.W; b++) {
            let x = this.cur.w[b];
            while (x) {
                const bit = ctz32(x);
                const v = (b << 5) + bit;
                if (v < this.n) {
                    all.push(v);
                    if (this.inTarget(v)) {
                        inT.push(v);
                    } else {
                        notInT.push(v);
                    }
                }
                x &= (x - 1);
            }
        }
        return { all, notInT, inT };
    }

    dfs(g: number, bound: number): boolean {
        const f = g + this.cur_h;
        if (f > bound) {
            this.nextBound = Math.min(this.nextBound, f);
            return false;
        }
        if (this.cur.equals(this.Tbits)) return true;

        const tokens = this.collectTokens();

        const ys_T_deg1: number[] = [];
        const ys_T_deg0: number[] = [];
        const ys_N_deg1: number[] = [];
        const ys_N_deg0: number[] = [];

        for (let y = 0; y < this.n; y++) {
            if (this.inCur(y)) continue;
            const d = this.degTok[y];
            if (d === 0) {
                if (this.inTarget(y)) ys_T_deg0.push(y);
                else ys_N_deg0.push(y);
            } else if (d === 1) {
                if (this.inTarget(y)) ys_T_deg1.push(y);
                else ys_N_deg1.push(y);
            }
        }

        const tryMove = (x: number, y: number): boolean => {
            if (this.last_x !== -1 && x === this.last_y && y === this.last_x) return false;

            const prev_last_x = this.last_x, prev_last_y = this.last_y;
            this.last_x = x; this.last_y = y;

            this.applyMove(x, y);
            this.pathStates.push(this.cur.clone());

            const ok = this.dfs(g + 1, bound);

            if (ok) return true;

            this.pathStates.pop();
            this.undoMove(x, y);

            this.last_x = prev_last_x; this.last_y = prev_last_y;
            return false;
        };

        const expandDeg1 = (ys: number[]): boolean => {
            for (const y of ys) {
                const x = this.findOneTokenNeighbor(y);
                if (x < 0) continue;
                if (!this.inCur(x)) continue;
                if (tryMove(x, y)) return true;
            }
            return false;
        };

        const expandDeg0 = (ys: number[]): boolean => {
            for (const y of ys) {
                for (const x of tokens.notInT) {
                    if (tryMove(x, y)) return true;
                }
                for (const x of tokens.inT) {
                    if (tryMove(x, y)) return true;
                }
            }
            return false;
        };

        if (expandDeg1(ys_T_deg1)) return true;
        if (expandDeg0(ys_T_deg0)) return true;
        if (expandDeg1(ys_N_deg1)) return true;
        if (expandDeg0(ys_N_deg0)) return true;

        return false;
    }

    idaStar(): boolean {
        this.cur_h = this.computeHFromScratch();
        let bound = this.cur_h;
        while (true) {
            this.nextBound = Number.MAX_SAFE_INTEGER;
            this.last_x = this.last_y = -1;
            if (this.dfs(0, bound)) return true;
            if (this.nextBound === Number.MAX_SAFE_INTEGER) return false;
            bound = this.nextBound;
        }
    }
}

// Parse .col DIMACS-like format
function parseCol(text: string): { n: number, edges: [number, number][] } | null {
    const lines = text.split('\n');
    let n = -1;
    const edges: [number, number][] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed[0] === 'c') continue;

        const parts = trimmed.split(/\s+/);
        if (parts[0] === 'p') {
            if (/^\d+$/.test(parts[1])) {
                n = parseInt(parts[1], 10);
            } else {
                n = parseInt(parts[2], 10);
            }
        } else if (parts[0] === 'e') {
            const a = parseInt(parts[1], 10) - 1;
            const b = parseInt(parts[2], 10) - 1;
            edges.push([a, b]);
        }
    }

    return n > 0 ? { n, edges } : null;
}

// Parse .dat format
function parseDat(text: string): { S: number[], T: number[] } | null {
    const lines = text.split('\n');
    let S: number[] = [];
    let T: number[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed[0] === 'c') continue;

        const parts = trimmed.split(/\s+/);
        if (parts[0] === 's') {
            S = parts.slice(1).map(v => parseInt(v, 10) - 1);
        } else if (parts[0] === 't') {
            T = parts.slice(1).map(v => parseInt(v, 10) - 1);
        }
    }

    return S.length > 0 && T.length > 0 ? { S, T } : null;
}

function bitsetToSortedVertices1Based(bs: BitsetDyn): number[] {
    const res: number[] = [];
    for (let b = 0; b < bs.W; b++) {
        let x = bs.w[b];
        while (x) {
            const bit = ctz32(x);
            const v = (b << 5) + bit;
            if (v < bs.n) res.push(v + 1);
            x &= (x - 1);
        }
    }
    return res.sort((a, b) => a - b);
}

interface SolveResult {
    success: boolean;
    answer: 'YES' | 'NO';
    path: number[][];
    S: number[];
    T: number[];
    error?: string;
}

function solve(colText: string, datText: string): SolveResult {
    const colData = parseCol(colText);
    if (!colData) {
        return { success: false, answer: 'NO', path: [], S: [], T: [], error: 'Failed to parse .col file' };
    }

    const datData = parseDat(datText);
    if (!datData) {
        return { success: false, answer: 'NO', path: [], S: [], T: [], error: 'Failed to parse .dat file' };
    }

    const { n, edges } = colData;
    const { S, T } = datData;

    if (S.length !== T.length) {
        return { success: false, answer: 'NO', path: [], S: [], T: [], error: '|S| != |T|' };
    }

    const solver = new Solver(n);
    for (const [u, v] of edges) {
        if (0 <= u && u < n && 0 <= v && v < n) {
            solver.addEdge(u, v);
        }
    }

    for (const v of S) solver.cur.set1(v);
    for (const v of T) solver.Tbits.set1(v);

    if (!solver.isIndependent(solver.cur) || !solver.isIndependent(solver.Tbits)) {
        return { success: false, answer: 'NO', path: [], S: [], T: [], error: 'S or T is not an independent set' };
    }

    solver.computeDegTokFromScratch();
    solver.cur_h = solver.computeHFromScratch();

    solver.pathStates = [solver.cur.clone()];

    const ok = solver.idaStar();

    const S1 = S.map(v => v + 1).sort((a, b) => a - b);
    const T1 = T.map(v => v + 1).sort((a, b) => a - b);

    if (!ok) {
        return { success: true, answer: 'NO', path: [], S: S1, T: T1 };
    }

    const path = solver.pathStates.map(st => bitsetToSortedVertices1Based(st));
    return { success: true, answer: 'YES', path, S: S1, T: T1 };
}

function formatOutput(result: SolveResult): string {
    const lines: string[] = [];
    lines.push('c model ISR_TJ');
    lines.push('s ' + result.S.join(' '));
    lines.push('t ' + result.T.join(' '));
    lines.push('a ' + result.answer);
    if (result.answer === 'YES') {
        for (const state of result.path) {
            lines.push('a ' + state.join(' '));
        }
    }
    return lines.join('\n');
}

export { solve, formatOutput, parseCol, parseDat, SolveResult };
