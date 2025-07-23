console.log('fdsfsdfds')


const box = document.querySelector('.box');
const stop = document.querySelector('.stop');

let left = 0;
let transX = 0;
let dir = 1
let raf;

const backandforth = () => {

    if(transX > 500){
        dir = -1;
    } else if( transX == 0){
        dir = 1
    }

    transX += 5 * dir;
    box.style.transform = `translateX(${transX}px)`;
    raf = requestAnimationFrame(backandforth);
}

raf = requestAnimationFrame(backandforth);

stop.addEventListener('click',e => {
    cancelAnimationFrame(raf)
})