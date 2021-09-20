const wait = function(ms) { return new Promise((res,rej)=>{ setTimeout(() => {res()}, ms); }) }
Number.prototype.inRange = function(min,max) {
    return this>=min&&this<=max
}
const pi = Math.PI
const BaseFPS = 1000/60
const ctx = document.getElementById('c').getContext('2d')
const cols = ['#3da5ff','#ff403d']; for (let i=0;i<=1;i++) { $(`#pts${i}`).css({color:cols[i]}) }
const boardSize = 600
const plrSize = 85
const speed = 10
const trailSize = 100
const round = Math.round // cache the function!!!!1!!!111!!1
var FPSCount = document.getElementById('FPS') // using stock getElement instead of jQuery cause it might be faster i think? it's important that the FPS counter updates quickly soooo
var mslf = 0
var lastPF = performance.now()
var winAnim = false
var pts = [0,0]
var ballSpeed = 5
var P1UP=P1DN=P2UP=P2DN = false
var pos = [(boardSize/2)-(plrSize/2),(boardSize/2)-(plrSize/2)]
var trails = []
var ball = [boardSize/2,boardSize/2]
var ballDir = 0;changeDir(rand(0,1)? rand(45,135) : rand(225,315))
render()

document.addEventListener('keydown', function(e) {
    if(e.repeat) return;
    switch (e.code) {
        case 'KeyW':
            P1UP = true
            break;
        case 'KeyS':
            P1DN = true
            break;
        case 'ArrowUp':
            P2UP = true
            break;
        case 'ArrowDown':
            P2DN = true
            break;
    }
})

document.addEventListener('keyup', function(e) {
    switch (e.code) {
        case 'KeyW':
            P1UP = false
            break;
        case 'KeyS':
            P1DN = false
            break;
        case 'ArrowUp':
            P2UP = false
            break;
        case 'ArrowDown':
            P2DN = false
            break;
    }
})
setInterval(()=>{
    var now = performance.now() // allows all FPS speeds to run the same
    mslf = now - lastPF // mslf = ms since last frame
    var plrSpeed = speed*(mslf/BaseFPS)*(ballSpeed/9)
    lastPF = now
    FPSCount.innerHTML = `${round(1000/mslf)} FPS`
    if(winAnim) return;
    
    if(P1UP&&!P1DN){ // switch cases cant be used here :pensive:
        pos[0]=Math.max(0, pos[0]-plrSpeed)
    } else if(P1DN&&!P1UP) {
        pos[0]=Math.min(boardSize-plrSize, pos[0]+plrSpeed)
    }
    if(P2UP&&!P2DN){
        pos[1]=Math.max(0, pos[1]-plrSpeed)
    } else if(P2DN&&!P2UP) {
        pos[1]=Math.min(boardSize-plrSize, pos[1]+plrSpeed)
    }
    

    var rad = ballDir * (pi/180)
    ball[0] += Math.sin(rad)*ballSpeed*(mslf/BaseFPS)
    ball[1] += Math.cos(rad)*ballSpeed*(mslf/BaseFPS)

    if(trails.length >= trailSize) {trails.shift()}
    trails.push([ball[0],ball[1]])
    render()

    if(ball[1]>=boardSize-8) { // hits floor
        changeDir(Math.abs(-Math.abs(ballDir-270)+180)+90,true)
    } else if(ball[1]<=8) { // hits ceil
        changeDir(-(Math.abs(-Math.abs(ballDir-270)+180)+90) + (ballDir<180 ? 180 : 540),true )
    } else if(ball[0]<=-30) { // passes left wall
        win(0)
    } else if(ball[0]>=boardSize+30) { // passes left wall
        win(1)
    } else if((ball[0]) /* < 72 */.inRange(42,72)  && ball[1].inRange(pos[0]-8, pos[0]+plrSize+8)) { // hits P1
        changeDir(-(ballDir-180)+180,true)
    } else if((ball[0]) /* > 526 */.inRange(526,558)  && ball[1].inRange(pos[1]-8, pos[1]+plrSize+8)) { // hits P2
        changeDir(Math.abs(ballDir-180)+180,true)
    }
},0)

function changeDir(deg,addSpeed) {
    ballDir = Math.abs(deg/* +rand(-5,5) */)%360
    ballSpeed+=addSpeed?.25:0
    $('#speed').html(`Speed: ${~~(ballSpeed*4)}`)
}
const wintxt = $('#wintxt')
async function win(p) { // p==0: P1   p==1: P2
    if(winAnim) return; winAnim = true
    var invert = p?0:1
    var oSpeed = ballSpeed+0
    var inAnim = `animate__bounceIn${p?'Left':'Right'}`
    var ptsCount = $(`#pts${invert}`)
    ballSpeed = 0
    pts[invert]++
    ptsCount.html(`P${p?1:2}: ${pts[invert]} point${pts[invert]==1?'':'s'}`)
    ptsCount.addClass('animate__bounce')
    wintxt.addClass(inAnim)
    wintxt.html(`PLAYER ${p?1:2} SCORES!`)
    await wait(2500)
    wintxt.addClass(`animate__zoomOut`)
    await wait(500)
    wintxt.html('')
    wintxt.removeClass(`animate__zoomOut`)
    wintxt.removeClass(inAnim)
    ptsCount.removeClass('animate__bounce')
    pos = [(boardSize/2)-(plrSize/2),(boardSize/2)-(plrSize/2)]
    ball = [boardSize/2,boardSize/2]
    winAnim = false
    ballSpeed = Math.max(5,oSpeed/2)
    changeDir(rand(0,1)? rand(45,135) : rand(225,315))
}

function render() {
    ctx.fillStyle = '#373737'
    ctx.fillRect(0,0,600,600)

    trails.map((pos,i) => {
        var s = i/trailSize*10
        var randX = pos[0]-(s/2) + rand(-(trailSize-i)/2,(trailSize-i)/2)
        ctx.fillStyle = `hsla(${ randX/3+180 /* i*(360/trailSize) */},100%,70%,${i/trailSize*50}%)`
        ctx.fillRect(randX,pos[1]-(s/2) + rand(-(trailSize-i)/2,(trailSize-i)/2),s,s)
    })

    $(`#speed`).css({color:`hsl(${ball[0]/3+180},100%,70%)`})

    ctx.fillStyle = '#fff'
    ctx.fillRect(ball[0]-8,ball[1]-8,16,16)
    
    cols.map((col,i) => {
        ctx.fillStyle = col
        ctx.fillRect(i?535:50, pos[i], 15, plrSize)
        //Math.min(boardSize-plrSize,Math.max(0,((boardSize*pos[i])-(plrSize/2))))
    })
}

function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max)+1;
    return Math.floor(Math.random() * (max - min) + min);
}