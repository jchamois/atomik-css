/*TOUCH DETECTION HELPER*/

var htmlNode = document.getElementsByTagName('html')[0]

function is_touch_device() {
 return (('ontouchstart' in window)
      || (navigator.MaxTouchPoints > 0)
      || (navigator.msMaxTouchPoints > 0));
}

if (!is_touch_device()) {
    htmlNode.className += ' '+'no-touch';
}else{
    htmlNode.className += ' '+'touch';
}