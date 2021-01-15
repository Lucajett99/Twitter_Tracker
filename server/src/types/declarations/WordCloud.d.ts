declare module 'word-freq' {
    export function freq(text: string, noStopWords?: boolean, shouldStem?: boolean): { [key: string]: number };
    export function tokenise(text: string, noStopWords?: boolean): string[];
    export function stem(text:string, noStopWords?: boolean): string[];
}

declare module 'convert-svg-to-png' {
    export function convert(input: string, options?: any): Buffer;
}