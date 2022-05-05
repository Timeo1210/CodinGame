import { Base, BaseType } from "./base";
import { Entity, EntityType } from "./entity";
import { getMonstersFromEntities, sortByDistanceFromEntityPure } from "./utils";

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
  const otherHeros = entities
    .filter((entity) => entity.type === EntityType.OTHER_HERO)
    .sort((hero, nextHero) => hero.id - nextHero.id);

  // clear entitiesTag
  entitiesTag = entitiesTag.filter((entityTag) =>
    myMonsters.find((monster) => monster.id === entityTag.entityId)
  );

  const monstersToHandleByHero: Array<Entity | null> = [null, null, null];
  const myMonstersSortedByDistanceFromBase = myMonsters.sort(
    (entity, nextEntity) =>
      entity.distanceFromMyBase - nextEntity.distanceFromMyBase
  );

  // HANDLE ATTACK
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
    for (let j = 0; j < nearestHeroes.length; j++) {
      if (monstersToHandleByHero[nearestHeroes[j].id] !== null) continue;
      monstersToHandleByHero[nearestHeroes[j].id] = monsterToAssign;
      break;
    }
  }

  // HANDLE PASSGRV
  let noHandleMonsters = getMonstersFromEntities(entities).filter((monster) =>
    monstersToHandleByHero.every((monsterHandled) =>
      monsterHandled ? monsterHandled.id !== monster.id : true
    )
  );
  let noHandleHeros: Entity[] = [];
  // populate noHandleHeros
  monstersToHandleByHero.forEach((value, index) => {
    if (value === null) noHandleHeros.push(myHeros[index]);
  });
  console.error(
    "noHandleHeros",
    noHandleHeros.map((hero) => hero.id)
  );

  // HANDLE DEFENSE FOR PASSGRV
  otherHeros.forEach((otherHero) => {
    if (otherHero.distanceFromMyBase < 6000 && noHandleHeros.length > 0) {
      // find nearest hero from otherHero
      const nearestHeroFromOtherHero = sortByDistanceFromEntityPure(
        noHandleHeros,
        otherHero
      )[0];
      if (myBase.color === "red") otherHero.id -= 3;
      monstersToHandleByHero[nearestHeroFromOtherHero.id] = otherHero;

      noHandleHeros = noHandleHeros.filter(
        (hero) => monstersToHandleByHero[hero.id] === null
      );
    }
  });

  while (noHandleHeros.length > 0 && noHandleMonsters.length > 0) {
    if (noHandleHeros.length > 0 && noHandleMonsters.length > 0) {
      const nearestMonsterByHero: { [key: number]: Entity } = {};
      noHandleHeros.forEach((hero) => {
        nearestMonsterByHero[hero.id] = sortByDistanceFromEntityPure(
          noHandleMonsters,
          hero
        )[0];
      });

      const nearestHeroByMonster: { [key: number]: Entity } = {};
      noHandleMonsters.forEach((monster) => {
        nearestHeroByMonster[monster.id] = sortByDistanceFromEntityPure(
          noHandleHeros,
          monster
        )[0];
      });

      if (
        Object.keys(nearestMonsterByHero).length >
        Object.keys(nearestHeroByMonster).length
      ) {
        for (let monsterId in nearestHeroByMonster) {
          const myMonster = noHandleMonsters.find(
            (monster) => monster.id === parseInt(monsterId)
          ) as Entity;
          const nearestHeroFromMonster = nearestHeroByMonster[myMonster.id];
          const nearestMonsterFromNearestHero =
            nearestMonsterByHero[nearestHeroFromMonster.id];
          if (nearestMonsterFromNearestHero.id === myMonster.id) {
            monstersToHandleByHero[nearestHeroFromMonster.id] = myMonster;
          }
        }
      } else {
        for (let heroId in nearestMonsterByHero) {
          const myHero = noHandleHeros.find(
            (hero) => hero.id === parseInt(heroId)
          ) as Entity;
          const nearestMonsterFromHero = nearestMonsterByHero[myHero.id];
          const nearestHeroFromNearestMonster =
            nearestHeroByMonster[nearestMonsterFromHero.id];
          if (nearestHeroFromNearestMonster.id === myHero.id) {
            monstersToHandleByHero[myHero.id] = nearestMonsterFromHero;
          }
        }
      }

      //filter noHandleHeros and noHandleMonsters
      noHandleHeros = noHandleHeros.filter(
        (hero) => monstersToHandleByHero[hero.id] === null
      );
      noHandleMonsters = noHandleMonsters.filter(
        (monster) => !monstersToHandleByHero.includes(monster)
      );
    }
  }

  console.error(
    "monstersToHandleByHero:",
    monstersToHandleByHero.map((monster) => (monster ? monster.id : null))
  );

  monstersToHandleByHero.forEach((monsterToHandle, heroIndex) => {
    const myHero = myHeros[heroIndex];

    if (monsterToHandle === null) {
      // WRITES SOME LOGIC HERE
      if (myHero.distanceFromMyBase > 8000)
        console.log(`MOVE ${myBase.coord.x} ${myBase.coord.y}`, "WAIT");
      else
        console.log(
          `MOVE ${myBase.defendCoord[heroIndex].x} ${myBase.defendCoord[heroIndex].y}`,
          "DEFEND"
        );
    } else if (
      monsterToHandle.getDistanceFromEntity(myHero) < 2200 &&
      monsterToHandle.shieldLife === 0 &&
      monsterToHandle.distanceFromMyBase < 5000 &&
      ((monsterToHandle.type === EntityType.OTHER_HERO &&
        myBase.getMana() > 10) ||
        (monsterToHandle.type === EntityType.MONSTER &&
          myBase.getMana() > 50 &&
          monsterToHandle.getDistanceFromEntity(myHero) > 1280))
    ) {
      // SPELL CONTROL IF:
      // - In range
      // - No shield
      // - distanceFromBase < 4000
      // - IF otherHero:
      //    - Mana > 10
      // - ELSE:
      //    - Mana > 50

      console.log(
        `SPELL CONTROL ${monsterToHandle.id} ${otherBase.coord.x} ${otherBase.coord.y}`
      );
      myBase.setMana(myBase.getMana() - 10);
    } else if (
      myBase.getMana() > 10 &&
      monsterToHandle.getDistanceFromEntity(myHero) < 1280 &&
      monsterToHandle.shieldLife === 0 &&
      ((otherHeros.length > 0 &&
        monsterToHandle.distanceFromMyBase < 4000 &&
        (
          monstersToHandleByHero.filter(
            (monster) => monster !== null
          ) as Entity[]
        ).sort(
          (monster, nextMonster) =>
            monster.distanceFromMyBase - nextMonster.distanceFromMyBase
        )[0].id === monsterToHandle.id) ||
        (otherHeros.length === 0 && monsterToHandle.distanceFromMyBase < 6000))
    ) {
      // SPELL WIND IF:
      //  - Mana is > 10
      //  - Hero in range
      //  - No shield
      //
      //  - IF otherHeros:
      //    - distanceFromBase < 4000
      //    - monsterToHandle nearest from base
      //  - ELSE:
      //    - distanceFromBase < 6000

      console.log(`SPELL WIND ${otherBase.coord.x} ${otherBase.coord.y}`);
      myBase.setMana(myBase.getMana() - 10);
    } else {
      // MOVE TO TARGET MONSTER
      console.log(
        `MOVE ${monsterToHandle.coord.x} ${monsterToHandle.coord.y}`,
        `HERO ${monsterToHandle.id <= 6 ? "DEFEND" : heroIndex}`
      );
    }
  });
}
