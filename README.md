# create-openprocessing-webgpu-ts

OpenProcessing風のWebGPU + TypeScriptプロジェクトを生成するCLIツールです。現代的なWebGPUレンダリングエンジンを使用した、高性能なビジュアルアート・クリエイティブコーディング環境を簡単に構築できます。

## 🌟 特徴

- **WebGPU**: 最新のGPU APIを使用した高性能レンダリング
- **TypeScript**: 型安全な開発環境
- **OpenProcessing対応**: OpenProcessing.orgでの実行に最適化
- **モジュラー設計**: 拡張しやすいアーキテクチャ
- **開発環境**: ホットリロード対応の開発サーバー

## 📦 インストール

## 🚀 クイックスタート

1. **プロジェクトを作成**
   ```bash
   npx github:shinyaoguri/create-openprocessing-webgpu-ts my-webgpu-project
   cd my-webgpu-project
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

4. **ブラウザでプレビュー**
   - 自動的にブラウザが開きます: http://localhost:8080
   - WebGPU対応ブラウザが必要です

## 📋 利用可能なスクリプト

### 開発モード
```bash
npm run dev
```
- TypeScriptの監視コンパイル
- ファイル変更時の自動リビルド
- 開発サーバーの起動
- ブラウザの自動オープン

### ビルド
```bash
npm run build
```
本番用ファイルを`dist/`フォルダに生成します。
sketch.jsをOpenprocessing.orgにコピー&ペーストすることができます

## 🎨 基本的な使い方

### シンプルなスケッチを作成

`src/sketch.ts`を編集してカスタムビジュアルを作成：

```typescript
import { BasicScene } from './scenes/basic-scene';

// 新しいシーンクラスを作成
class MyScene extends BasicScene {
    updateUniforms(time: number, width: number, height: number): void {
        // アニメーションロジックをここに記述
        this.uniforms.time = Math.sin(time) * 0.5 + 0.5;
        this.uniforms.width = width;
        this.uniforms.height = height;
    }
}
```

### カスタムシェーダーを作成

`src/graphics/shaders/`に新しいWGSLファイルを追加：

```wgsl
// custom.wgsl
struct Uniforms {
    time: f32,
    width: f32,
    height: f32,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    // カスタム頂点シェーダー
}

@fragment
fn fs_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
    // カスタムフラグメントシェーダー
}
```

## 🌐 WebGPU対応ブラウザ

- **Chrome/Chromium**: 113+
- **Edge**: 113+
- **Firefox**: 現在開発版のみ
- **Safari**: Technology Preview

WebGPU対応状況は[caniuse.com](https://caniuse.com/webgpu)で確認できます。

## 📚 参考資料

- [WebGPU API リファレンス](https://www.w3.org/TR/webgpu/)
- [WGSL シェーダー言語仕様](https://www.w3.org/TR/WGSL/)
- [OpenProcessing.org](https://openprocessing.org/)
- [WebGPU Samples](https://webgpu.github.io/webgpu-samples/)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'Add amazing feature'`
4. ブランチをプッシュ: `git push origin feature/amazing-feature`
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## ⚠️ 注意事項

- WebGPUは比較的新しい技術のため、ブラウザ対応状況をご確認ください
- パフォーマンスはGPUの性能に依存します
- 開発版ブラウザでは動作が不安定な場合があります

## 🆘 トラブルシューティング

### WebGPUが利用できない場合
```javascript
if (!navigator.gpu) {
    console.warn("WebGPU is not supported in this browser.");
    // フォールバック処理
}
```

### 開発サーバーが起動しない場合
```bash
# ポート8080が使用中の場合
npm run serve -- --port 3000
```

### TypeScriptコンパイルエラー
```bash
# 型定義を更新
npm install @webgpu/types --save-dev
```

---

🎉 **Happy Creative Coding with WebGPU!** 🎉 
