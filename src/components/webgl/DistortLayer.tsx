"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { distortFragment, distortVertex } from "@/lib/shaders/distort";
import { pointer } from "@/features/cursor/Cursor";
import { clamp, lerp } from "@/lib/animation/config";

/**
 * One WebGL canvas for every image marked with data-distort. On hover the canvas moves *into* that element
 * (so it inherits the element's 3D transforms) and redraws the image with a velocity-driven distortion.
 * When the pointer rests, the strength falls to zero, the canvas fades out and the loop stops.
 */
export default function DistortLayer() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .25s;z-index:1";

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uImage: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2() },
      uStrength: { value: 0 },
      uTime: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: distortVertex, fragmentShader: distortFragment });
    const geometry = new THREE.PlaneGeometry(1, 1);
    scene.add(new THREE.Mesh(geometry, material));

    const loader = new THREE.TextureLoader();
    const cache = new Map<string, THREE.Texture>();
    let active: HTMLElement | null = null;
    let raf = 0;
    let w = 0;
    let h = 0;
    const start = performance.now();

    const loop = () => {
      const hovering = !!active;
      const target = hovering ? clamp(pointer.speed / 30, 0, 1) : 0;
      uniforms.uStrength.value = lerp(uniforms.uStrength.value, target, 0.1);
      uniforms.uVelocity.value.x = lerp(uniforms.uVelocity.value.x, clamp(pointer.vx / 40, -1, 1), 0.12);
      uniforms.uVelocity.value.y = lerp(uniforms.uVelocity.value.y, clamp(-pointer.vy / 40, -1, 1), 0.12);
      uniforms.uTime.value = (performance.now() - start) / 1000;

      const host = canvas.parentElement;
      if (host) {
        const r = host.getBoundingClientRect();
        uniforms.uMouse.value.set((pointer.x - r.left) / r.width, 1 - (pointer.y - r.top) / r.height);
        if (host.offsetWidth !== w || host.offsetHeight !== h) {
          w = host.offsetWidth;
          h = host.offsetHeight;
          renderer.setSize(w, h, false);
          uniforms.uPlane.value.set(w, h);
        }
      }
      const visible = uniforms.uStrength.value > 0.015 && !!uniforms.uTexture.value;
      canvas.style.opacity = visible ? "1" : "0";
      if (visible) renderer.render(scene, camera);

      if (hovering || uniforms.uStrength.value > 0.002) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
        canvas.remove();
      }
    };

    const activate = (el: HTMLElement) => {
      const img = el.querySelector("img");
      if (!img) return;
      active = el;
      const src = img.currentSrc || img.src;
      const apply = (tex: THREE.Texture) => {
        if (active !== el) return;
        uniforms.uTexture.value = tex;
        const image = tex.image as HTMLImageElement;
        uniforms.uImage.value.set(image.naturalWidth || image.width, image.naturalHeight || image.height);
      };
      const cached = cache.get(src);
      if (cached) apply(cached);
      else
        loader.load(src, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          cache.set(src, tex);
          apply(tex);
        });
      if (canvas.parentElement !== el) {
        uniforms.uStrength.value = 0;
        el.appendChild(canvas);
        w = 0;
        h = 0;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-distort]");
      if (el && el !== active) activate(el);
      else if (!el) active = null;
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(raf);
      canvas.remove();
      cache.forEach((t) => t.dispose());
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return null;
}
