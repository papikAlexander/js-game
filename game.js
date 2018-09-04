'use strict';

class Vector{
    constructor(x = 0, y = 0){
        this.x = x, this.y = y;
    }

    plus(vector){
        if(!(vector instanceof Vector)){
            throw new TypeError();
            
        } else {
            return new Vector(this.x + vector.x, this.y + vector.y);
        }
    }

    times(number){
        return new Vector(this.x * number, this.y * number);
    }
}

class Actor{
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()){
        if(!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)){
            throw new Error();
        } else {

            this.pos = pos;
            this.size = size;
            this.speed = speed;
        }
    }

    act(){
        
    }

    get left(){
        return this.pos.x;
    }

    get right(){
        return this.pos.x + this.size.x;
    }

    get top(){
        return this.pos.y;
    }

    get bottom(){
        return this.pos.y + this.size.y;
    }

    get type(){
        return 'actor';
    }

    isIntersect(actor){
        if(!(actor instanceof Actor)) throw new Error();
        if(actor === this) return false;

        return !(actor.left >= this.right || actor.right <= this.left || actor.top >= this.bottom || actor.bottom <= this.top);
    
    }
}

const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
