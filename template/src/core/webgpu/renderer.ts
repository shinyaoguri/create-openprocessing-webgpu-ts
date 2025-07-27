export function renderLoop(
    device: GPUDevice,
    context: GPUCanvasContext,
    pipeline: GPURenderPipeline,
    bindGroup: GPUBindGroup,
    uniformBuffer: GPUBuffer,
    canvas: HTMLCanvasElement,
    stats: any
): void {
    function frame(timeMs: number) {
        stats.begin();
        const time = timeMs * 0.001;
        const width = canvas.width;
        const height = canvas.height;
        device.queue.writeBuffer(
            uniformBuffer,
            0,
            new Float32Array([time, width, height]),
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

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();

        device.queue.submit([encoder.finish()]);
        stats.end();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
} 