"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { particlesFragment, particlesVertex } from "@/lib/shaders/distort";
import { dprFor } from "@/lib/performance/quality";
import type { Quality } from "@/store/ui";

function Field({ count }: { count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { invalidate, gl } = useThree();
  const target = useRef({ x: 10, y: 10, scroll: 0 });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    // Deterministic pseudo-random numbers: the field looks the same on every visit.
    let s = 7;
    const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 14;
      pos[i * 3 + 1] = (rand() - 0.5) * 10;
      pos[i * 3 + 2] = -rand() * 7;
      size[i] = 1 + rand() * 2.5;
      seed[i] = rand();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(10, 10) },
      uScroll: { value: 0 },
      uPixelRatio: { value: gl.getPixelRatio() },
      uColor: { value: new THREE.Color("#edebe4") },
      uAccent: { value: new THREE.Color("#c6f36b") },
    }),
    [gl],
  );

  // Rendering on demand: the field only moves when the visitor does.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      invalidate();
    };
    const onScroll = () => {
      target.current.scroll = window.scrollY / window.innerHeight;
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [invalidate]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const u = material.current!.uniforms;
    u.uTime.value += Math.min(delta, 0.05);
    const m = u.uMouse.value as THREE.Vector2;
    m.x += (target.current.x - m.x) * 0.08;
    m.y += (target.current.y - m.y) * 0.08;
    const scrollTarget = target.current.scroll * 0.9;
    u.uScroll.value += (scrollTarget - u.uScroll.value) * 0.08;
    const settling = Math.abs(target.current.x - m.x) + Math.abs(target.current.y - m.y) + Math.abs(scrollTarget - u.uScroll.value);
    if (settling > 0.001) invalidate();
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={particlesVertex}
        fragmentShader={particlesFragment}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default function Particles({ quality }: { quality: Quality }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[5]">
      <Canvas
        frameloop="demand"
        dpr={dprFor(quality)}
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <Field count={quality === "high" ? 1400 : 600} />
      </Canvas>
    </div>
  );
}
