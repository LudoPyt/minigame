import paper, { Path, Point, Group, view, Raster } from 'paper'

export default class Game {
    constructor(){
        this.audioGame()
        this.init()
        this.draw()
    }

    init(){
        this.canvas = document.querySelector('#game')
        this.resize();
        this.createGroup();
        this.initPositionStar();
        this.initSpaceship();
        this.initMeteor();
        this.setupEventListener();
        this.spriteSpaceshipFrameCounter()

    }

    audioGame(){
        this.audio = new Audio();
        this.audio.src = "./assets/music/imperatrice.mp3" ;
        this.context = new AudioContext();
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = Math.pow(2, 11);
        this.source = this.context.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        this.audio.play()
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        paper.setup(this.canvas)
    }

    createGroup(){
        this.groupStar = new Group()
        this.groupMeteor = new Group()
    }

    draw(){
        this.drawStar()
        this.drawSpaceship()
        this.drawMeteor()
        paper.view.draw()
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    initPositionStar(){
        this.positions = []
        this.colorArray = ['red','blue','pink','green','chartreuse', 'purple', 'magenta', 'indigo']
        for (let p = 0; p <= 2000; p++){
            let position = {};
            let speed = Math.random()*1.2
            let sizeStar = Math.random()*1.5
            let color = this.colorArray[this.getRandomInt(0, this.colorArray.length - 1)]
            position.x = view.size.width * Math.random()
            position.y = view.size.height * Math.random()
            this.positions.push({ position, speed, sizeStar, color})
        }

    }
    updatePositionStar(){
        this.fbc_array = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(this.fbc_array);

        for (let u = 0; u <= 2000; u++){
            this.positions[u].sizeStar = -this.fbc_array[u] / 40
            this.positions[u].color = this.colorArray[this.getRandomInt(0, this.colorArray.length - 1)]
            this.positions[u].position.x -= this.positions[u].speed
            if (this.positions[u].position.x > view.size.width) {
                this.positions[u].position.x = 0
            }
            else if (this.positions[u].position.x < 0){
                this.positions[u].position.x = view.size.width
            }
        }

    }

    drawStar(){
        this.groupStar.removeChildren();
        for (let s = 0; s <= 2000; s++){
            let star = new Path.Circle(new Point(this.positions[s].position.x, this.positions[s].position.y), this.positions[s].sizeStar)
            star.fillColor = this.positions[s].color
            this.groupStar.addChild(star)
        }
    }

    initSpaceship(){
        this.shipProperties= {}
        this.shipImg = []
        this.spriteSpaceshipCounter = 1
        for (let imgIndex = 0; imgIndex < 2; imgIndex++) {
            const img = new Image();
            img.src = `./assets/img/img_${imgIndex + 1}.png`;
            this.shipProperties = {
              img: img,
              positionY: view.size.height/2,
              positionX: 100
            };
            this.shipImg.push(img)
        }
        this.ship = new Raster(this.shipImg[this.spriteSpaceshipCounter])
        this.ship.rotate(90)
        this.ship.scale(0.5)
    }

    drawSpaceship(){
        if (this.spriteSpaceshipCounter >= this.shipImg.length){
            this.spriteSpaceshipCounter = 0
        }

        this.ship.image = this.shipImg[this.spriteSpaceshipCounter]
        this.ship.position.x= this.shipProperties.positionX
        this.ship.position.y= this.shipProperties.positionY

    }

    drawMeteor(){
        this.groupMeteor.removeChildren();
        for (let i = 0; i < 15; i++){
            this.meteor = new Raster(this.positionsMeteor[i].img)
            this.meteor.scale(this.positionsMeteor[i].sizeMeteor)
            this.groupMeteor.addChild(this.meteor)
            this.meteor.position.x = this.positionsMeteor[i].position.x
            this.meteor.position.y = this.positionsMeteor[i].position.y
            this.collision(i)
        }
    }

    initMeteor(){
        this.meteorImg = []
        for (let m = 0; m < 3; m++){
            const img = new Image();
            img.src = `./assets/img/meteor_${m + 1}.png`;
            this.meteorImg.push(img);
        }
        this.positionsMeteor = []
        for (let i = 0; i < 15; i++){
            let position = {};
            let sizeMeteor = 0.2
            let speed = 3 + (Math.random()*1.5)
            let img = this.meteorImg[Math.floor(Math.random()*this.meteorImg.length)]
            position.x = view.size.width + (Math.random() * view.size.width/2)
            position.y = Math.random() * view.size.height
            this.positionsMeteor.push({ position, sizeMeteor, speed, img})
        }
    }

    collision(i){
        if (this.positionsMeteor[i].position.x < this.ship.position.x + 50
            && this.positionsMeteor[i].position.x > this.ship.position.x - 50
            && this.positionsMeteor[i].position.y < this.ship.position.y + 50
            && this.positionsMeteor[i].position.y > this.ship.position.y - 50){
                this.ship.scale(0)
                this.audio.pause()
        }
    }

    updatePositionMeteor(){
        for (let m = 0; m < 15; m++){
            this.positionsMeteor[m].position.x -= this.positionsMeteor[m].speed
            this.positionsMeteor[m].sizeMeteor = (this.fbc_array[m] / 1500) + 0.05
            if (this.positionsMeteor[m].position.x < -50) {
                this.positionsMeteor[m].position.x = view.size.width + (Math.random() * view.size.width/2)
            }
        }
    }


    updatePositionSpaceship() {
        document.onkeydown = (event) => {
            switch (event.keyCode) {
               case 32:
                    console.log('Feu');
                  break;
               case 38:
                    this.shipProperties.positionY -= 3.5;
                  break;
               case 40:
                    this.shipProperties.positionY += 3.5;
                  break;
            }
        };
    }

    spriteSpaceshipFrameCounter(){
        setInterval(() => {
            this.spriteSpaceshipCounter++
        }, 150);
    }

    _gameLoop() {
        this.draw();
        this.updatePositionStar();
        this.updatePositionMeteor();
        this.updatePositionSpaceship();
        requestAnimationFrame(this._gameLoop.bind(this))
    }

    setupEventListener(){
        window.addEventListener('resize', this.resize.bind(this));
        this._gameLoop();
    }

}