let snake = {
    init(){
        
        let self = this;

        this.createCtx();
        this.register();
        // this.draw();
        // this.createReward();
       
        // 内存数据监听 并同步更新视图
        Object.defineProperty(this.data , '_snakeHead' , {
            // 对蛇头数据进行监听
            get(){
                // console.log('getter')
                return self.data.snakeHead;
            } , 
            set(val){
                // console.log('setter' , val);
                
                self.drawDelete();
                let [hx , hy] = val;
                let [rx , ry] = self.data.reward;
                let isRewaed = false;
                if( rx == hx && ry == hy ){
                    // 判断是否吃到奖励
                    isRewaed = true;
                }
                // 将蛇头数据替换至蛇全部中头部数据
                self.data.snakeHead = val;
                if ( !isRewaed ) {
                    self.data.snake.pop();
                }else{
                    self.data.score += 1;
                    self.data.level = parseInt(self.data.score / 5 + 1);
                    self.data.interval -= self.data.level * 5; 
                    self.createReward();
                    self.updata('level');
                    self.updata('score');
                }
                self.data.snake.unshift(val);
                self.draw();
                self.gameOver();
            }
        });
    } , 
    data:{
        direction:'',
        reward:[] ,
        timer: null,
        ctx: null , 
        level: 1 , 
        score: 1 ,
        interval: 100 ,
        snakeSize: [9,9] ,
        snakeHead: [400,300] ,
        snake: [
            [400,300] , [410,300] , [420,300] , [430 , 300] , [440 , 300]
        ]
    } , 
    register(){
        let self = this;
        let start = document.querySelector('#top button');
            start.onclick = () => {
                // 箭头函数方式this被 start 按钮篡改
                this.draw();
                this.createReward();
                this.data.direction = 'left';
                this.move('left');
            };
        document.body.onkeydown = (event) => {
            switch(event.keyCode){
                case 37:
                    self.move('left');
                    break;
                case 38:
                    self.move('top');
                    break;
                case 39:
                    self.move('right');
                    break;
                case 40:
                    self.move('bottom');
                    break;
            }
        }
    } , 
    animation( callback , direction ){
        let self = this;
        clearInterval( this.data.timer );
        this.data.timer = null;
        this.data.timer = setInterval( () => {
            callback();
        } , self.data.interval); 
    } , 
    move(direction){
        let self = this;

        let dirFun = () => {
            
            let snakeHead = Object.assign( [] , this.data._snakeHead);
            
            let dirObj = {
                left(){snakeHead[0] -= 10} ,
                right(){snakeHead[0] += 10} ,
                top(){snakeHead[1] -= 10} ,
                bottom(){snakeHead[1] += 10} ,
                default(){
                    // 当 蛇 180度转向时 执行上一次方向事件
                    this[self.data.direction]();
                }
            };
            
            // 转向判断
            let horizontal = ['left' , 'right'];
            let vertical = ['top' , 'bottom'];
            let nowDirection = self.data.direction;
            
            if( horizontal.includes(direction) && horizontal.includes(nowDirection)){
                direction = 'default';
            }
            
            if( vertical.includes(direction) && vertical.includes(nowDirection)){
                direction = 'default';
            }
            
            dirObj[direction]();
            this.data._snakeHead = snakeHead;

            if( direction !== 'default'){// 记录当前方向
                this.data.direction = direction;
            }
        }
        // dirFun();  
        
        this.animation(dirFun , direction);
    } ,
    createCtx(){
        let instance = null;
        
        if( this.data.ctx ){
            instance = this.data.ctx;
        }else{
            let canvas = document.getElementById("canvas");
            instance = canvas.getContext("2d");
            this.data.ctx = instance;
        }
        return instance;
    } , 
    createReward(){
        
        let x = parseInt(Math.random()*78 + 2) * 10;
        let y = parseInt(Math.random()*58 + 2) * 10;
        
        do {
            //防止初始化碰撞
            x = parseInt(Math.random()*78 + 2) * 10;
            y = parseInt(Math.random()*58 + 2) * 10;
        } while ( (x > 430 && x < 400) && (y > 310 && y < 300) );

        this.data.reward = [x , y];

        let ctx = this.data.ctx;
            ctx.fillStyle = '#000';
            ctx.fillRect(x , y , ...this.data.snakeSize);
    } , 
    draw(color = 'red'){
        let ctx = this.data.ctx;
            ctx.fillStyle = color;
            this.data.snake.forEach((item , index)=>{
                if( index !== 0 ){
                    ctx.fillStyle = '#000';   
                } 
                ctx.fillRect(
                    item[0] , item[1] , ...this.data.snakeSize
                )
            })
    } , 
    drawDelete(){
        let ctx = this.data.ctx;
            this.data.snake.map((item)=>{
                ctx.clearRect(
                    item[0] , item[1] , ...this.data.snakeSize
                )
            })
    } , 
    gameOver(){
        let isOver = false;

        let [x , y] = this.data.snakeHead;
        let snake = this.data.snake.slice(4);
        
        for(let item of snake){ // 判断是否撞击蛇身
            isOver = (x == item[0] && y == item[1] ) ? true : false;
        }
        /*
            判断是否撞击墙壁
            墙壁范围 800 * 600 
            0 < x > 800
            0 < y > 600 
        */
        
        if( x < 0 || x > 790){
            isOver = true;
        }
            
        if( y < 0 || y > 590){
            isOver = true;
        }

        if( isOver ){
            clearInterval(this.data.timer);
            alert('游戏结束');
            location.reload();
        }
        return isOver; 
    } , 
    updata(type){// 更新分数和等级
        
        let [level,score] = document.querySelectorAll('#top span');
        
        let levelFun = () => {
            level.innerHTML = this.data.level;
        }
        let scoreFun = () => {
            score.innerHTML = this.data.score;
        }
        let defaultFun = () => {

        }

        let typeObj = {
            level : levelFun ,
            score : scoreFun , 
            default : defaultFun() 
        }
        typeObj[type]();
    }
}
snake.init();