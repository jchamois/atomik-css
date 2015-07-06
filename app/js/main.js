var PROJET = {

	selector : {
		$win : $(window),
		$header : $( '#header'),
		$nav : $('#nav'),
		$page : $('#page')

	},

	imgToload : function(){

		if(Modernizr.touch){
			var img = ['img/touch-bg.jpg']
		}else{
			var img = [
				'img/bg-0.jpg',
				'img/bg-1.png',
				'img/bg-2.png',
				'img/bg-3.png',
			]
		}
		return img
	},

	preload : function(){

			var nbImg = PROJET.imgToload().length,
				imgLoaded = 0,
				$loading = $('.loading'),
				//$current= $loading.find('.current')
				step = 100 / nbImg;

			function progressBar(percent, $element ) {

				var progressBarWidth = percent;

				$element
				.find('div')
				.animate({
					width: progressBarWidth+'%'
				},{
					duration: 1000,
					complete: function(){
						if(percent == 100){
							$loading.fadeOut(800, function(){
								$(this).remove()
							})
						}
					},

					step:function(now, fx){
						//$current.text(Math.round((now))+'%')
					}
				})
			}

			$(PROJET.imgToload()).each( function (i,item) {
		  	    var item = new Image();
			    item.src = PROJET.imgToload()[i];

				$(item).load(function(){
					imgLoaded++;
					progressBar(step * imgLoaded, $('#progressBar'));

				});

			});
	},

	/*INIT*/

	initDomReady: function(){
		//this.preload()
		console.log('DOM READY EVENT')
	},

	initWinLoad: function(){
		console.log('WINDOW LOAD EVENT')

	}
}

$(document).ready(function(){
	PROJET.initDomReady()
})

$(window).load(function(){
	PROJET.initWinLoad()
})




