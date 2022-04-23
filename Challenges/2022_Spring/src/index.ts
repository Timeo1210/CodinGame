import { Base, BaseType } from "./base";
import { Entity, EntityType } from "./entity";
import { nearestMonstersFromEntity } from "./utils";

var inputs: string[] = readline().split(" ");
const baseX: number = parseInt(inputs[0]); // The corner of the map representing your base
const baseY: number = parseInt(inputs[1]);
const myBase = new Base(baseX, baseY, BaseType.MY_BASE, 3, 0);
const otherBase =
  baseX === 0
    ? new Base(17630, 9000, BaseType.OTHER_BASE, 3, 0)
    : new Base(0, 0, BaseType.OTHER_BASE, 3, 0);

const heroesPerPlayer: number = parseInt(readline()); // Always 3

type EntityTag = {
  tagById: number;
  entityId: number;
};
let entitiesTag: EntityTag[] = [];

// game loop
while (true) {
  for (let i = 1; i < 3; i++) {
    var inputs: string[] = readline().split(" ");
    const health: number = parseInt(inputs[0]); // Your base health
    const mana: number = parseInt(inputs[1]); // Ignore in the first league; Spend ten mana to cast a spell
    if (i === 1) {
      myBase.setMana(mana);
    }
  }
  const entityCount: number = parseInt(readline()); // Amount of heros and monsters you can see
  const entities = [];
  for (let i = 0; i < entityCount; i++) {
    var inputs: string[] = readline().split(" ");
    const newEntity = new Entity(
      parseInt(inputs[0]), // Unique identifier
      parseInt(inputs[1]) as EntityType, // 0=monster, 1=your hero, 2=opponent hero
      parseInt(inputs[2]), // Position of this entity
      parseInt(inputs[3]),
      parseInt(inputs[4]), // Ignore for this league; Count down until shield spell fades
      parseInt(inputs[5]), // Ignore for this league; Equals 1 when this entity is under a control spell
      parseInt(inputs[6]), // Remaining health of this monster
      parseInt(inputs[7]), // Trajectory of this monster
      parseInt(inputs[8]),
      parseInt(inputs[9]), // 0=monster with no target yet, 1=monster targeting a base
      parseInt(inputs[10]), // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither
      myBase
    );
    entities.push(newEntity);
  }

  const myHeros = entities.filter(
    (entity) => entity.type === EntityType.MY_HERO
  );
  const myMonsters = entities.filter(
    (entity) => entity.threatFor === BaseType.MY_BASE
  );

  // clear entitiesTag
  entitiesTag = entitiesTag.filter((entityTag) =>
    myMonsters.find((monster) => monster.id === entityTag.entityId)
  );

  console.error("TAGS:", entitiesTag);
  for (let i = 0; i < 3; i++) {
    const myHero = myHeros[i];
    const myMonstersByDistanceFromBase = myMonsters.sort(
      (entity, nextEntity) =>
        entity.distanceFromMyBase - nextEntity.distanceFromMyBase
    );
    const myMonstersDistancesSorted = myMonsters.sort(
      (a, b) => a.getDistanceFromEntity(myHero) - b.getDistanceFromEntity(b)
    );

    // Calculate next pos
    if (myHero.toMove === null) {
      if (entitiesTag.find((entityTag) => entityTag.tagById === myHero.id)) {
        const nextMonsterTag = entitiesTag.find(
          (entityTag) => entityTag.tagById === myHero.id
        ) as EntityTag;
        const nextMonster = myMonsters.find(
          (monster) => monster.id === nextMonsterTag.entityId
        ) as Entity;
        myHero.setToMove({
          x: nextMonster.coord.x,
          y: nextMonster.coord.y,
        });
      } else if (myMonstersByDistanceFromBase.length === 0) {
        console.error("DEFEND");
        myHero.setToMove(myBase.defendCoord[i]);
      } else {
        const nextMonster = myMonstersByDistanceFromBase.find(
          (entity) =>
            !entitiesTag.some((entityTag) => entityTag.entityId === entity.id)
        );
        if (nextMonster) {
          entitiesTag.push({
            tagById: myHero.id,
            entityId: nextMonster.id,
          }); // clear this array after
          myHero.setToMove({
            x: nextMonster.coord.x,
            y: nextMonster.coord.y,
          });
        }
      }
    }

    // LOSE TARGET WHEN WIND
    // FIND NEAREST ENNEMY AND NEAREST HERO NEXT TO ASSIGN IT
    // WHEN WAIT GO FOR SOME ATTACK
    // LOGIC
    if (
      myHero.distanceFromMyBase < 4500 &&
      myBase.getMana() > 10 &&
      myMonstersDistancesSorted.some((entity) => {
        if (entity.getDistanceFromEntity(myHero) > 1280) return false;
        else if (entity.shieldLife === 0) return true;
        else return false;
      })
    ) {
      // SPELL WIND IF:
      // - In range
      // - Mana is > 10
      // - Hero is in the circle
      // - All nerby monsters has no shield
      console.log(`SPELL WIND ${otherBase.coord.x} ${otherBase.coord.y}`);
      myBase.setMana(myBase.getMana() - 10);
    } else if (myHero.toMove !== null)
      console.log(`MOVE ${myHero.toMove.x} ${myHero.toMove.y}`, `HERO ${i}`);
    else console.log("WAIT");
  }
}
// 3666 3066
