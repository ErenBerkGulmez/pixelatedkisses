import { GRID_SIZE } from '../data/constants';

export const getNextStep = (start, target, world, occupiedTiles) => {
  if (Math.abs(start.x - target.x) + Math.abs(start.y - target.y) === 1) return target;

  const openSet = [{ x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null }];
  const closedSet = new Set();

  while (openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) lowestIndex = i;
    }
    
    const current = openSet[lowestIndex];
    const currentKey = `${current.x},${current.y}`;

    if (current.x === target.x && current.y === target.y) {
      let temp = current;
      while (temp.parent && temp.parent.parent) {
        temp = temp.parent;
      }
      return { x: temp.x, y: temp.y };
    }

    openSet.splice(lowestIndex, 1);
    closedSet.add(currentKey);

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    for (let neighbor of neighbors) {
      const nKey = `${neighbor.x},${neighbor.y}`;
      
      if (neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= GRID_SIZE || neighbor.y >= GRID_SIZE) continue;
      if (world[neighbor.y][neighbor.x] === 'wall') continue;
      if (closedSet.has(nKey)) continue;
      if (occupiedTiles.has(nKey) && !(neighbor.x === target.x && neighbor.y === target.y)) continue;

      const gScore = current.g + 1;
      let gScoreIsBest = false;
      const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!existingNode) {
        gScoreIsBest = true;
        neighbor.h = Math.abs(neighbor.x - target.x) + Math.abs(neighbor.y - target.y);
        neighbor.parent = current;
        openSet.push(neighbor);
      } else if (gScore < existingNode.g) {
        gScoreIsBest = true;
      }

      if (gScoreIsBest) {
        const node = existingNode || neighbor;
        node.parent = current;
        node.g = gScore;
        node.f = node.g + node.h;
      }
    }
  }
  return { x: start.x, y: start.y };
};