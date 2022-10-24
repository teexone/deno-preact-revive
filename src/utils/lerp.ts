export default function lerp(x: number, y: number, p: number) {
    return x + (y - x) * p;
}