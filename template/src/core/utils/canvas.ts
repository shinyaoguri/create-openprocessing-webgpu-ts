export function setupCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    
    // WebGPUキャンバスの識別用属性
    canvas.setAttribute('data-webgpu', 'true');
    
    // キャンバスを画面いっぱいに表示するスタイル
    canvas.style.display = 'block';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.margin = '0';
    canvas.style.padding = '0';
    // openprocessing.orgのUIより下に表示
    canvas.style.zIndex = '1';
    
    // 安全にDOMに追加する関数
    function addCanvasToDOM() {
        if (document.body) {
            document.body.appendChild(canvas);
        } else {
            // bodyが存在しない場合の対処
            if (document.readyState === 'loading') {
                // DOMが読み込み中の場合は、DOMContentLoadedを待つ
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.body) {
                        document.body.appendChild(canvas);
                    } else {
                        // それでもbodyがない場合は、documentElementに追加
                        document.documentElement.appendChild(canvas);
                    }
                });
            } else {
                // DOMは読み込み済みだが、bodyが存在しない場合
                setTimeout(() => {
                    if (document.body) {
                        document.body.appendChild(canvas);
                    } else {
                        // 最後の手段：documentElementに追加
                        document.documentElement.appendChild(canvas);
                    }
                }, 10);
            }
        }
    }
    
    addCanvasToDOM();
    return canvas;
}

export function resizeCanvas(
    canvas: HTMLCanvasElement, 
    device: GPUDevice, 
    context: GPUCanvasContext, 
    format: GPUTextureFormat
): void {
    // キャンバスサイズをウィンドウサイズに完全に合わせる
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // デバイスピクセル比を考慮（高DPI対応）
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 実際の描画サイズ
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    
    // CSS表示サイズ
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    context.configure({
        device,
        format,
        alphaMode: "opaque",
    });
} 