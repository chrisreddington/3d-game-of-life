import { defineStore } from 'pinia'

interface Cell {
  x: number
  y: number
  z: number
  alive: boolean
}

export const useGameStore = defineStore('game', {
  state: () => ({
    cells: new Map<string, Cell>(),
    gridSize: 10,
    running: false,
    generation: 0
  }),
  
  actions: {
    initializeGrid() {
      this.cells.clear()
      for (let x = 0; x < this.gridSize; x++) {
        for (let y = 0; y < this.gridSize; y++) {
          for (let z = 0; z < this.gridSize; z++) {
            const key = `${x},${y},${z}`
            this.cells.set(key, {
              x, y, z,
              alive: Math.random() > 0.8 // 20% chance of being alive initially
            })
          }
        }
      }
    },

    toggleCell(x: number, y: number, z: number) {
      const key = `${x},${y},${z}`
      const cell = this.cells.get(key)
      if (cell) {
        cell.alive = !cell.alive
        this.cells.set(key, cell)
      }
    },

    countNeighbors(x: number, y: number, z: number): number {
      let count = 0
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dy === 0 && dz === 0) continue
            const key = `${x + dx},${y + dy},${z + dz}`
            const neighbor = this.cells.get(key)
            if (neighbor?.alive) count++
          }
        }
      }
      return count
    },

    nextGeneration() {
      const newCells = new Map<string, Cell>()
      
      for (const [key, cell] of this.cells) {
        const neighbors = this.countNeighbors(cell.x, cell.y, cell.z)
        const newCell = { ...cell }
        
        if (cell.alive) {
          // Any live cell with 4-6 neighbors survives (modified for 3D)
          newCell.alive = neighbors >= 4 && neighbors <= 6
        } else {
          // Any dead cell with exactly 5 neighbors becomes alive (modified for 3D)
          newCell.alive = neighbors === 5
        }
        
        newCells.set(key, newCell)
      }
      
      this.cells = newCells
      this.generation++
    },

    toggleRunning() {
      this.running = !this.running
    },

    reset() {
      this.generation = 0
      this.running = false
      this.initializeGrid()
    }
  }
})