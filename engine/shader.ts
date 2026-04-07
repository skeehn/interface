/**
 * skeehn — WebGL Dither Shader Engine
 *
 * GPU-accelerated Bayer dithering + luminance-to-glyph mapping.
 * Renders image/video sources as real-time ASCII art via fragment shaders.
 *
 * Usage:
 *   const shader = new DitherShader(canvas)
 *   shader.setSource(videoElement)
 *   shader.start()
 */

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const BAYER_DITHER_FRAGMENT = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_threshold;
uniform float u_cellSize;
uniform int u_matrixSize; // 2, 4, or 8

// 4x4 Bayer matrix
float bayer4(vec2 pos) {
  float m[16];
  m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
  m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
  m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
  int x = int(mod(pos.x, 4.0));
  int y = int(mod(pos.y, 4.0));
  int idx = y * 4 + x;
  for (int i = 0; i < 16; i++) {
    if (i == idx) return m[i] / 16.0;
  }
  return 0.0;
}

// 8x8 Bayer matrix
float bayer8(vec2 pos) {
  float x = mod(pos.x, 8.0);
  float y = mod(pos.y, 8.0);
  float a = bayer4(vec2(floor(x / 2.0), floor(y / 2.0)));
  float b = bayer4(vec2(mod(x, 2.0), mod(y, 2.0)));
  return (a * 4.0 + b) / 4.0;
}

void main() {
  vec2 cellPos = floor(gl_FragCoord.xy / u_cellSize);
  vec2 cellUV = cellPos * u_cellSize / u_resolution;
  cellUV.y = 1.0 - cellUV.y;

  vec4 color = texture2D(u_image, cellUV);
  float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

  float bayerVal;
  if (u_matrixSize == 8) {
    bayerVal = bayer8(cellPos);
  } else {
    bayerVal = bayer4(cellPos);
  }

  float dithered = luma + (bayerVal - 0.5) * u_threshold;
  dithered = clamp(dithered, 0.0, 1.0);

  // Quantize to levels (5 levels for block chars)
  float levels = 5.0;
  float quantized = floor(dithered * levels) / levels;

  gl_FragColor = vec4(vec3(quantized), 1.0);
}
`;

const ASCII_OVERLAY_FRAGMENT = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_glyphAtlas;
uniform vec2 u_resolution;
uniform float u_cellSize;
uniform float u_glyphCount;
uniform float u_time;

void main() {
  vec2 cellPos = floor(gl_FragCoord.xy / u_cellSize);
  vec2 cellUV = cellPos * u_cellSize / u_resolution;
  cellUV.y = 1.0 - cellUV.y;

  vec4 color = texture2D(u_image, cellUV);
  float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

  float glyphIdx = floor(luma * (u_glyphCount - 1.0));
  vec2 localUV = fract(gl_FragCoord.xy / u_cellSize);
  vec2 atlasUV = vec2(
    (glyphIdx + localUV.x) / u_glyphCount,
    localUV.y
  );

  vec4 glyph = texture2D(u_glyphAtlas, atlasUV);
  gl_FragColor = vec4(glyph.rgb * color.rgb, glyph.a);
}
`;

export type ShaderMode = 'bayer-dither' | 'ascii-overlay';

export interface DitherShaderOptions {
  cellSize?: number;
  matrixSize?: 4 | 8;
  threshold?: number;
  mode?: ShaderMode;
  glyphRamp?: string;
}

export class DitherShader {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private animFrame: number = 0;
  private startTime: number = 0;
  private source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null = null;
  private options: Required<DitherShaderOptions>;

  constructor(canvas: HTMLCanvasElement, options: DitherShaderOptions = {}) {
    if (typeof document === 'undefined') {
      throw new Error('DitherShader requires a browser environment.');
    }
    this.canvas = canvas;
    this.options = {
      cellSize: options.cellSize ?? 8,
      matrixSize: options.matrixSize ?? 4,
      threshold: options.threshold ?? 0.5,
      mode: options.mode ?? 'bayer-dither',
      glyphRamp: options.glyphRamp ?? ' ░▒▓█',
    };

    this.gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
    if (!this.gl) {
      console.warn('WebGL not available, falling back to Canvas2D.');
      return;
    }
    this._initShader();
  }

  setSource(source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    this.source = source;
  }

  setOption<K extends keyof DitherShaderOptions>(key: K, value: DitherShaderOptions[K]) {
    (this.options as any)[key] = value;
    if (key === 'mode') this._initShader();
  }

  start() {
    if (!this.gl || !this.source) return;
    this.startTime = performance.now();
    this._render();
  }

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.animFrame = 0;
  }

  renderFrame() {
    if (!this.gl || !this.source) return;
    this._updateTexture();
    this._draw();
  }

  destroy() {
    this.stop();
    if (this.gl) {
      if (this.program) this.gl.deleteProgram(this.program);
      if (this.texture) this.gl.deleteTexture(this.texture);
    }
  }

  get isAvailable(): boolean {
    return this.gl !== null;
  }

  private _initShader() {
    const gl = this.gl!;
    if (this.program) gl.deleteProgram(this.program);

    const fragSrc = this.options.mode === 'ascii-overlay'
      ? ASCII_OVERLAY_FRAGMENT
      : BAYER_DITHER_FRAGMENT;

    const vs = this._compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = this._compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    // Setup geometry (fullscreen quad)
    const positions = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const texCoords = new Float32Array([0,0, 1,0, 0,1, 1,1]);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    // Create texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  private _compile(type: number, source: string): WebGLShader | null {
    const gl = this.gl!;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private _updateTexture() {
    const gl = this.gl!;
    if (!this.source || !this.texture) return;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source as any);
  }

  private _draw() {
    const gl = this.gl!;
    if (!this.program) return;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);

    const time = (performance.now() - this.startTime) / 1000;
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_time'), time);
    gl.uniform2f(gl.getUniformLocation(this.program, 'u_resolution'), this.canvas.width, this.canvas.height);
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_cellSize'), this.options.cellSize);
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_threshold'), this.options.threshold);
    gl.uniform1i(gl.getUniformLocation(this.program, 'u_matrixSize'), this.options.matrixSize);

    if (this.options.mode === 'ascii-overlay') {
      gl.uniform1f(gl.getUniformLocation(this.program, 'u_glyphCount'), this.options.glyphRamp.length);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private _render() {
    this._updateTexture();
    this._draw();
    this.animFrame = requestAnimationFrame(() => this._render());
  }
}
