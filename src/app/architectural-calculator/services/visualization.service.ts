import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';

export interface VisualizationConfig {
  width: number;
  height: number;
  backgroundColor: number;
  showGrid: boolean;
  showAxes: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VisualizationService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: any = null;

  constructor() { }

  /**
   * Инициализация 3D сцены
   */
  initializeScene(container: ElementRef, config: VisualizationConfig): void {
    // Создание сцены
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.backgroundColor);

    // Создание камеры
    this.camera = new THREE.PerspectiveCamera(
      75,
      config.width / config.height,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // Создание рендерера
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(config.width, config.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Добавление освещения
    this.addLighting();

    // Добавление сетки и осей
    if (config.showGrid) {
      this.addGrid();
    }
    if (config.showAxes) {
      this.addAxes();
    }

    // Добавление рендерера в контейнер
    container.nativeElement.appendChild(this.renderer.domElement);

    // Добавление контролов камеры (OrbitControls)
    this.setupControls();
  }

  /**
   * Создание 3D модели параболы
   */
  createParabolaMesh(span: number, height: number, thickness: number, material: THREE.Material): THREE.Mesh {
    const geometry = this.createParabolaGeometry(span, height, thickness);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Создание 3D модели эллипса
   */
  createEllipseMesh(a: number, b: number, thickness: number, material: THREE.Material): THREE.Mesh {
    const geometry = this.createEllipseGeometry(a, b, thickness);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Создание 3D модели гиперболы
   */
  createHyperbolaMesh(a: number, b: number, thickness: number, material: THREE.Material): THREE.Mesh {
    const geometry = this.createHyperbolaGeometry(a, b, thickness);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Добавление объекта в сцену
   */
  addToScene(object: THREE.Object3D): void {
    if (this.scene) {
      this.scene.add(object);
    }
  }

  /**
   * Удаление объекта из сцены
   */
  removeFromScene(object: THREE.Object3D): void {
    if (this.scene) {
      this.scene.remove(object);
    }
  }

  /**
   * Очистка сцены
   */
  clearScene(): void {
    if (this.scene) {
      // Удаляем все объекты кроме освещения, сетки и осей
      const objectsToRemove: THREE.Object3D[] = [];
      this.scene.traverse((child) => {
        if (child.userData['isCustomObject']) {
          objectsToRemove.push(child);
        }
      });
      objectsToRemove.forEach(obj => this.scene!.remove(obj));
    }
  }

  /**
   * Рендеринг сцены
   */
  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Анимационный цикл
   */
  animate(): void {
    requestAnimationFrame(() => this.animate());
    
    if (this.controls) {
      this.controls.update();
    }
    
    this.render();
  }

  /**
   * Изменение размера рендерера
   */
  resize(width: number, height: number): void {
    if (this.renderer && this.camera) {
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Уничтожение сцены
   */
  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
  }

  // Приватные методы

  private addLighting(): void {
    if (!this.scene) return;

    // Основное освещение
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Направленное освещение
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Дополнительное освещение
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(-10, 10, -10);
    this.scene.add(pointLight);
  }

  private addGrid(): void {
    if (!this.scene) return;

    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
    gridHelper.userData['isGrid'] = true;
    this.scene.add(gridHelper);
  }

  private addAxes(): void {
    if (!this.scene) return;

    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.userData['isAxes'] = true;
    this.scene.add(axesHelper);
  }

  private setupControls(): void {
    // Здесь можно добавить OrbitControls для управления камерой
    // Пока что оставляем базовую функциональность
  }

  private createParabolaGeometry(span: number, height: number, thickness: number): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const segments = 64;
    const halfSpan = span / 2;
    const a = 4 * height / (span * span);

    // Создание вершин для параболы
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * span - halfSpan;
      const y = a * x * x;
      
      // Верхняя поверхность
      vertices.push(x, y, thickness / 2);
      normals.push(0, 0, 1);
      uvs.push(i / segments, 0);
      
      // Нижняя поверхность
      vertices.push(x, y, -thickness / 2);
      normals.push(0, 0, -1);
      uvs.push(i / segments, 1);
    }

    // Создание индексов для треугольников
    for (let i = 0; i < segments; i++) {
      const topLeft = i * 2;
      const topRight = (i + 1) * 2;
      const bottomLeft = i * 2 + 1;
      const bottomRight = (i + 1) * 2 + 1;

      // Верхняя поверхность
      indices.push(topLeft, topRight, bottomLeft);
      indices.push(topRight, bottomRight, bottomLeft);

      // Нижняя поверхность
      indices.push(bottomLeft, bottomRight, topLeft);
      indices.push(bottomRight, topRight, topLeft);
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    geometry.computeVertexNormals();
    return geometry;
  }

  private createEllipseGeometry(a: number, b: number, thickness: number): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const segments = 64;
    const angleStep = (2 * Math.PI) / segments;

    // Создание вершин для эллипса
    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep;
      const x = a * Math.cos(angle);
      const y = b * Math.sin(angle);
      
      // Верхняя поверхность
      vertices.push(x, y, thickness / 2);
      normals.push(0, 0, 1);
      uvs.push(i / segments, 0);
      
      // Нижняя поверхность
      vertices.push(x, y, -thickness / 2);
      normals.push(0, 0, -1);
      uvs.push(i / segments, 1);
    }

    // Создание индексов для треугольников
    for (let i = 0; i < segments; i++) {
      const topLeft = i * 2;
      const topRight = (i + 1) * 2;
      const bottomLeft = i * 2 + 1;
      const bottomRight = (i + 1) * 2 + 1;

      // Верхняя поверхность
      indices.push(topLeft, topRight, bottomLeft);
      indices.push(topRight, bottomRight, bottomLeft);

      // Нижняя поверхность
      indices.push(bottomLeft, bottomRight, topLeft);
      indices.push(bottomRight, topRight, topLeft);
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    geometry.computeVertexNormals();
    return geometry;
  }

  private createHyperbolaGeometry(a: number, b: number, thickness: number): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const segments = 64;
    const maxX = 5 * a;

    // Создание вершин для гиперболы (правая ветвь)
    for (let i = 0; i <= segments; i++) {
      const x = a + (i / segments) * (maxX - a);
      const y = b * Math.sqrt((x * x) / (a * a) - 1);
      
      // Верхняя поверхность
      vertices.push(x, y, thickness / 2);
      normals.push(0, 0, 1);
      uvs.push(i / segments, 0);
      
      // Нижняя поверхность
      vertices.push(x, y, -thickness / 2);
      normals.push(0, 0, -1);
      uvs.push(i / segments, 1);
    }

    // Создание индексов для треугольников
    for (let i = 0; i < segments; i++) {
      const topLeft = i * 2;
      const topRight = (i + 1) * 2;
      const bottomLeft = i * 2 + 1;
      const bottomRight = (i + 1) * 2 + 1;

      // Верхняя поверхность
      indices.push(topLeft, topRight, bottomLeft);
      indices.push(topRight, bottomRight, bottomLeft);

      // Нижняя поверхность
      indices.push(bottomLeft, bottomRight, topLeft);
      indices.push(bottomRight, topRight, topLeft);
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    geometry.computeVertexNormals();
    return geometry;
  }
}
