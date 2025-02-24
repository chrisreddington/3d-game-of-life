<template>
  <div class="game-container">
    <div ref="container" class="canvas-container"></div>
    <div class="controls">
      <button @click="gameStore.toggleRunning()" :class="{ active: gameStore.running }">
        {{ gameStore.running ? 'Pause' : 'Start' }}
      </button>
      <button @click="handleNextGeneration()" :disabled="gameStore.running">
        Next Generation
      </button>
      <button @click="handleReset()">Reset</button>
      <div class="speed-control">
        <label for="speed">Speed:</label>
        <input 
          type="range" 
          id="speed" 
          v-model="speed" 
          min="50" 
          max="1000" 
          step="50"
          :disabled="!gameStore.running"
        >
        <span class="speed-value">{{ (1000 / speed).toFixed(1) }} gen/s</span>
      </div>
      <span class="generation">Generation: {{ gameStore.generation }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useGameStore } from '@/stores/game'

const container = ref<HTMLDivElement>()
const gameStore = useGameStore()
const speed = ref(200) // Default speed (ms between generations)

// GitHub theme colors
const COLORS = {
  background: '#0d1117',
  cell: '#238636',
  deadCell: '#21262d'
}

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let cubes: THREE.Mesh[] = []
let animationFrameId: number
let lastUpdateTime = 0

// Watch for speed changes
watch(speed, (newSpeed) => {
  // Update will happen on next animation frame automatically
})

const setupScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(COLORS.background)

  const aspect = container.value!.clientWidth / container.value!.clientHeight
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.set(15, 15, 15)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight)
  container.value!.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)

  // Initialize grid
  gameStore.initializeGrid()
  createCubes()
}

const createCubes = () => {
  // Remove existing cubes from the scene
  cubes.forEach(cube => scene.remove(cube))
  cubes = []

  const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
  const aliveMaterial = new THREE.MeshPhongMaterial({ color: COLORS.cell })
  const deadMaterial = new THREE.MeshPhongMaterial({ 
    color: COLORS.deadCell,
    transparent: true,
    opacity: 0.3
  })

  const offset = -gameStore.gridSize / 2

  for (const cell of gameStore.cells.values()) {
    const cube = new THREE.Mesh(geometry, cell.alive ? aliveMaterial : deadMaterial)
    cube.position.set(
      cell.x + offset,
      cell.y + offset,
      cell.z + offset
    )
    scene.add(cube)
    cubes.push(cube)
  }
}

const updateCubes = () => {
  const aliveMaterial = new THREE.MeshPhongMaterial({ color: COLORS.cell })
  const deadMaterial = new THREE.MeshPhongMaterial({ 
    color: COLORS.deadCell,
    transparent: true,
    opacity: 0.3
  })

  let i = 0
  for (const cell of gameStore.cells.values()) {
    cubes[i].material = cell.alive ? aliveMaterial : deadMaterial
    i++
  }
}

const handleNextGeneration = () => {
  gameStore.nextGeneration()
  updateCubes()
}

const handleReset = () => {
  gameStore.reset()
  createCubes() // Recreate all cubes instead of just updating materials
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)

  if (gameStore.running) {
    const currentTime = Date.now()
    if (currentTime - lastUpdateTime >= speed.value) {
      gameStore.nextGeneration()
      updateCubes()
      lastUpdateTime = currentTime
    }
  }
}

onMounted(() => {
  setupScene()
  animate()

  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', onWindowResize)
  renderer.dispose()
})

const onWindowResize = () => {
  if (container.value) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
</script>

<style scoped>
.game-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  width: 100%;
  height: 100%;
  background: #0d1117;
}

.controls {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: rgba(22, 27, 34, 0.9);
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
}

button {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #30363d;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.active {
  background: #238636;
  border-color: #2ea043;
}

.generation {
  color: #c9d1d9;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #c9d1d9;
  font-size: 14px;
}

.speed-control input[type="range"] {
  width: 120px;
  accent-color: #238636;
}

.speed-control input[type="range"]:disabled {
  opacity: 0.5;
}

.speed-value {
  min-width: 5em;
  text-align: left;
}
</style>