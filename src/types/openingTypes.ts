interface line {
    id: string;
    name: string;
    moves: string[];
}

interface opening {
    id: string;
    name: string;
    color: 'white' | 'black';
    description: string;
    lines: line[];
};
export type { opening, line };