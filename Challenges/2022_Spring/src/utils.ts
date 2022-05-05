import { Entity, EntityType } from "./entity";

export class Coord {
  constructor(public x: number, public y: number) {}

  getDistanceFrom(x: Coord["x"], y: Coord["y"]) {
    return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
  }
}

export const nearestMonstersFromEntity = (
  baseEntity: Entity,
  monsters: Entity[]
): Entity[] => {
  return monsters.sort(
    (entity, nextEntity) =>
      baseEntity.getDistanceFrom(entity.coord.x, entity.coord.y) -
      baseEntity.getDistanceFrom(nextEntity.coord.x, nextEntity.coord.y)
  );
};

export const sortByDistanceFromEntityPure = (array: Entity[], entity: Entity) =>
  [...array].sort(
    (a, b) => entity.getDistanceFromEntity(a) - entity.getDistanceFromEntity(b)
  );

export const getMonstersFromEntities = (entities: Entity[]) =>
  entities.filter(
    (entity) =>
      // entity.type === EntityType.MONSTER && entity.distanceFromMyBase > 5000
      entity.type === EntityType.MONSTER
  );

export const objectMap = (
  obj: { [key: number]: Entity },
  fn: (value: Entity, key: string, index: number) => {}
) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
