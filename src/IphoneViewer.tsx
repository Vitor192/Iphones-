import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

type Finish = {
  id: string;
  name: string;
  hex: string;
};

const finishes: Finish[] = [
  { id: 'black', name: 'Preto', hex: '#303239' },
  { id: 'silver', name: 'Prateado', hex: '#c9cacc' },
  { id: 'glacier', name: 'Glacial', hex: '#a8bdce' },
  { id: 'burgundy', name: 'Bordô', hex: '#752c3c' },
];

const bodyMaterialPattern = /17ProMax_color(?:2|3)?$/i;
const logoMaterialPattern = /17ProMax_Logo$/i;
const modelUrl = `${import.meta.env.BASE_URL}assets/iphone-18-pro-max.glb`;

function setBodyColor(root: THREE.Object3D, finish: Finish) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const update = (material: THREE.Material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      if (!bodyMaterialPattern.test(material.name) && !logoMaterialPattern.test(material.name)) return;
      material.color.set(finish.hex);
      material.needsUpdate = true;
    };
    if (Array.isArray(object.material)) object.material.forEach(update);
    else update(object.material);
  });
}

export default function IphoneViewer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<THREE.Object3D | null>(null);
  const finishRef = useRef<Finish>(finishes[3]);
  const controlsRef = useRef<OrbitControls | null>(null);
  const autoRotateRef = useRef(false);
  const [finish, setFinish] = useState(finishes[3]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [status, setStatus] = useState('Carregando modelo 3D…');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let animationFrame = 0;
    let controls: OrbitControls | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let scene: THREE.Scene | undefined;
    let environment: THREE.Texture | undefined;
    let environmentScene: RoomEnvironment | undefined;
    let resizeObserver: ResizeObserver | undefined;

    const start = () => {
      if (disposed || renderer) return;

      try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
        camera.position.set(0, 0.25, 8.2);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.setAttribute('aria-label', 'Modelo 3D interativo do iPhone 18 Pro Max');
        host.replaceChildren(renderer.domElement);

        const ambient = new THREE.HemisphereLight(0xdde8ff, 0x25212b, 0.28);
        scene.add(ambient);
        scene.environmentIntensity = 0.14;
        const keyLight = new THREE.DirectionalLight(0xfff4e9, 0.8);
        keyLight.position.set(-4, 5, 7);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0x9ebdff, 0.22);
        rimLight.position.set(4, 1.5, -5);
        scene.add(rimLight);

        const pmrem = new THREE.PMREMGenerator(renderer);
        environmentScene = new RoomEnvironment();
        environment = pmrem.fromScene(environmentScene, 0.04).texture;
        scene.environment = environment;
        pmrem.dispose();

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.055;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.autoRotate = autoRotateRef.current;
        controls.autoRotateSpeed = 1.5;
        controlsRef.current = controls;
        controls.minPolarAngle = Math.PI * 0.25;
        controls.maxPolarAngle = Math.PI * 0.75;

        resizeObserver = new ResizeObserver(([entry]) => {
          const width = Math.max(1, entry.contentRect.width);
          const height = Math.max(1, entry.contentRect.height);
          if (!camera) return;
          camera.aspect = width / height;
          camera.position.z = width < 460 ? 9 : 8.2;
          camera.updateProjectionMatrix();
          renderer?.setSize(width, height, false);
        });
        resizeObserver.observe(host);

        new GLTFLoader().load(modelUrl, (gltf) => {
          if (disposed || !scene) return;

          const model = gltf.scene;
          model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const meshSize = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
            if (Math.max(meshSize.x, meshSize.y, meshSize.z) > 20) {
              object.removeFromParent();
              return;
            }
            object.castShadow = true;
            object.receiveShadow = true;
          });

          const bounds = new THREE.Box3().setFromObject(model);
          const center = bounds.getCenter(new THREE.Vector3());
          const size = bounds.getSize(new THREE.Vector3());
          const scale = 4.2 / size.y;
          const pivot = new THREE.Group();
          model.scale.setScalar(scale);
          model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
          pivot.add(model);
          scene.add(pivot);
          rootRef.current = model;
          setBodyColor(model, finishRef.current);
          controls?.target.set(0, 0, 0);
          controls?.update();
          setStatus('Arraste para girar e explorar o modelo em 3D.');
        }, undefined, () => {
          if (!disposed) setStatus('Não foi possível carregar o modelo 3D. Atualize a página e tente novamente.');
        });
      } catch {
        setStatus('Seu navegador não conseguiu iniciar o visualizador 3D.');
      }

      const animate = () => {
        if (disposed || !renderer || !scene || !camera) return;
        animationFrame = window.requestAnimationFrame(animate);
        controls?.update();
        renderer.render(scene, camera);
      };
      animate();
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      start();
      observer.disconnect();
    }, { rootMargin: '1000px' });
    observer.observe(host);

    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(animationFrame);
      controls?.dispose();
      controlsRef.current = null;
      scene?.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      environment?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      rootRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (rootRef.current) setBodyColor(rootRef.current, finish);
  }, [finish]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    document.getElementById('iphone-lab')?.classList.add('visible');
  }, []);

  return (
    <>
      <div className="lab-copy">
        <p className="eyebrow"><i /> EXPERIMENTE O ACABAMENTO</p>
        <h2 id="iphone-lab-title">Seu iPhone.<br /><em>Sua perspectiva.</em></h2>
        <p>Gire o iPhone 18 Pro Max em 3D e veja os acabamentos disponíveis.</p>
        <div className="finish-picker" role="group" aria-label="Escolha a cor do iPhone 18 Pro Max">
          {finishes.map((item) => (
            <button
              className={`finish-swatch${finish.id === item.id ? ' selected' : ''}`}
              key={item.id}
              type="button"
              aria-label={item.name}
              aria-pressed={finish.id === item.id}
              onClick={() => {
                finishRef.current = item;
                setFinish(item);
              }}
              data-finish={item.id}
              style={{ '--swatch-color': item.hex } as CSSProperties}
            ><span /></button>
          ))}
          <span className="finish-name" aria-live="polite">{finish.name}</span>
        </div>
        <div className="lab-controls">
          <button className={`spin-toggle${autoRotate ? ' active' : ''}`} type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)}><span>↻</span> Girar automaticamente</button>
          <span className="drag-hint">↔ ARRASTE PARA GIRAR</span>
        </div>
        <small className="lab-disclaimer">Cores oficiais da Apple; a aparência no visor pode variar conforme a tela e a iluminação 3D.</small>
      </div>
      <div className="phone-stage" role="group" aria-label="Visualizador 3D do iPhone 18 Pro Max. Arraste para girar.">
        <div className="stage-glow" /><div className="stage-ring ring-a" /><div className="stage-ring ring-b" />
        <div className="viewer-canvas-host" ref={hostRef} />
        <span className={`viewer-status${status.startsWith('Arraste') ? ' viewer-ready' : ''}`} role="status">{status}</span>
        <span className="stage-caption">IPHONE 18 PRO MAX <i>·</i> <span className="stage-color">{finish.name.toLocaleUpperCase('pt-BR')}</span></span>
      </div>
    </>
  );
}
