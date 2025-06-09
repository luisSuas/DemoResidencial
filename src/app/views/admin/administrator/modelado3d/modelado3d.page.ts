import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonModal,
  IonButton,
  IonButtons
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import * as THREE from 'three';
import { GLTFLoader }          from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls }       from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-modelado3d',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonModal,
    IonButton,
    IonButtons,
    CommonModule,
    FormsModule
  ],
  templateUrl: './modelado3d.page.html',
  styleUrls: ['./modelado3d.page.scss'],
})
export class Modelado3dPage implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private raycaster = new THREE.Raycaster();
  private mouse    = new THREE.Vector2();
  private animId!: number;

  public selectedRoom: {
    id: string;
    status: string;
    maintenance?: string;
  } | null = null;

  ngAfterViewInit() {
    // Dejar un tick para que container tenga dimensiones
    setTimeout(() => {
      console.log('🔴 Iniciando escena 3D');
      this.initThree();
      this.loadModel();
      this.startRendering();
      this.container.nativeElement
        .addEventListener('click', this.onCanvasClick.bind(this));
    }, 0);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    this.container.nativeElement
      .removeEventListener('click', this.onCanvasClick);
  }

  /** Configura escena, cámara y renderer */
  private initThree() {
    const w = this.container.nativeElement.clientWidth;
    const h = this.container.nativeElement.clientHeight;
    console.log(`⚙️ Canvas tamaño: ${w}×${h}`);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.position.set(0, 20, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // Iluminación
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(0, 50, 0);
    this.scene.add(dirLight);
  }

  /** Carga tu hotel.glb y añade controles de órbita */
  private loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      // Ruta relativa sin slash inicial
      'assets/models/Hotel(3star).glb',

      // onLoad: evita el any concreto
      (gltf: any) => {
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.scale.set(1, 1, 1);
        this.scene.add(gltf.scene);
      },

      // onProgress: ProgressEvent genérico
      (evt: ProgressEvent) => {
        const pct = ((evt.loaded / (evt.total || 1)) * 100).toFixed(1);
        console.log(`Modelo cargado: ${pct}%`);
      },

      // onError: ErrorEvent genérico
      (err: ErrorEvent) => {
        console.error('Error cargando Hotel(3star).glb', err);
      }
    );

    // OrbitControls para rotar/zoom
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor  = 0.1;
  }

  /** Bucle de render */
  private startRendering() {
    const loop = () => {
      this.renderer.render(this.scene, this.camera);
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  /** Raycast para detectar clicks en meshes */
  private onCanvasClick(evt: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    if (hits.length) {
      const mesh = hits[0].object;
      this.openModal(mesh.name || 'desconocida');
    }
  }

  /** Abre un modal con la info de la habitación */
  private openModal(roomId: string) {
    this.selectedRoom = {
      id: roomId,
      status: Math.random() > 0.5 ? 'Bueno' : 'En mantenimiento',
      maintenance: 'Tubo roto en baño'
    };
  }

  /** Cierra el modal */
  closeModal() {
    this.selectedRoom = null;
  }
}
