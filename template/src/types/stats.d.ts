// Stats.jsライブラリの型定義
interface StatsPanel {
    dom: HTMLCanvasElement;
    update(value: number, maxValue: number): void;
}

interface Stats {
    // DOMエレメント（統計パネルのHTML要素）
    dom: HTMLDivElement;
    
    // メソッド
    begin(): void;                              // 測定開始
    end(): void;                                // 測定終了
    update(): void;                             // 統計を更新（begin/endの代わりに使用）
    showPanel(panelId: number): void;           // 表示するパネルを選択 (0: fps, 1: ms, 2: mb, 3+: custom)
    addPanel(panel: StatsPanel): StatsPanel;    // カスタムパネルを追加
    
    // プロパティ
    domElement: HTMLDivElement;                 // domの別名（後方互換性）
}

interface StatsConstructor {
    new (): Stats;
    Panel: new (name: string, fg: string, bg: string) => StatsPanel;
}

// グローバルなStats変数の型定義
declare var Stats: StatsConstructor;

// window.Statsの型定義（環境宣言として）
declare interface Window {
    Stats: StatsConstructor;
} 