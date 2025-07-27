export interface SceneUniforms {
    time: number;
    width: number;
    height: number;
}

export abstract class Scene {
    protected uniforms: SceneUniforms = {
        time: 0,
        width: 0,
        height: 0
    };

    abstract render(device: GPUDevice, context: GPUCanvasContext): void;
    
    updateUniforms(time: number, width: number, height: number): void {
        this.uniforms.time = time;
        this.uniforms.width = width;
        this.uniforms.height = height;
    }

    getUniformsArray(): Float32Array {
        return new Float32Array([
            this.uniforms.time,
            this.uniforms.width,
            this.uniforms.height
        ]);
    }
} 