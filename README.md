# atomik-css

A CSS framework based on atomic concept.

As CSS is difficult to maintain and to manage on large project, Atomik offers a SIMPLE approch for CLEAN, SHORT and RE-USABLE CSS.

The philosophy of the concept is very simple : one class, one CSS rule. 

All your styling is made by grouping classes on an html node. 
As there's no pre construct object, you can customize everything and create your own system with atomik class.  

All you can't target in the DOM (as pseudo selector for example), is written in a custom stylesheet.

2 minutes to understand the naming convention for classes: '.attribute-value'. If I want a 'padding:1rem' on a DOM element, I need the '.p-1' class. For value as '1.7', I use the 'p-1c7' as the 'c' stands for 'coma'.

The goal is to avoid the typical situation of 10 000 lines of CSS where you always write the same properties again and again.
It limits the front developper  bad habbits of automatically write CSS to the bottom file and override everything with !important rules... as it take to much time to read and understand all the module and re usable things in the sheets.

So no more spaghetti CSS or complicating and a bit subjective naming convention in BEM or OOCSS, even if if these are wonderful approaches, it request a lot more attention and rigor to maintain  the CSS sheets in the right way.


# TODO

1/ A REAL DOCUMENTATION IS NEEDED. 

2/ ```html  <div class="p-(1rem)> => <div class="p-1">" ```: rendering classname before runtime. Grunt string-replace ? templating function ? node ?  

