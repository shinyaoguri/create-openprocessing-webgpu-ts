export interface Vertex {
    position: [number, number];
    uv: [number, number];
}

export class TriangleGeometry {
    public readonly vertices: Vertex[] = [
        { position: [0.0, 0.5], uv: [0.5, 0.0] },
        { position: [-0.5, -0.5], uv: [0.0, 1.0] },
        { position: [0.5, -0.5], uv: [1.0, 1.0] }
    ];

    public readonly vertexCount = 3;

    getVertexData(): Float32Array {
        const data: number[] = [];
        for (const vertex of this.vertices) {
            data.push(...vertex.position, ...vertex.uv);
        }
        return new Float32Array(data);
    }
} 