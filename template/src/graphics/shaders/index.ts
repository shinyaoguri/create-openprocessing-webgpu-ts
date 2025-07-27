import basicShader from './basic.wgsl';

export const shaders = {
    basic: basicShader,
} as const;

export type ShaderName = keyof typeof shaders; 