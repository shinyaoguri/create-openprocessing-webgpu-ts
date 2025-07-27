const fs = require('fs');
const path = require('path');

/**
 * WebGPUプロジェクトの動的ビルドスクリプト
 * 
 * このスクリプトは以下の変換を行います：
 * 1. src以下の全ファイルを自動検出
 * 2. シェーダーファイル（.wgsl）を文字列として埋め込み
 * 3. 依存関係を解析して適切な順序で統合
 * 4. export/import文を削除してグローバルスコープで利用可能にする
 */

/**
 * ディレクトリを再帰的にスキャンしてファイルを収集
 */
function scanDirectory(dir, extensions = ['.js'], exclude = []) {
    const files = [];
    const rootDir = path.resolve(__dirname, '..');
    
    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const relativePath = path.relative(path.join(rootDir, 'dist'), fullPath);
            
            // 除外パターンをチェック
            if (exclude.some(pattern => relativePath.includes(pattern))) {
                continue;
            }
            
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scan(fullPath);
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push({
                    fullPath,
                    relativePath,
                    name: item,
                    dir: path.dirname(relativePath)
                });
            }
        }
    }
    
    if (fs.existsSync(dir)) {
        scan(dir);
    }
    
    return files;
}

/**
 * シェーダーファイルを自動検出して埋め込み
 */
function embedShaders() {
    const rootDir = path.resolve(__dirname, '..');
    const shaderFiles = scanDirectory(path.join(rootDir, 'src'), ['.wgsl']);
    const shaderMap = {};
    
    shaderFiles.forEach(shader => {
        const content = fs.readFileSync(shader.fullPath, 'utf8');
        const name = path.basename(shader.name, '.wgsl');
        shaderMap[name] = content;
    });
    
    // シェーダーindex.jsファイルを更新
    const shaderIndexFiles = scanDirectory(path.join(rootDir, 'dist'), ['.js']).filter(f => 
        f.relativePath.includes('shaders/index.js')
    );
    
    shaderIndexFiles.forEach(indexFile => {
        let content = fs.readFileSync(indexFile.fullPath, 'utf8');
        
        // import文をconst文に置き換え
        Object.entries(shaderMap).forEach(([name, shaderContent]) => {
            const importRegex = new RegExp(`import ${name}Shader from '\\.\\/.*?${name}\\.wgsl';`, 'g');
            const replacement = `const ${name}Shader = \`${shaderContent.replace(/`/g, '\\`')}\`;`;
            content = content.replace(importRegex, replacement);
        });
        
        fs.writeFileSync(indexFile.fullPath, content);
    });
    
    return shaderMap;
}

/**
 * 依存関係を解析して読み込み順序を決定
 */
function analyzeDependencies(files) {
    const dependencyGraph = new Map();
    const resolved = [];
    const visiting = new Set();
    
    // 各ファイルの依存関係を解析
    files.forEach(file => {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const imports = [];
        
        // import文から依存関係を抽出
        const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]*)['"]/g);
        if (importMatches) {
            importMatches.forEach(match => {
                const pathMatch = match.match(/from\s+['"]([^'"]*)['"]/);
                if (pathMatch) {
                    imports.push(pathMatch[1]);
                }
            });
        }
        
        dependencyGraph.set(file.relativePath, {
            file,
            imports,
            content
        });
    });
    
    // トポロジカルソート（依存関係順）
    function visit(filePath) {
        if (visiting.has(filePath)) {
            return; // 循環依存を回避
        }
        
        const node = dependencyGraph.get(filePath);
        if (!node || resolved.includes(node)) {
            return;
        }
        
        visiting.add(filePath);
        
        // 依存先を先に処理
        node.imports.forEach(importPath => {
            // 相対パスを絶対パスに変換
            let resolvedImportPath = null;
            for (const [key, value] of dependencyGraph.entries()) {
                if (key.includes(importPath) || importPath.includes(path.basename(key, '.js'))) {
                    resolvedImportPath = key;
                    break;
                }
            }
            
            if (resolvedImportPath) {
                visit(resolvedImportPath);
            }
        });
        
        visiting.delete(filePath);
        resolved.push(node);
    }
    
    // 全ファイルを処理
    Array.from(dependencyGraph.keys()).forEach(visit);
    
    return resolved;
}

/**
 * ファイル内容をクリーンアップ
 */
function cleanupContent(content) {
    return content
        .replace(/import\s+.*?\s+from\s+['"][^'"]*['"];\s*/g, '') // import文削除
        .replace(/export\s*\{\s*[^}]*\s*\}\s*from\s*['"][^'"]*['"];\s*/g, '') // re-export削除
        .replace(/export\s*\{\s*[^}]*\s*\};\s*/g, '') // export {}削除
        .replace(/export\s+/g, '') // export キーワード削除
        .replace(/^\s*\/\/.*$/gm, '') // コメント行削除（オプション）
        .replace(/^\s*$/gm, '') // 空行削除（オプション）
        .replace(/super\(\.\.\.arguments\)/g, 'super()') // 構文修正
        .trim();
}

/**
 * メインビルド処理
 */
function build() {
    console.log('🔍 Scanning source files...');
    const rootDir = path.resolve(__dirname, '..');
    
    // 1. シェーダーファイルを埋め込み
    const shaderMap = embedShaders();
    console.log(`📦 Embedded ${Object.keys(shaderMap).length} shader files`);
    
    // 2. JavaScriptファイルを収集（sketch.js以外）
    const allFiles = scanDirectory(path.join(rootDir, 'dist'), ['.js'], ['sketch.js']);
    console.log(`📁 Found ${allFiles.length} module files`);
    
    // 3. 依存関係を解析して順序を決定
    const orderedModules = analyzeDependencies(allFiles);
    console.log(`🔗 Resolved dependency order`);
    
    // 4. 全モジュールの内容を統合
    let combinedContent = '';
    orderedModules.forEach(module => {
        const cleanContent = cleanupContent(module.content);
        if (cleanContent) {
            combinedContent += `// === ${module.file.relativePath} ===\n`;
            combinedContent += cleanContent + '\n\n';
        }
    });
    
    // 5. メインファイル（sketch.js）を処理
    const mainPath = path.join(rootDir, 'dist', 'sketch.js');
    if (fs.existsSync(mainPath)) {
        const mainContent = fs.readFileSync(mainPath, 'utf8');
        const cleanMainContent = cleanupContent(mainContent);
        combinedContent += `// === Main Entry Point ===\n`;
        combinedContent += cleanMainContent;
    }
    
    // 6. 統合されたコードを書き込み
    fs.writeFileSync(mainPath, combinedContent);
    
    // 7. 不要なディレクトリをクリーンアップ
    const dirsToClean = ['core', 'graphics', 'scenes', 'types'];
    dirsToClean.forEach(dir => {
        const dirPath = path.join(rootDir, 'dist', dir);
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    });
    
    console.log('✅ Build completed successfully!');
    console.log(`📦 Combined ${orderedModules.length} modules into sketch.js`);
}

// メイン実行
try {
    build();
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} 