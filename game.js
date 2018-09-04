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
