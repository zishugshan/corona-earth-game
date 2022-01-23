let startBtn=document.querySelector(".start");
let restartBtn=document.querySelector(".restart");
let box=document.querySelector(".box");
let scoreEl=document.querySelector(".score span");
let highScoreEl=document.querySelector(".highScore span");
let highScore=document.querySelector(".highScore");
let power=document.querySelector(".meter span");
let powerLevel=document.querySelector(".meter");
let full_power=100;
let canvas=document.querySelector(".board");
let tool=canvas.getContext("2d");
canvas.height=window.innerHeight;
canvas.width=window.innerWidth;
let score=0;
//let highscore=100;
let spaceImg = new Image();
spaceImg.src="space.png";
let planetImg = new Image();
planetImg.src="planet.png";
let coronaImg = new Image();
coronaImg.src="corona.png";
let eHeight=60;
let eWidth=60;
let eposX=canvas.width/2-30;
let eposY=canvas.height/2-30;

//highScoreEl.innerText=highscore;
let coronas=[];
let bullets=[];
let particles=[];

class Bullet{
    constructor(x,y,width,height,velocity){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.velocity=velocity;
    }
    draw(){
        tool.fillStyle="white";
        tool.fillRect(this.x,this.y,this.width,this.height);
    }
    update(){
        this.draw();
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;

    }
}

class Corona{
    constructor(x,y,width,height,velocity){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.velocity=velocity;
    }
    draw(){
        tool.drawImage(coronaImg,this.x,this.y,this.width,this.height);
    }
    update(){
        this.draw();
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;

    }
}



class Planet{
    constructor(x,y,width,height){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
    }
    draw(){
        tool.drawImage(planetImg,this.x,this.y,this.width,this.height);
    }
}

class Particle{
    constructor(x,y,radius,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.velocity=velocity;
        this.alpha=1;
    }
    draw(){
        tool.save();
        tool.globalAlpha=this.alpha;
        tool.beginPath();
        tool.fillStyle="white";
        tool.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        tool.fill();
        tool.restore();
    }
    update(){
        this.draw();
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;
        this.alpha-=0.01;
    }
}
let animateId;

function animate(){
    animateId = requestAnimationFrame(animate);
    tool.clearRect(0,0,canvas.width,canvas.height);
    tool.fillRect(0,0,canvas.clientWidth,canvas.height);
    tool.drawImage(spaceImg,0,0,canvas.clientWidth,canvas.height);
    let earth=new Planet(eposX,eposY,eWidth,eHeight);
    earth.draw();

    particles.forEach(function(particle,particleIdx){
        if(particle.alpha<=0){
            setTimeout(function(){
                particles.splice(particleIdx,1);
            },0); 
        }
        else{
            particle.update();
        }
        
    })
    let lenB=bullets.length;
    for(let i=0;i<lenB;i++){
        bullets[i].update();
        if(bullets[i].x<0 || bullets[i].y<0 || bullets[i].x>canvas.width ||bullets[i].y>canvas.height){
            setTimeout(function(){
                bullets.splice(i,1);
            },0)
        }
    }
    coronas.forEach(function(corona,i){
        corona.update();
        if (collisionRect(earth,corona)){
            full_power -=20;
            power.style.width=`${full_power}%`;
            coronas.splice(i,1);
            if(full_power==0) {
                //highscore=Math.max(highscore, score); // have to impl
                cancelAnimationFrame(animateId);
                reStart();
            }
        }
        bullets.forEach(function(bullet, bulletIdx){
            if(collisionRect(corona,bullet)){
                //explosion
                for(let j=0;j<corona.width * 5;j++){
                    particles.push(new Particle(bullet.x,bullet.y,Math.random()*2,{
                        x:(Math.random()-0.5)*(Math.random()*6),
                        y:(Math.random()-0.5)*(Math.random()*6)
                    }))
                }
                setTimeout(function(){
                    coronas.splice(i,1);
                    bullets.splice(bulletIdx,1);
                    score +=10;
                    scoreEl.innerText=score;
                    //highscore=Math.max(highscore, score); // have to impl
                }, 0)
            }
        })
    })
    

    
}

function createCorona(){
    setInterval(function(){
        let x;
        let y;
        let delta=Math.random();
        if(delta<0.5){
            x=Math.random()<0.5?0:canvas.width;
            y=Math.random()*canvas.height;
        }
        else{
            y=Math.random()<0.5?0:canvas.height;
            x=Math.random()*canvas.width;
        }
        
        let angle=Math.atan2(canvas.height/2-y,canvas.width/2-x);
        let velocity={
            x:Math.cos(angle)*2,
            y:Math.sin(angle)*2
        };
        let corona=new Corona(x,y,35,35,velocity);
        coronas.push(corona);
    },750);
}

startGame();

function startGame(){
    startBtn.addEventListener("click",function(e){
        e.stopImmediatePropagation();
        box.style.display="none";
        powerLevel.style.display="flex";
        //highScore.style.display="flex";
        //localStorage.setItem("highScoreKey", highScore);//have to impliment
        tool.fillRect(0,0,canvas.clientWidth,canvas.height);
        tool.drawImage(spaceImg,0,0,canvas.width,canvas.height);
    
    
        let earth=new Planet(eposX,eposY,eWidth,eHeight);
        earth.draw();
        animate();
        createCorona();
        window.addEventListener("click",function(e){
            let angle=Math.atan2(e.clientY-canvas.height/2,e.clientX-canvas.width/2);
            let velocity={
                x:Math.cos(angle)*6,
                y:Math.sin(angle)*6
            };
            let bullet=new Bullet(canvas.width/2,canvas.height/2,10,10,velocity);
            bullet.draw();
            bullets.push(bullet);
        })
    })
}

function collisionRect(entity1,entity2){
    let l1=entity1.x;
    let l2=entity2.x;
    let r1=entity1.x+entity1.width;
    let r2=entity2.x+entity2.width;
    let d1=entity1.y;
    let d2=entity2.y;
    let t1=entity1.y+entity1.height;
    let t2=entity2.y+entity2.height;
    if(l1<r2&&l2<r1&&t1>d2&&t2>d1) {
        return true;
    }
    return false;
}

window.addEventListener("resize",function(){
    this.window.location.reload();
})
function reStart(){
    restartBtn.style.display="block";
    startBtn.style.display="none";
    box.style.display="flex";
    power.parentElement.style.display="none";
    canvas.height=0;
    document.body.style.backgroundColor="white";
    restartBtn.addEventListener("click",function(){
        window.location.reload();
        startGame();
    })
}
