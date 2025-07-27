import { initWebGPU } from './core/webgpu/device';
import { setupCanvas, resizeCanvas } from './core/utils/canvas';
import { preloadStats } from './core/utils/stats';
import { BasicScene } from './scenes/basic-scene';

// openprocessing.org対応：再実行時のクリーンアップ
function cleanup() {
    // 既存のWebGPUキャンバスのみを削除（openprocessing.orgのキャンバスは残す）
    const existingCanvases = document.querySelectorAll('canvas[data-webgpu]');
    existingCanvases.forEach(canvas => canvas.remove());
    
    // 既存のstats要素を削除
    const existingStats = document.querySelectorAll('[data-stats]');
    existingStats.forEach(stats => stats.remove());
}

// DOM準備完了を待つ関数
function waitForDOM(): Promise<void> {
    return new Promise((resolve) => {
        if (document.body && document.readyState !== 'loading') {
            resolve();
        } else {
            const checkDOM = () => {
                if (document.body) {
                    resolve();
                } else {
                    setTimeout(checkDOM, 10);
                }
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkDOM);
            } else {
                checkDOM();
            }
        }
    });
}

async function main(stats: Stats) {
    try {
        if (!navigator.gpu) {
            console.warn("WebGPU is not supported in this browser.");
            return;
        }

        // DOM準備完了を待つ
        await waitForDOM();

        const canvas = setupCanvas();
        const { device, context, format } = await initWebGPU(canvas);
        
        // シーンを初期化
        const scene = new BasicScene();
        await scene.initialize(device, format);

        function handleResize() {
            resizeCanvas(canvas, device, context, format);
        }

        window.addEventListener("resize", handleResize);
        handleResize(); // 初回も実行

        // レンダリングループ
        function renderLoop(timeMs: number) {
            try {
                stats.begin();
                
                const time = timeMs * 0.001;
                const width = canvas.width;
                const height = canvas.height;
                
                // シーンのユニフォームを更新
                scene.updateUniforms(time, width, height);
                
                // シーンをレンダリング
                scene.render(device, context);
                
                stats.end();
                requestAnimationFrame(renderLoop);
            } catch (error) {
                console.error('Render loop error:', error);
            }
        }
        requestAnimationFrame(renderLoop);
    } catch (error) {
        console.error('WebGPU initialization error:', error);
    }
}

async function start() {
    try {
        // 再実行時のクリーンアップ
        cleanup();
        
        // DOM準備完了を待つ
        await waitForDOM();
        
        const stats = await preloadStats();
        await main(stats);
    } catch (error) {
        console.error('Application start error:', error);
    }
}

// openprocessing.org環境でのエラーハンドリング
if (typeof window !== 'undefined') {
    // 既存のエラーハンドラーを保存
    const originalErrorHandler = window.onerror;
    const originalRejectionHandler = window.onunhandledrejection;
    
    // カスタムエラーハンドラー
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Script error:', { message, source, lineno, colno, error });
        
        // 元のハンドラーが関数の場合のみ呼び出す
        if (typeof originalErrorHandler === 'function') {
            return originalErrorHandler.call(this, message, source, lineno, colno, error);
        }
        return false;
    };
    
    window.onunhandledrejection = function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        // 元のハンドラーが関数の場合のみ呼び出す
        if (typeof originalRejectionHandler === 'function') {
            return originalRejectionHandler.call(window, event);
        }
        event.preventDefault();
    };
}

// openprocessing.org環境での特別な初期化
if (typeof window !== 'undefined') {
    // ページ読み込み完了後に実行
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
} else {
    // 通常環境では即座に実行
    start();
} 