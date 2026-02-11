import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargoResponse, ItemWithPositions, Vehicle } from '../../../../generated_services';

@Component({
  selector: 'app-cargo-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cargo-view.html',
  styleUrls: ['./cargo-view.scss'],
})
export class CargoView implements AfterViewInit, OnChanges, OnDestroy {
  @Input() cargo?: CargoResponse | null;
  @Input() vehicle?: Vehicle | null;

  @ViewChild('threeContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  containerWidth  = 700;
  containerHeight = 500;

  private THREE: any = null;
  private renderer: any = null;
  private scene: any = null;
  private camera: any = null;
  private controls: any = null;
  private meshes: any[] = [];
  private rafId: any = null;
  private initDone = false;

  constructor(private ngZone: NgZone) {}

  async ngAfterViewInit() {
    await this.initThree();
    this.initDone = true;
    Promise.resolve().then(() => this.updateScene());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.initDone || !this.scene) return;
    Promise.resolve().then(() => this.updateScene());
  }

  // ─── Init ───────────────────────────────────────────────────────────────────

  private async initThree() {
    this.THREE = await import('three');
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
    const THREE = this.THREE;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Temp camera — will be properly set in updateScene()
    this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 0.1, 1000000);
    this.camera.position.set(100, 100, 200);
    this.camera.lookAt(0, 0, 0);

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(100, 200, 100);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x8899ff, 0.4);
    fill.position.set(-100, 50, -100);
    this.scene.add(fill);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.containerRef.nativeElement.innerHTML = '';
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width  = '100%';
    this.renderer.domElement.style.height = '100%';

    // Debug: report DOM and renderer sizes
    try {
      const c = this.containerRef.nativeElement;
      console.log('[CargoView:init] container client size', c.clientWidth, c.clientHeight);
      console.log('[CargoView:init] canvas css size', this.renderer.domElement.style.width, this.renderer.domElement.style.height);
      const sz = new THREE.Vector2();
      this.renderer.getSize(sz);
      console.log('[CargoView:init] renderer size (px)', sz.x, sz.y);
    } catch (e) {
      console.warn('[CargoView:init] size debug failed', e);
    }

    // OrbitControls — full 3D rotation
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping  = true;
    this.controls.dampingFactor  = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.update();

    this.ngZone.runOutsideAngular(() => this.animate());
  }

  // ─── Scene rebuild ──────────────────────────────────────────────────────────

  private updateScene() {
    if (!this.scene || !this.THREE) return;
    const THREE = this.THREE;

    // Dispose previous meshes
    this.meshes.forEach(obj => {
      this.scene.remove(obj);
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
      else obj.material?.dispose();
    });
    this.meshes = [];

    const items: ItemWithPositions[] = this.cargo?.cargoItems ?? [];

    // ── Derive scene scale from ACTUAL data, not hardcoded defaults ──────────
    //
    // Priority:
    //   1. Use vehicle dimensions if provided and sensible (> 0)
    //   2. Fall back to bounding box of all items
    //   3. Last resort: tiny default so at least something renders
    //
    let vehW = (this.vehicle?.w && this.vehicle.w > 0) ? this.vehicle.w : 0;
    let vehL = (this.vehicle?.l && this.vehicle.l > 0) ? this.vehicle.l : 0;
    let vehH = (this.vehicle?.h && this.vehicle.h > 0) ? this.vehicle.h : 0;

    if (items.length > 0) {
      // Compute bounding box of all placed items
      let maxX = 0, maxY = 0, maxZ = 0;
      items.forEach(it => {
        maxX = Math.max(maxX, (it.positionX ?? 0) + (it.w ?? 0));
        maxY = Math.max(maxY, (it.positionY ?? 0) + (it.l ?? 0));
        maxZ = Math.max(maxZ, (it.positionZ ?? 0) + (it.h ?? 0));
      });

      // If vehicle dims not provided, use item bounding box
      if (vehW === 0) vehW = maxX || 10;
      if (vehL === 0) vehL = maxY || 10;
      if (vehH === 0) vehH = maxZ || 10;
    } else {
      // No items — use small defaults just to show empty container
      if (vehW === 0) vehW = 100;
      if (vehL === 0) vehL = 100;
      if (vehH === 0) vehH = 50;
    }

    console.log(`[CargoView] vehicle: ${vehW} x ${vehL} x ${vehH}, items: ${items.length}`);

    // ── Vehicle container (open-top box) ─────────────────────────────────────
    this.addVehicleBox(THREE, vehW, vehH, vehL);

    // ── Floor grid ───────────────────────────────────────────────────────────
    const gridSize  = Math.max(vehW, vehL);
    const gridDivs  = 10;
    const grid = new THREE.GridHelper(gridSize, gridDivs, 0x555577, 0x333355);
    grid.position.set(0, 0, 0);
    this.scene.add(grid);
    this.meshes.push(grid);

    // ── Cargo items ──────────────────────────────────────────────────────────
    items.forEach((it, idx) => {
      const w = it.w  ?? 1;
      const l = it.l  ?? 1;
      const h = it.h  ?? 1;
      const px = it.positionX ?? 0;
      const py = it.positionY ?? 0;
      const pz = it.positionZ ?? 0;   // vertical / height axis

      // Convert from bottom-left-floor corner → world centre
      // Vehicle is centred at origin; floor is at Y=0
      const cx = px + w / 2 - vehW / 2;
      const cy = pz + h / 2;               // pz is height off floor
      const cz = py + l / 2 - vehL / 2;

      console.log(`[CargoView] item[${idx}] w=${w} l=${l} h=${h} → cx=${cx} cy=${cy} cz=${cz}`);

      const hue = (idx * 47) % 360;

      // Solid box
      const geom = new THREE.BoxGeometry(w, h, l);
      const mat  = new THREE.MeshStandardMaterial({
        color:       new THREE.Color(`hsl(${hue}, 70%, 55%)`),
        metalness:   0.05,
        roughness:   0.6,
        transparent: true,
        opacity:     0.9,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(cx, cy, cz);
      this.scene.add(mesh);
      this.meshes.push(mesh);

      // Edge outline so boxes don't visually merge
      const edges    = new THREE.EdgesGeometry(geom);
      const edgeMat  = new THREE.LineBasicMaterial({ color: 0x000000 });
      const edgeMesh = new THREE.LineSegments(edges, edgeMat);
      edgeMesh.position.copy(mesh.position);
      this.scene.add(edgeMesh);
      this.meshes.push(edgeMesh);
    });

    // ── Auto-fit camera to entire scene ──────────────────────────────────────
    const diag = Math.sqrt(vehW ** 2 + vehL ** 2 + vehH ** 2);
    const dist = diag * 1.6;

    this.camera.position.set(dist * 0.8, dist * 0.6, dist * 1.0);
    this.camera.near   = diag * 0.001;
    this.camera.far    = diag * 50;
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();

    // Debug: camera and renderer state after layout
    try {
      console.log('[CargoView] camera pos', this.camera.position.toArray(), 'near/far', this.camera.near, this.camera.far, 'aspect', this.camera.aspect);
      const rect = this.renderer.domElement.getBoundingClientRect();
      console.log('[CargoView] canvas clientRect', rect.width, rect.height, 'devicePixelRatio', window.devicePixelRatio);
    } catch (e) {
      console.warn('[CargoView] camera debug failed', e);
    }

    // Orbit around the centre of the vehicle volume
    this.controls.target.set(0, vehH / 2, 0);
    this.controls.minDistance = diag * 0.1;
    this.controls.maxDistance = diag * 10;
    this.controls.update();
  }

  // ─── Vehicle box (5 faces, open top) ────────────────────────────────────────

  private addVehicleBox(THREE: any, w: number, h: number, l: number) {
    const wallMat = new THREE.MeshStandardMaterial({
      color:       0x2233aa,
      side:        THREE.DoubleSide,
      transparent: true,
      opacity:     0.12,
    });

    const faces: Array<{ geom: any; pos: [number,number,number]; rot: [number,number,number] }> = [
      { geom: new THREE.PlaneGeometry(w, l), pos: [0,   0,     0  ], rot: [-Math.PI / 2, 0, 0] },  // floor
      { geom: new THREE.PlaneGeometry(w, h), pos: [0,   h / 2, l/2], rot: [0, Math.PI,   0] },      // back
      { geom: new THREE.PlaneGeometry(w, h), pos: [0,   h / 2,-l/2], rot: [0, 0,         0] },      // front
      { geom: new THREE.PlaneGeometry(l, h), pos: [-w/2,h / 2, 0  ], rot: [0, Math.PI/2, 0] },      // left
      { geom: new THREE.PlaneGeometry(l, h), pos: [ w/2,h / 2, 0  ], rot: [0,-Math.PI/2, 0] },      // right
    ];

    faces.forEach(f => {
      const mesh = new THREE.Mesh(f.geom, wallMat);
      mesh.position.set(...f.pos);
      mesh.rotation.set(...f.rot);
      this.scene.add(mesh);
      this.meshes.push(mesh);
    });

    // Blue wireframe outline of full box including top
    const edgesGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, l));
    const edgesMat  = new THREE.LineBasicMaterial({ color: 0x4466ff, linewidth: 2 });
    const outline   = new THREE.LineSegments(edgesGeom, edgesMat);
    outline.position.set(0, h / 2, 0);
    this.scene.add(outline);
    this.meshes.push(outline);
  }

  // ─── Render loop ─────────────────────────────────────────────────────────────

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  ngOnDestroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.meshes.forEach(obj => {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
      else obj.material?.dispose();
    });
    this.renderer?.dispose();
    this.renderer?.forceContextLoss?.();
  }
}