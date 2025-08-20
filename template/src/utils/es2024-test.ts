/**
 * ES2024の新機能テスト
 */

// Array.groupBy のテスト（ES2024の新機能）
export function testES2024Features() {
    // Promise.withResolvers（ES2024）
    const { promise, resolve, reject } = Promise.withResolvers<string>();
    
    // Array.fromAsync のシミュレーション（実際にはまだ実装されていない可能性があるのでコメントアウト）
    // const asyncArray = await Array.fromAsync(asyncIterable);
    
    // Temporal API の例（まだ実装されていない可能性があるのでコメントアウト）
    // const now = Temporal.Now.plainDateTimeISO();
    
    // Regular Expression v flag（ES2024）
    const regex = /[\p{Script=Latin}&&\p{Letter}]/v;
    
    // Array.toSorted, toReversed などの新しいメソッド（ES2023だが使用可能）
    const numbers = [3, 1, 4, 1, 5];
    const sorted = numbers.toSorted();
    const reversed = numbers.toReversed();
    
    console.log('ES2024 features test:');
    console.log('- Promise.withResolvers:', typeof resolve === 'function');
    console.log('- Regex v flag test:', regex.test('a'));
    console.log('- Array.toSorted:', sorted);
    console.log('- Array.toReversed:', reversed);
    
    // Promise を解決
    resolve('ES2024 test completed');
    
    return promise;
}

// Object.groupBy のテスト（ES2024）
export function testGroupBy() {
    const inventory = [
        { name: 'asparagus', type: 'vegetables', quantity: 5 },
        { name: 'bananas', type: 'fruit', quantity: 0 },
        { name: 'goat', type: 'meat', quantity: 23 },
        { name: 'cherries', type: 'fruit', quantity: 5 },
        { name: 'fish', type: 'meat', quantity: 22 }
    ];
    
    // Object.groupBy（ES2024）
    const grouped = Object.groupBy(inventory, item => item.type);
    
    console.log('Object.groupBy result:', grouped);
    
    return grouped;
}