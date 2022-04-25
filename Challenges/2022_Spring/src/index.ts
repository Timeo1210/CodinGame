import { Base, BaseType } from "./base";
import { Entity, EntityType } from "./entity";
import {
  getMonstersFromEntities,
  nearestMonstersFromEntity,
  sortByDistanceFromEntityPure,
} from "./utils";

var inputs: string[] = readline().split(" ");
const baseX: number = parseInt(inputs[0]); // The corner of the map representing your base
const baseY: number = parseInt(inputs[1]);
const myBase = new Base(baseX, baseY, BaseType.MY_BASE, 3, 0);
const otherBase =
  myBase.color === "blue"
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
  const entities: Entity[] = [];
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
  // fix hero and otherHero id;
  if (myBase.color === "red") {
    entities.forEach((entity) => {
      if (entity.type === EntityType.OTHER_HERO) entity.id += 3;
      else if (entity.type === EntityType.MY_HERO) entity.id -= 3;
    });
  }

  const myHeros = entities
    .filter((entity) => entity.type === EntityType.MY_HERO)
    .sort((hero, nextHero) => hero.id - nextHero.id);
  const myMonsters = entities.filter(
    (entity) => entity.threatFor === BaseType.MY_BASE
  );

  // clear entitiesTag
  entitiesTag = entitiesTag.filter((entityTag) =>
    myMonsters.find((monster) => monster.id === entityTag.entityId)
  );

  const monstersToHandleByHero: Array<Entity | null> = [null, null, null];
  const myMonstersSortedByDistanceFromBase = myMonsters.sort(
    (entity, nextEntity) =>
      entity.distanceFromMyBase - nextEntity.distanceFromMyBase
  );

  console.error(
    "SORTED:",
    myMonstersSortedByDistanceFromBase.map((monster) => monster.id)
  );

  for (
    let i = 0;
    i < Math.min(myMonstersSortedByDistanceFromBase.length, 3);
    i++
  ) {
    const monsterToAssign = myMonstersSortedByDistanceFromBase[i];
    const nearestHeroes = [...myHeros].sort(
      (hero, nextHero) =>
        hero.getDistanceFromEntity(monsterToAssign) -
        nextHero.getDistanceFromEntity(monsterToAssign)
    );
    console.error(
      `NEAREST FROM ${monsterToAssign.id}:`,
      nearestHeroes.map((hero) => hero.id)
    );
    for (let j = 0; j < nearestHeroes.length; j++) {
      if (monstersToHandleByHero[nearestHeroes[j].id] !== null) continue;
      monstersToHandleByHero[nearestHeroes[j].id] = monsterToAssign;
      break;
    }
  }

  const monsters = getMonstersFromEntities(entities);
  const noHandleHeros: Entity[] = [];
  // populate noHandleHeros
  monstersToHandleByHero.forEach((value, index) => {
    if (value === null) noHandleHeros.push(myHeros[index]);
  });

  for (let i = 0; i < Math.min(monsters.length, noHandleHeros.length); i++) {}

  monstersToHandleByHero.forEach((monsterToHandle, heroIndex) => {
    const myHero = myHeros[heroIndex];

    if (monsterToHandle === null) {
      // WRITES SOME LOGIC HERE
      if (myHero.distanceFromMyBase > 8000)
        console.log(`MOVE ${myBase.coord.x} ${myBase.coord.y}`, "WAIT");
      else if (myMonstersSortedByDistanceFromBase.length <= 2) {
        // FIND NEREST ENTITY
        // CARE ABOUT WIND
        // CLEAN AND CREATE ATTACK BOT OR REALLY DEFENSE GUY
        // IF ENNEMY DISTANCE FROM BASE < ??? USE HERO TO PUSH HIM AWAY
        const monsters = sortByDistanceFromEntityPure(
          getMonstersFromEntities(entities),
          myHero
        );

        if (monsters.length > 0)
          console.log(
            `MOVE ${monsters[0].coord.x} ${monsters[0].coord.y}`,
            "PASSAGR"
          );
        else {
          console.log(
            `MOVE ${myBase.passagrvCoord[heroIndex].x} ${myBase.passagrvCoord[heroIndex].y}`,
            "PASSIF"
          );
        }
      } else {
        console.log(
          `MOVE ${myBase.defendCoord[heroIndex].x} ${myBase.defendCoord[heroIndex].y}`,
          "DEFEND"
        );
      }
    } else if (
      // myHero.distanceFromMyBase < 4500 &&
      myHero.distanceFromMyBase < 6000 &&
      myBase.getMana() > 10 &&
      monsterToHandle.getDistanceFromEntity(myHero) < 1280 &&
      monsterToHandle.shieldLife === 0
    ) {
      // SPELL WIND IF:
      // - In range
      // - Mana is > 10
      // - Hero is in the circle
      // - All nerby monsters has no shield
      console.log(`SPELL WIND ${otherBase.coord.x} ${otherBase.coord.y}`);
      myBase.setMana(myBase.getMana() - 10);
    } else {
      // MOVE TO TARGET MONSTER
      console.log(
        `MOVE ${monsterToHandle.coord.x} ${monsterToHandle.coord.y}`,
        `HERO ${heroIndex}`
      );
    }
  });
}
