import { Scene } from './scene';
import { TriangleGeometry } from '../graphics/geometry';
import { shaders } from '../graphics/shaders';

export class BasicScene extends Scene {
    private pipeline?: GPURenderPipeline;
    private bindGroup?: GPUBindGroup;
    private uniformBuffer?: GPUBuffer;
    private geometry = new TriangleGeometry();

    async initialize(device: GPUDevice, format: GPUTextureFormat): Promise<void> {
        const shaderModule = device.createShaderModule({ 
            code: shaders.basic 
        });

        this.uniformBuffer = device.createBuffer({
            size: 12,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" },
            }],
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        this.bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.uniformBuffer },
            }],
        });

        this.pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [{ format }],
            },
            primitive: { topology: "triangle-list" },
        });
    }

    render(device: GPUDevice, context: GPUCanvasContext): void {
        if (!this.pipeline || !this.bindGroup || !this.uniformBuffer) {
            throw new Error('Scene not initialized');
        }

        device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            this.getUniformsArray()
        );

        const encoder = device.createCommandEncoder();
        const view = context.getCurrentTexture().createView();

        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view,
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }],
        });

        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.draw(this.geometry.vertexCount);
        pass.end();

        device.queue.submit([encoder.finish()]);
    }
} 