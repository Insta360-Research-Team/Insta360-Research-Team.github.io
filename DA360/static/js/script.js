document.addEventListener("DOMContentLoaded", function() {
    var currentIndex = 0;
    var images = document.querySelectorAll(".image");
    var totalImages = images.length;

    function showImage(index) {
        images.forEach((img, i) => {
            img.style.display = i === index ? "block" : "none";
        });
    }

    document.getElementById("next").addEventListener("click", function() {
        currentIndex = (currentIndex + 1) % totalImages;
        showImage(currentIndex);
    });

    document.getElementById("prev").addEventListener("click", function() {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        showImage(currentIndex);
    });

    showImage(currentIndex);
});





import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function createPointCloudViewer(containerId, modelPath, azimuth=70.0, elevation=-90.0, initialDistance = 3) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  container.style.width = '100%';
  container.style.height = '100%';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(
    70,
    container.clientWidth / container.clientHeight,
    0.01,
    1000
  );

  const r = initialDistance;
  const elev = THREE.MathUtils.degToRad(elevation);
  const azim = THREE.MathUtils.degToRad(azimuth);
  camera.position.set(
    r * Math.cos(elev) * Math.cos(azim),
    r * Math.sin(elev),
    r * Math.cos(elev) * Math.sin(azim)
  );
  camera.up.set(0, -1, 0);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const canvas = renderer.domElement;
    // 阻止可能触发轮播切换的常见事件
    ['mousedown', 'mousemove', 'touchstart', 'touchmove'].forEach(eventName => {
        canvas.addEventListener(eventName, function(event) {
            // 立即停止事件进一步传播到父元素（如轮播组件）
            event.stopPropagation();
        });
    });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.update();

  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#333;font-size:14px;';
  loadingDiv.textContent = 'Loading point cloud...';
  container.style.position = 'relative';
  container.appendChild(loadingDiv);

  const loader = new PLYLoader();
  let currentCloud = null;

  loader.load(
    modelPath,
    function(geometry) {
      loadingDiv.remove();

      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      geometry.scale(scale, -scale, -scale);

      let material;
      if (geometry.hasAttribute('color')) {
        material = new THREE.PointsMaterial({
          size: 0.005,
          vertexColors: true,
          sizeAttenuation: true
        });
      } else {
        material = new THREE.PointsMaterial({
          size: 0.005,
          color: new THREE.Color(0x4FACFA),
          sizeAttenuation: true
        });
      }

      if (currentCloud) scene.remove(currentCloud);
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      currentCloud = points;
    },
    function(xhr) {
      if (xhr.total > 0) {
        const percent = Math.round(xhr.loaded / xhr.total * 100);
        loadingDiv.textContent = `Loading... ${percent}%`;
      }
    },
    function(error) {
      loadingDiv.textContent = 'Error loading point cloud';
      loadingDiv.style.color = '#ff3860';
      console.error('Error loading PLY:', error);
    }
  );

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, controls, renderer };
}

export { createPointCloudViewer };



function copyBibtex(event) { // ✅ 添加 event 参数
  const bibtexCode = document.getElementById('bibtex-code').textContent;
  navigator.clipboard.writeText(bibtexCode).then(() => {
    const button = event.currentTarget; // ✅ 现在 event 已定义
    button.innerHTML = '<span class="icon"><i class="fas fa-check"></i></span><span>Copied!</span>';
    button.style.opacity = '1';
    setTimeout(() => {
      button.innerHTML = '<span class="icon"><i class="fas fa-copy"></i></span><span>Copy</span>';
      button.style.opacity = '0.7';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

if (typeof window !== 'undefined') {
  window.copyBibtex = copyBibtex;
  window.createPointCloudViewer = createPointCloudViewer;
}
