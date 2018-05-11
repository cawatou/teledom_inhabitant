$(window).on("load", function() {
    "use strict";

// ===================================== ScreenShot Carousel =========================================//

$('.screenshot-carousel').owlCarousel({
	center:true,
    loop:true,
    margin:20,
    mouseDrag: false,
    nav:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:3
        },
        1000:{
            items:5
        }
    }
})

// ===================================== Client Carousel =========================================//

$('.client-carousel').owlCarousel({
    animateIn: 'fadeIn',
    animateOut: 'fadeOut',
    loop:true,
    margin:10,
    mouseDrag:true,
    nav:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:1
        },
        1000:{
            items:1
        }
    }
})


// ===================================== Sticky Header =========================================//

  $(window).on("scroll", function() {
    if ($(this).scrollTop() > 1){  
        $('header').addClass("sticky");
      }
      else{
        $('header').removeClass("sticky");
      }
});

// ===================================== Scrolling Function =========================================//

   $('nav, .navbar-default').onePageNav({
    currentClass: 'current',
    changeHash: false,
    offset:0,
    scrollSpeed: 1100,
    scrollThreshold: 0.5,
    filter: ':not(.external)',
    easing: 'swing',
    begin: function() {
        //I get fired when the animation is starting
    },
    end: function() {
        //I get fired when the animation is ending
    },
    scrollChange: function($currentListItem) {
        //I get fired when you enter a section and I pass the list item of the section
    }
});


// ===================================== Wow Scrolling Function =========================================//


if($('.wow').length){
    var wow = new WOW(
      {
        boxClass:     'wow',      // animated element css class (default is wow)
        animateClass: 'animated', // animation css class (default is animated)
        offset:       0,          // distance to the element when triggering the animation (default is 0)
        mobile:       true,       // trigger animations on mobile devices (default is true)
        live:         true       // act on asynchronously loaded content (default is true)
      }
    );
    wow.init();
}
});


