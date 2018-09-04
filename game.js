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


