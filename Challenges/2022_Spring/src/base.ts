import { Coord } from "./utils";

export enum BaseType {
  MY_BASE = 1,
  OTHER_BASE = 2,
}

export class Base {
  public coord: Coord;
  public defendCoord: Coord[];

  constructor(
    _x: number,
    _y: number,
    public type: BaseType,
    private health: number,
    private mana: number
  ) {
    this.coord = new Coord(_x, _y);

    // if (this.coord.x === 0 && this.coord.y === 0)
    //   this.defendCoord = [
    //     new Coord(1300, 4700),
    //     new Coord(3500, 3600),
    //     new Coord(4500, 2000),
    //   ];
    // else
    //   this.defendCoord = [
    //     new Coord(16000, 4300),
    //     new Coord(14000, 5500),
    //     new Coord(13000, 7500),
    //   ];
    if (this.coord.x === 0 && this.coord.y === 0)
      this.defendCoord = [
        new Coord(2000, 6000),
        new Coord(4000, 4500),
        new Coord(5500, 2000),
      ];
    else
      this.defendCoord = [
        new Coord(1500, 3500),
        new Coord(13000, 5000),
        new Coord(12000, 7000),
      ];
  }
  setHealth(value: number) {
    this.health = value;
  }
  setMana(value: number) {
    this.mana = value;
  }
  getMana() {
    return this.mana;
  }
}
