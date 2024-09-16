import React, { useEffect, useRef } from "react";
import * as BABYLON from "babylonjs";

const Canvas3D = ({ textureUrl }) => {
  console.log(textureUrl);
  
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera(
      "camera1",
      Math.PI / 2,
      Math.PI / 4,
      4,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    const box = BABYLON.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, scene);

    const applyTexture = () => {
      const material = new BABYLON.StandardMaterial("mapTexture", scene);

      material.diffuseTexture = new BABYLON.Texture(textureUrl, scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
      
      material.specularColor = new BABYLON.Color3(0, 0, 0); 
      material.backFaceCulling = false; 
      material.diffuseTexture.uScale = 1; 
      material.diffuseTexture.vScale = 1;

      box.material = material;
    };

    if (textureUrl) {
      applyTexture();
    }

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
    };
  }, [textureUrl]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "400px" }} />;
};

export default Canvas3D;
