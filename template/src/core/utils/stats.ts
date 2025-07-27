export function preloadStats(): Promise<Stats> {
    return new Promise((resolve) => {
        // 既にStats.jsが読み込まれている場合
        if (typeof window.Stats !== 'undefined') {
            const stats = new window.Stats();
            setupStatsDOM(stats);
            resolve(stats);
            return;
        }

        const script = document.createElement("script");
        script.onload = () => {
            try {
                const stats = new window.Stats();
                setupStatsDOM(stats);
                resolve(stats);
            } catch (error) {
                console.warn('Failed to create Stats instance:', error);
                resolve(createFallbackStats());
            }
        };
        
        script.onerror = () => {
            console.warn('Stats.js failed to load, using fallback');
            resolve(createFallbackStats());
        };
        
        script.src = "https://mrdoob.github.io/stats.js/build/stats.min.js";
        
        // headが存在するかチェック
        if (document.head) {
            document.head.appendChild(script);
        } else {
            // headが存在しない場合は、documentに直接追加
            document.appendChild(script);
        }
    });
}

function setupStatsDOM(stats: Stats): void {
    Object.assign(stats.dom.style, {
        position: "fixed",
        height: "max-content",
        top: "0",
        right: "0",
        zIndex: "9999",
    });
    
    // 安全にDOMに追加する関数
    function addStatsToDOM() {
        // 既存のstats要素を削除（再実行対応）
        const existingStats = document.querySelector('[data-stats]');
        if (existingStats) {
            existingStats.remove();
        }
        
        // stats.domにdata属性を追加（識別用）
        stats.dom.setAttribute('data-stats', 'true');
        
        // bodyが存在するかチェック
        if (document.body) {
            document.body.appendChild(stats.dom);
        } else {
            // bodyが存在しない場合は、DOMContentLoadedを待つ
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.body) {
                        document.body.appendChild(stats.dom);
                    }
                });
            } else {
                // DOMは読み込み済みだが、bodyが存在しない場合
                // 少し待ってから再試行
                setTimeout(() => {
                    if (document.body) {
                        document.body.appendChild(stats.dom);
                    }
                }, 100);
            }
        }
    }
    
    addStatsToDOM();
}

function createFallbackStats(): Stats {
    const fallbackStats = {
        dom: document.createElement('div'),
        begin: () => {},
        end: () => {},
        update: () => {},
        showPanel: () => {},
        addPanel: () => ({ dom: document.createElement('canvas'), update: () => {} }),
        domElement: document.createElement('div')
    };
    return fallbackStats as unknown as Stats;
} 