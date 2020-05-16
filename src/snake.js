import { mapKeyCode } from './utils';
import { changeDirection, move, growth, gameOver, nextLevel, win} from './store/action';

export default class Snake {
    constructor(store){
        this.store = store;
    }
    
    moveSnake() {
        const { snake } = this.store.getState();
        const headSnake = this._getHeadSnake(snake);
        const direction = snake.direction;
        let newMovementSnake;
        let lastPosTail;

        if(direction === "left"){
            newMovementSnake =  { x: headSnake.x - 1, y: headSnake.y, d: direction, h: true };
        }
        if(direction === "right"){
            newMovementSnake =  { x: headSnake.x + 1, y: headSnake.y, d: direction, h: true };
        }
        if(direction === "up"){
            newMovementSnake =  { x: headSnake.x, y: headSnake.y - 1, d: direction, h: true };
        }
        if(direction === "down"){
            newMovementSnake =  { x: headSnake.x, y: headSnake.y + 1, d: direction, h: true };
        }
        
        if(!newMovementSnake){
            return false;
        }

        newMovementSnake = this._setTeleportSnake(newMovementSnake);
        
        if(this._getCollisionSnake(newMovementSnake)){
            console.log(newMovementSnake);
            this.store.dispatch(gameOver());
            return true;
        }

        this.store.dispatch(move(newMovementSnake));

        this._checkGrowth();
    }

    changeDirection(keyCode) {
        const { snake } = this.store.getState();
        const direction = mapKeyCode(keyCode);
    
        if(this._hasDirection(snake, direction)) {
            this.store.dispatch(changeDirection(direction));
        }
        else{
            return false;
        }
    
        this.moveSnake();
    };

    checkNextLevel() {
        const { score, maps, level } = this.store.getState();
        const map = maps[`map${level}`];

        if(score >= map.completed && level < 4){
            this.store.dispatch(nextLevel());
        }
    }

    checkWin() {
        const { score, maps, level } = this.store.getState();
        const map = maps[`map${level}`];

        if(score >= map.completed && level >= 4){
            this.store.dispatch(win());
        }
    }
    
    _checkGrowth() {
        const { snake, food: { apples }, score } = this.store.getState();
        const headSnake = this._getHeadSnake(snake);

        if(apples.x === headSnake.x && apples.y === headSnake.y){
            this.store.dispatch(growth());
        }
    }

    _getHeadSnake(snake) {
        return snake.tail[snake.tail.length - 1];
    }

    _hasDirection(snake, direction) {
        const headSnake = this._getHeadSnake(snake);
    
        if(direction === headSnake.d) {
            return false;
        }
    
        if(
            (direction === "left" && headSnake.d !== "right") ||
            (direction === "right" && headSnake.d !== "left") ||
            (direction === "up" && headSnake.d !== "down") ||
            (direction === "down" && headSnake.d !== "up")
        ) {
            return true;
        }
    
        return false;
    }

    _getCollisionSnake(headSnake) {
        const { snake, maps, level } = this.store.getState();
        const { tail } = snake;
        const map = maps[`map${level}`];
        
        for(let t = 0; t < tail.length; t+=1){
            if(tail[t].x === headSnake.x && tail[t].y === headSnake.y){
                return true;
            }
        }

        for(let m = 0; m < map.cords.length; m+=1) {
            for(let t = 0; t < tail.length; t+=1){
                if(headSnake.x === map.cords[m].x && headSnake.y === map.cords[m].y) {
                    return true;
                }
            }
        }
    }

    _setTeleportSnake(newHeadSnake) {
        const { snake: { direction } } = this.store.getState();

        if(newHeadSnake.x > 19 && direction === "right"){
            return { x: 0, y: newHeadSnake.y, d: direction, h: true };
        }
        if(newHeadSnake.x < 0 && direction === "left"){
            return { x: 19, y: newHeadSnake.y, d: direction, h: true };
        }
        if(newHeadSnake.y < 0 && direction === "up"){
            return { x: newHeadSnake.x, y: 19, d: direction, h: true };
        }
        if(newHeadSnake.y > 19 && direction === "down"){
            return { x: newHeadSnake.x, y: 0, d: direction, h: true };
        }

        return { x: newHeadSnake.x, y: newHeadSnake.y, d: direction, h: true };
    }

};