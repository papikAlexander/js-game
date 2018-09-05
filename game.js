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
            this._type = 'actor';
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
        return this._type;
    }

    isIntersect(actor){
        if(!(actor instanceof Actor)) throw new Error();
        if(actor === this) return false;

        return !(actor.left >= this.right || actor.right <= this.left || actor.top >= this.bottom || actor.bottom <= this.top);
    
    }
}

class Level{
    constructor(grid = [], actors = []){
        this.grid = grid;
        this.actors = actors;
        this.height = grid.length;
        this.width = grid.reduce((res, count) => (res < count.length) ? count.length : res, 0);
        this.status = null;
        this.finishDelay = 1;
        this.player = actors.find(element => element.type == 'player');
    }

    isFinished(){
        return (this.status != null && this.finishDelay < 0);
    }

    actorAt(actor){
        if(actor == undefined || !(actor instanceof Actor)) throw new Error();

        return  this.actors.find(element => element.isIntersect(actor)) 
    }

    isObstable(x, y){
        return (this.grid[y] && this.grid[y][x] && ((this.grid[y][x] === 'wall') || (this.grid[y][x] === 'lava')));
    }

    obstacleAt(pos, size){
        if(!(pos instanceof Vector) || !(size instanceof Vector)) throw new Error();
        
        const left = Math.floor(pos.x);
        const top = Math.floor(pos.y);
        const right = Math.floor(pos.x) + Math.floor(size.x);
        const bottom = Math.floor(pos.y) + Math.floor(size.y);
        

        if(bottom > this.height) {
            return 'lava';

        } else if((left < 0) || (right > this.width) || top < 0){
            return 'wall';

        } else if(this.isObstable(left, top)){
            return this.grid[top][left];

        } else if(this.isObstable(left, bottom)){
            return this.grid[bottom][left];

        } else if(this.isObstable(right, top)){
            return this.grid[top][right];
            
        } else if(this.isObstable(right, bottom)){
            return this.grid[bottom][right];
        }
        
    }

    removeActor(actor){
        this.actors.splice(this.actors.findIndex(element => element === actor), 1)   
    }

    noMoreActors(type){
        return !this.actors.some(element => (element.type == type));
    }

    playerTouched(obstacle, actor){
        if(obstacle === 'lava' || obstacle === 'fireball') {
            this.status = 'lost';
        } else if(obstacle === 'coin'){
            this.removeActor(actor);
            if(this.noMoreActors('coin')){
                this.status = 'won';
            }
        }
    }

}

class Player extends Actor{
    constructor(location) {
        super(location, new Vector(0.8, 1.5));
        this._type = 'player';
        this.pos.y -= 0.5;
    }
}

class LevelParser{
    constructor(symbols){
        this.symbols = symbols;
    }

    actorFromSymbol(symbol){
        if(!symbol) return undefined;
        return this.symbols[symbol];
    }

    obstacleFromSymbol(symbol){
        switch (symbol) {
            case 'x':
                return 'wall';
            case '!':
                return 'lava';
            default:
                return undefined;
        }
    }
    
    createGrid(obstacles){
        return obstacles.map(element => {
            let arr = [];
            for (const symbol of element) {
                arr.push(this.obstacleFromSymbol(symbol));
            }
            return arr;    
        });
    }

    createActors(entities){

        let mas = entities.map(str => str.split(''));
        let actors = [];

        mas.forEach((row, y) => {
            row.forEach((element, x) => {
                if(this.symbols && this.symbols[element] && typeof this.actorFromSymbol(element) === 'function'){
                    let actor = new this.symbols[element](new Vector(x, y));
                    if(actor instanceof Actor){
                        actors.push(actor);
                    }
                    
                }
            });
        });
        
        return actors;
    }

    parse(plan) {
        return new Level(this.createGrid(plan), this.createActors(plan));
    }

}

class Fireball extends Actor{
    constructor(pos, speed){
        super(pos, new Vector(1, 1) ,speed);
        this._type = 'fireball';
    }

    getNextPosition(time = 1){
        return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
    }



    handleObstacle(){
        this.speed.x = this.speed.x * (-1);
        this.speed.y = this.speed.y * (-1);
    }

    act(time, level){
        let nextPos = this.getNextPosition(time);

        if(level.obstacleAt(nextPos, this.size) == undefined){
            this.pos = nextPos;
        } else {
            this.handleObstacle();
        }
    }

}

class HorizontalFireball extends Fireball{
    constructor(pos){
        super(pos, new Vector(2, 0));
    }
}

class VerticalFireball extends Fireball{
    constructor(pos){
        super(pos, new Vector(0, 2));
    }
}

class FireRain extends Fireball{
    constructor(pos){
        super(pos, new Vector(0, 3));
        this.startPos = new Vector(this.pos.x, this.pos.y);
    }

    handleObstacle(){
        this.pos = new Vector(this.startPos.x, this.startPos.y);
    }
}

class Coin extends Actor{
    constructor(position = new Vector()){
        super(position, new Vector(0.6, 0.6));
        this.pos.x += 0.2;
        this.pos.y += 0.1;
        this.position = position;
        this._type = 'coin';
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * 2 * Math.PI;
    }

    updateSpring(time = 1){
        this.spring += this.springSpeed * time;
    }

    getSpringVector(){
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1){
        this.updateSpring(time);
        let springVector = this.getSpringVector();
        return new Vector(this.position.x + springVector.x, this.position.y + springVector.y);
    }

    act(time) {
        let next = this.getNextPosition(time);
        this.pos = next;
    }
}


