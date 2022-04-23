import { Base, BaseType } from "./base";
import { Coord } from "./utils";

export enum EntityType {
  MONSTER = 0,
  MY_HERO = 1,
  OTHER_HERO = 2,
}

export class Entity {
  public distanceFromMyBase: number;
  public nearBase: boolean;
  public threatFor: BaseType | null;
  public toMove: { x: number; y: number } | null;
  public coord: Coord;

  constructor(
    public id: number,
    public type: EntityType,
    _x: number,
    _y: number,
    public shieldLife: number,
    public isControlled: number,
    public health: number,
    public vx: number,
    public vy: number,
    private _nearBase: number,
    private _threatFor: number,
    private _myBase: Base
  ) {
    this.coord = new Coord(_x, _y);
    this.toMove = null;
    this.distanceFromMyBase = this.getDistanceFrom(
      _myBase.coord.x,
      _myBase.coord.y
    );
    this.nearBase = !!this._nearBase;
    this.threatFor =
      this._threatFor in BaseType ? (this._threatFor as BaseType) : null;
  }
  isDangerousForMyBase() {
    return this.threatFor == this._myBase.type;
  }

  getDistanceFrom(x: number, y: number): number {
    return Math.sqrt(
      Math.pow(x - this.coord.x, 2) + Math.pow(y - this.coord.y, 2)
    );
  }

  getDistanceFromEntity(entity: Entity) {
    return Math.sqrt(
      Math.pow(entity.coord.x - this.coord.x, 2) +
        Math.pow(entity.coord.y - this.coord.y, 2)
    );
  }

  setToMove(value: { x: number; y: number } | null) {
    this.toMove = value;
  }
}
