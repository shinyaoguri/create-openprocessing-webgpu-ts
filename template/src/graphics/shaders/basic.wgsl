struct Uniforms {
  time: f32,
  width: f32,
  height: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>( 0.0,  0.5),
    vec2<f32>(-0.5, -0.5),
    vec2<f32>( 0.5, -0.5)
  );
  
  var output: VertexOutput;
  
  // 現在の画面アスペクト比を計算
  let aspect = uniforms.width / uniforms.height;
  
  // 頂点位置を取得
  var vertex_pos = pos[vertex_index];
  
  // アスペクト比補正：三角形の形状を維持
  if (aspect > 1.0) {
    // 横長画面：X座標をアスペクト比で割って三角形を正しい比率に
    vertex_pos.x /= aspect;
  } else {
    // 縦長画面：Y座標にアスペクト比をかけて三角形を正しい比率に
    vertex_pos.y *= aspect;
  }
  
  output.position = vec4<f32>(vertex_pos, 0.0, 1.0);
  output.uv = pos[vertex_index] + vec2<f32>(0.5);
  return output;
}

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let time = uniforms.time;
  let color = vec3<f32>(
    sin(time + uv.x * 3.14159) * 0.5 + 0.5,
    sin(time + uv.y * 3.14159) * 0.5 + 0.5,
    sin(time + (uv.x + uv.y) * 3.14159) * 0.5 + 0.5
  );
  return vec4<f32>(color, 1.0);
} 