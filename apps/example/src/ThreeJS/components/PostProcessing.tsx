import * as THREE from "three";
import { pass, mrt, output, blendColor } from "three/tsl";
import { bloom } from "BloomNode";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export function WebGPUPostProcessing({ strength = 2.5, radius = 0.5 }) {
  const { gl: renderer, scene, camera, size } = useThree();
  const postProcessingRef = useRef<THREE.PostProcessing | null>();

  useEffect(() => {
    if (!renderer || !scene || !camera) return;

    const scenePass = pass(scene, camera, {
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
    });

    scenePass.setMRT(mrt({ output: output }));

    const scenePassColor = scenePass.getTextureNode("output");

    const bloomPass = bloom(scenePassColor, strength, radius);

    const outputNode = blendColor(scenePassColor, bloomPass);

    const postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [renderer, scene, camera, size, strength, radius]);

  useFrame(({ gl }) => {
    if (postProcessingRef.current) {
      gl.clear();
      postProcessingRef.current.render();
    }
  }, 1);

  return null;
}
