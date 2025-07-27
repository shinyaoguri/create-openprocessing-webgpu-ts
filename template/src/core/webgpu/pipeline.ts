export interface PipelineResult {
    pipeline: GPURenderPipeline;
    bindGroup: GPUBindGroup;
    uniformBuffer: GPUBuffer;
}

export async function createPipeline(
    device: GPUDevice, 
    format: GPUTextureFormat,
    shaderCode: string
): Promise<PipelineResult> {
    const shaderModule = device.createShaderModule({ code: shaderCode });

    const uniformBuffer = device.createBuffer({
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

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer },
        }],
    });

    const pipeline = device.createRenderPipeline({
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

    return { pipeline, bindGroup, uniformBuffer };
} 