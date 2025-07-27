export interface WebGPUInitResult {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
}

export async function initWebGPU(canvas: HTMLCanvasElement): Promise<WebGPUInitResult> {
    const context = canvas.getContext("webgpu");
    if (!context) {
        throw new Error("WebGPU context not available");
    }
    
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("WebGPU adapter not found");
    }
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format,
        alphaMode: "opaque",
    });

    return { device, context, format };
} 