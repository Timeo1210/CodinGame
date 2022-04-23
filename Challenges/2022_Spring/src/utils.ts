import { Entity } from "./entity";

export class Coord {
  constructor(public x: number, public y: number) {}

  getDistanceFrom(x: Coord["x"], y: Coord["y"]) {
    return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
  }
}

export const nearestMonstersFromEntity = (
  entity: Entity,
  monsters: Entity[]
): Entity[] => {
  return monsters.sort(
    (entity, nextEntity) =>
      entity.getDistanceFrom(entity.coord.x, entity.coord.y) -
      entity.getDistanceFrom(nextEntity.coord.x, nextEntity.coord.y)
  );
};
