/*
	Author: themexriver
	Version: 1.0
*/


(function ($) {
	"use strict";

	const lenis = new Lenis({
		duration: 2,	
	})
	
	// smoooth scroll activation start
	function raf(time) {
	  lenis.raf(time)
	  requestAnimationFrame(raf)
	}
	requestAnimationFrame(raf)


	window.addEventListener('load', function(){

		// preloader 
		let preloader = document.querySelector("#preloader");
		
		if (preloader) {
			preloader.classList.add("preloaded");
			setTimeout(function () {
		
				}, 1000 ) ;
		}

		// hero 1 start
		const fdh1 = gsap.timeline();

		fdh1.from(".egx-hero-1-slideleft " , { stagger: .5,  x: -180 , duration:1.5,  opacity:1, delay: 0.4 })

		// hero 2 
		const egh1 = gsap.timeline();
		const egh2 = gsap.timeline();

		egh1.from(".hero-2-btn" , { y: 100 , duration:1,  opacity:1 })
		egh2.from(".egx-hero-2-right" , { stagger: .5, x: 300 , duration:1.5,  opacity:1, })


		// hero 3 
		const egh3 = gsap.timeline();
		egh2.from(".egx-hero-3-right" , { stagger: .5, x: 0 , })


		// hero 4 slider
		let egx_hero_4 = new Swiper('.egx_hero_4_active', {
			loop: true,
			speed: 500,
			effect: 'fade',
			autoplay: {
				delay: 5000,
				disableOnInteraction: false
			},
			fadeEffect: {
				crossFade: true
			},
			pagination: {
				el: ".egx-hero-4-pagination",
				clickable: true,
				renderBullet: function (index, className) {
					return '<span class="' + className + '">0' + (index + 1) + "</span>";
				},
			},
		});

		// testimonial 3 slider
		let egx_testimonail_3 = new Swiper('.egx_testimonial_3_active', {
			loop: true,
			speed: 500,
			autoplay: {
				delay: 4000,
			},
			navigation: {
				nextEl: ".egx-test-3-next",
				prevEl: ".egx-test-3-prev",
			},
		});

		// hero-4 large text
		$(function() {
			$('.egx-split-text-large').addClass('active');
		});
	})



	$(document).ready(function() {
		var st = jQuery(".egx-split-text");
		if(st.length == 0) return;
		gsap.registerPlugin(SplitText);
		st.each(function(index, el) {
			el.split = new SplitText(el, { 
				type: "lines,words,chars",
				linesClass: "split-line"
			});

			gsap.set(el, { perspective: 400 });
			if( jQuery(el).hasClass('split-in-right') ){
				gsap.set(el.split.chars, {
					opacity: 0,
					x: "80",
					ease: "power1.out"
				});
			}

			if ($(el).hasClass("split-in-rotate")) {
				gsap.set(el.split.chars, {
					opacity: 0,
					rotateX: "50deg",
					ease: "circ.out"
				});
			  }

			if( jQuery(el).hasClass('split-in-up') ){
				gsap.set(el.split.chars, {
					y: "80",
					ease: "power2.out",
				});
			}
			if( jQuery(el).hasClass('split-in-scale') ){
				gsap.set(el.split.chars, {
					opacity: 0,
					scale: "0.6",
					ease: "power1.out",
				});
			}
			el.anim = gsap.to(el.split.chars, {
				scrollTrigger: {
					trigger: el,
					start: "top 90%",
				},
				x: "0",
				y: "0",
				rotateX: "0",
				color: 'inherit',
				webkitTextStroke: "0px white",
				scale: 1,
				opacity: 1,
				duration: 1, 
				stagger: 0.02,
			});
		});

		if($('.egx-split-text-2').length) {
			var txasplit2 = $(".egx-split-text-2");
		
			if(txasplit2.length == 0) return; gsap.registerPlugin(SplitText); txasplit2.each(function(index, el) {
			
				el.split = new SplitText(el, { 
					type: "lines,words,chars",
					linesClass: "split-line"
				});
			
				if( $(el).hasClass('egx-split-text-2-ani') ){
					gsap.set(el.split.chars, {
						opacity: .2,
						x: "-5",
					});
				}
			
				el.anim = gsap.to(el.split.chars, {
					scrollTrigger: {
						trigger: el,
						start: "top 90%",
						end: "top 60%",
						markers: false,
						scrub: 1,
					},
			
					x: "0",
					y: "0",
					opacity: 1,
					duration: .7,
					stagger: 0.2,
				});
			
			});
		}

		if($('.egx-split-text-large').length) {
			var txasplit3 = $(".egx-split-text-large");
		
			if(txasplit3.length == 0) return; gsap.registerPlugin(SplitText); txasplit3.each(function(index, el) {
			
				el.split = new SplitText(el, { 
					type: "lines,words,chars",
					linesClass: "split-line"
				})
			
			});
		}

	});
	


	// sticky-header
	function gex_stickyHeader() {
		var $window = $(window);
		var lastScrollTop = 0;
		var $header = $('.txa_sticky_header');
		var headerHeight = $header.outerHeight() + 30;

		$window.scroll(function () {
		var windowTop = $window.scrollTop();

		if (windowTop >= headerHeight) {
			$header.addClass('txa_sticky');
		} else {
			$header.removeClass('txa_sticky');
			$header.removeClass('txa_sticky_show');
		}

		if ($header.hasClass('txa_sticky')) {
			if (windowTop < lastScrollTop) {
			$header.addClass('txa_sticky_show');
			} else {
			$header.removeClass('txa_sticky_show');
			}
		}

		lastScrollTop = windowTop;
		});
	}

	gex_stickyHeader();

	// search-popup-start
	$('.search_btn_toggle').on('click', function() {
		$('.overlay, .search_box_active').addClass('active');
	});

	$('.overlay, .search_box_close').on('click', function() {
		$('.search_box_active').removeClass('active');
		$('.overlay').removeClass('active');
	});

	$(document).on('keydown', function(event) {
		if (event.key === 'Escape') {
			$('.search_box_active').removeClass('active');
			$('.overlay').removeClass('active');
		}
	});

	// scroll progress 
	if($('.progress-wrap')) {
        
        var scrollTopbtn = document.querySelector('.progress-wrap');
        var progressPath = document.querySelector('.progress-wrap path');
        var pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';      
        var updateProgress = function () {
            var scroll = $(window).scrollTop();
            var height = $(document).height() - $(window).height();
            var progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        }
        updateProgress();
        $(window).scroll(updateProgress);
		
        var offset = 50;
        var duration = 750;
        jQuery(window).on('scroll', function() {
            if (jQuery(this).scrollTop() > offset) {
                jQuery(scrollTopbtn).addClass('active-progress');
            } else {
                jQuery(scrollTopbtn).removeClass('active-progress');
            }
        });             
        jQuery(scrollTopbtn).on('click', function(event) {
            event.preventDefault();
            jQuery('html, body').animate({scrollTop: 0}, duration);
            return false;
        })
    }

	// mobile menu 
	$(".open_menu").on("click", function () {
		$(".mobile-menu").toggleClass("mobile_menu_on");
	});

	$(".open_menu").on("click", function () {
		$("body").toggleClass("mobile_menu_overlay_on");
	});

	if ($(".mobile_menu li.dropdown ul").length) {
		$(".mobile_menu li.dropdown").append(
			'<div class="dropdown-btn"><span class="fas fa-caret-right"></span></div>'
		);
		$(".mobile_menu li.dropdown .dropdown-btn").on("click", function () {
			$(this).prev("ul").slideToggle(500);
		});
	}

	$(".dropdown-btn").on("click", function () {
		$(this).toggleClass("toggle-open");
	});

	jQuery(".mobile-main-navigation li.dropdown").append(
		'<span class="dropdown-btn"><i class="fa-solid fa-angle-right"></i></span>'
	),
		jQuery(".mobile-main-navigation li .dropdown-btn").on(
			"click",
			function () {
				jQuery(this).hasClass("active")
					? (jQuery(this)
							.closest("ul")
							.find(".dropdown-btn.active")
							.toggleClass("active"),
					  jQuery(this)
							.closest("ul")
							.find(".dropdown-menu.active")
							.toggleClass("active")
							.slideToggle())
					: (jQuery(this)
							.closest("ul")
							.find(".dropdown-btn.active")
							.toggleClass("active"),
					  jQuery(this)
							.closest("ul")
							.find(".dropdown-menu.active")
							.toggleClass("active")
							.slideToggle(),
					  jQuery(this).toggleClass("active"),
					  jQuery(this)
							.parent()
							.find("> .dropdown-menu")
							.toggleClass("active"),
					  jQuery(this)
							.parent()
							.find("> .dropdown-menu")
							.slideToggle());
			}
		);

	

	// offcanvas-start
	$('.offcanvas_toggle').on('click', function() {
		$('.overlay, .offcanvas_box_active').addClass('active');
	});

	$('.overlay, .offcanvas_box_close').on('click', function() {
		$('.offcanvas_box_active').removeClass('active');
		$('.overlay').removeClass('active');
	});

	$(document).on('keydown', function(event) {
		if (event.key === 'Escape') {
			$('.offcanvas_box_active').removeClass('active');
			$('.overlay').removeClass('active');
		}
	});


	// active class added 
	const boxWrap = gsap.utils.toArray('.egx-class-add');
	boxWrap.forEach(img => {
		gsap.to(img, {
			scrollTrigger: {
				trigger: img,
				scrub: 1,
				start: "top 80%",
				end: "bottom bottom",
				toggleClass: "active",
				toggleActions: "play none none reverse",
				once: true,
			}
		});
	});

	// scroll slide left-up animation 
	gsap.utils.toArray('.egx_left_Up_1').forEach((el, index) => { 
		let ls_1 = gsap.timeline({
		scrollTrigger: {
			trigger: el,
			scrub: 1,
			start: "top 90%",
			end: "top 60%",
			toggleActions: "play none none reverse",
			markers: false,
		}
		})
		
		ls_1
		.set(el, {transformOrigin: 'center center'})
		.from(el, { y: 200, rotationZ: "-45", scale: 0.6 }, { y: 0, duration: 1, rotationZ: 1, scale: 1, immediateRender: false})
	})

	// scroll scale animation 
	gsap.utils.toArray('.egx_scale_1').forEach((el, index) => { 
		let ls_1 = gsap.timeline({
		scrollTrigger: {
			trigger: el,
			scrub: 1,
			start: "top 80%",
			end: "top 50%",
			toggleActions: "play none none reverse",
			markers: false,
		}
		})
		
		ls_1
		.set(el, {transformOrigin: 'center center'})
		.from(el, { scale: 0.8 }, {  duration: 1, scale: 1, immediateRender: false})
	})

	// scroll slide_left animation
	gsap.utils.toArray('.scroll_slide_left').forEach((el, index) => { 
		let tlcta = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				scrub: 2,
				start: "top 90%",
				end: "top 70%",
				toggleActions: "play none none reverse",
				markers: false
			}
		})

		tlcta
		.set(el, {transformOrigin: 'center center'})
		.from(el, { opacity: 1,  x: "-=150"}, {opacity: 1, x: 0, duration: 1, immediateRender: false})
	});

	// scroll slide_right animation
	gsap.utils.toArray('.scroll_slide_right').forEach((el, index) => { 
		let tlcta = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				scrub: 2,
				start: "top 90%",
				end: "top 70%",
				toggleActions: "play none none reverse",
				markers: false
			}
		})

		tlcta
		.set(el, {transformOrigin: 'center center'})
		.from(el, { opacity: 1,  x: "+=150"}, {opacity: 1, x: 0, duration: 1, immediateRender: false})
	});

	// scroll slide_top animation
	gsap.utils.toArray('.scroll_slide_top').forEach((el, index) => { 
		let tlcta = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				scrub: 2,
				start: "top 90%",
				end: "top 70%",
				toggleActions: "play none none reverse",
				markers: false
			}
		})

		tlcta
		.set(el, {transformOrigin: 'center center'})
		.from(el, { opacity: 1,  y: "+=150"}, {opacity: 1, y: 0, duration: 1, immediateRender: false})
	});


	// scroll footer divider animation
	gsap.utils.toArray('.footer-divider').forEach((el, index) => { 
		let tlcta = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				scrub: 2,
				start: "top 90%",
				end: "top 70%",
				toggleActions: "play none none reverse",
				markers: false
			}
		})

		tlcta
		.set(el, {transformOrigin: 'center center'})
		.from(el, { opacity: 1, scaleX: 0.6}, { scaleX: 1, duration: 1, immediateRender: false})
	});
	

	// image-paralax-animation-start
	gsap.utils.toArray(".image-pllx").forEach(function(container) {
		let image = container.querySelector("img");
	  
		let tl = gsap.timeline({
			scrollTrigger: {
			  trigger: container,
			  scrub: true,
			  pin: false,
			},
		  }); 
		  tl.from(image, {
			yPercent: -30,
			scale: 1.1,
			ease: "none",
		  }).to(image, {
			yPercent: 30,
			scale: 1.1,
			ease: "none",
		  }); 
	  });



	// energy section 
	let energy_2 = gsap.timeline({
		scrollTrigger: {
		  trigger: ".egx-energy-2-area",
		  start: "top 70%",
		  end: "top 20%",
		  scrub: true,
		  once: true,
		}
	  });
	  
	  energy_2.from(".egx-energy-2-left" , { stagger: .5, x: -200 , duration: 2.5,  opacity:1, })


	// home 4 about section line 
	gsap.utils.toArray('.about-4-line').forEach((el, index) => { 
		let tlcta = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				scrub: 2,
				start: "top 90%",
				end: "top 70%",
				toggleActions: "play none none reverse",
				markers: false
			}
		})

		tlcta
		.set(el, {transformOrigin: 'top center'})
		.from(el, { opacity: 1, scaleY: 0}, { scaleY: 1, duration: 1, immediateRender: false})
	});

	gsap.utils.toArray('.about-4-line-circle').forEach((el, index) => { 
		let tlcta = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				scrub: 2,
				start: "top 87%",
				end: "top 70%",
				toggleActions: "play none none reverse",
				markers: false
			}
		})

		tlcta
		.set(el, {transformOrigin: 'top center'})
		.from(el, { opacity: 0, y: -92}, { y: 0, opacity: 1, duration: 1, immediateRender: false})
	});


	// work process page line-1
	gsap.utils.toArray('.line_1').forEach((el, index) => { 
		let ls_1 = gsap.timeline({
		scrollTrigger: {
			trigger: el,
			scrub: 1,
			start: "top 90%",
			end: "top 30%",
			toggleActions: "play none none reverse",
			markers: false,
		}
		})
		
		ls_1
		.set(el, {transformOrigin: 'left left'})
		.from(el, { opacity: 1,  scaleX: 0.1,}, {opacity: 1, scaleX: 1, duration: 5, immediateRender: false})
	})

	// work process page line-2
	gsap.utils.toArray('.line_2').forEach((el, index) => { 
		let ls_1 = gsap.timeline({
		scrollTrigger: {
			trigger: el,
			scrub: 1,
			start: "top 90%",
			end: "top 30%",
			toggleActions: "play none none reverse",
			markers: false,
		}
		})
		
		ls_1
		.set(el, {transformOrigin: 'right right'})
		.from(el, { opacity: 1,  scaleX: 0.1,}, {opacity: 1, scaleX: 1, duration: 5, immediateRender: false})
	})
	  


	// team 3 slider
	let egx_team_3 = new Swiper('.egx_team_3_active', {
		loop: true,
		speed: 500,
		spaceBetween: 20,
		navigation: {
			nextEl: ".egx-team-3-next",
			prevEl: ".egx-team-3-prev",
		},
		autoplay: {
			delay: 4000,
		},
		breakpoints: {
			0: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
			1600: {
				slidesPerView: 2,
			},
		}
	});

	// team 3 slider
	let egx_t_5 = new Swiper('.egx_t5_slider_active', {
		loop: true,
		speed: 500,
		spaceBetween: 40,
		autoplay: {
			delay: 4000,
		},
		pagination: {
			el: ".egx-t5-pargination",
			clickable: true,
		},
		breakpoints: {
			0: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
			1600: {
				slidesPerView: 2,
			},
		}
	});


	// slider
	let blog_list_slide = new Swiper('.blog_list_slide_active', {
		loop: true,
		speed: 500,
		navigation: {
			nextEl: ".egx_blog_list_next",
			prevEl: ".egx_blog_list_prev",
		},
	});



	// testimonial 4 preview
	let egxt4_thumb = new Swiper('.egx_t4_preview_active', {
		spaceBetween: 24,
		loop: false,
		speed: 1000,
		slidesPerView: 3,
		rtl: false,
		centeredSlides: false,
		watchSlidesProgress: false,
		pagination: {
			el: ".egx-t4-pargination",
			type: "fraction",
		},
		autoplay: {
			delay: 4000,
			disableOnInteraction: false
		},

		breakpoints: {
			320: {
			slidesPerView: 2,
			},
			576: {
			slidesPerView: 3,
			},
			768: {
			slidesPerView: 3,
			},
			992: {
			slidesPerView: 3,
			},
			1200: {
			slidesPerView: 3,
			},
			1400: {
			slidesPerView: 3,
			},
			1600: {
			slidesPerView: 3,
			},

		}
	});

	// testimonial 4 slider 
	let egxt4 = new Swiper('.egx_testimonial_4_active', {
		loop: true,
		spaceBetween: 0,
		rtl: false,
		slidesPerView: 1,
		effect: 'fade',
		autoplay: {
			delay: 4000,
		},
		fadeEffect: {
			crossFade: true
		},
		thumbs: {
			swiper: egxt4_thumb,
		},
		pagination: {
			el: ".egx-t4-pargination",
			type: "fraction",
			formatFractionCurrent: function (number) {
				return ('0' + number).slice(-2);
			},
			formatFractionTotal: function (number) {
				return ('0' + number).slice(-2);
			},
		},
	});


	// project-4 scroll animation 
	if(window.innerWidth> 1199) {
		var egxp4 = gsap.timeline({
		
			scrollTrigger: {
				animation: egxp4,
				trigger: '.egx-project-4-wrap',
				start: "top 15%",
				end: "bottom 0%",
				scrub: 2,
				pin: true,
				pinSpacing: true,
				markers: false
			}

		});
		
		egxp4
		.to( ".egx-project-4-wrap" , { x: "-75%", duration: 5 })
	}


	// team page gallery scroll animation 
	if(window.innerWidth> 1199) {
		var egxg4 = gsap.timeline({
		
			scrollTrigger: {
				animation: egxg4,
				trigger: '.egx-gallery-1-wrap',
				start: "top 15%",
				end: "bottom 0%",
				scrub: 2,
				pin: true,
				pinSpacing: true,
				markers: false
			}

		});
		
		egxg4
		.to( ".egx-gallery-1-wrap" , { x: "-15%", duration: 2 })
	}
	
	// contact section 
	let scene1 = gsap.timeline();
    ScrollTrigger.create({
        animation: scene1,
        trigger: ".egx-contact-4-area",
        start: "top 70%",
        end: "bottom 0%",
        scrub: 1,
    });

    // heor-4 contact img bg animation 
    scene1.fromTo(".egx-contact-4-bg", { y: 200 }, { y: 0 })

    // heor-4 contact img bg animation 
    scene1.fromTo(".egx-contact-4-form", { y: 100 }, { y: 0 })


	// project-3 mouseover active 
	let pro3__active_item = $(".egx-project-3-card");
  
    pro3__active_item.mouseover(function () {
		pro3__active_item.removeClass("active");
      $(this).addClass("active");
    });


	/*
	--- isotop activation ---
	*/

	if($(".grid").length) {

		var $grid = $('.grid').imagesLoaded( function() {
			$grid.masonry({
				percentPosition: true,
				itemSelector: '.grid-item',
				columnWidth: '.grid-sizer'
			}); 
		});
	
		var $grid = $(".grid").isotope({
			itemSelector: ".grid-item",
			layoutMode: "fitRows"
		});
	
		var filterFns = {
			numberGreaterThan50: function() {
				var number = $(this)
				.find(".number")
				.text();
				return parseInt(number, 10) > 50;
			},
			ium: function() {
				var name = $(this)
				.find(".name")
				.text();
				return name.match(/ium$/);
			}
		};
	
		$(".project-button-group").on("click", "button", function() {
			var filterValue = $(this).attr("data-filter");
			filterValue = filterFns[filterValue] || filterValue;
			$grid.isotope({ filter: filterValue });
		});
	
		$(".project-button-group").each(function(i, buttonGroup) {
			var $buttonGroup = $(buttonGroup);
			$buttonGroup.on("click", "button", function() {
				$buttonGroup.find(".is-checked").removeClass("is-checked");
				$(this).addClass("is-checked");
			});
		});
	}

	/*
	--- isotop activation ---
	*/


	/*
	progress bar activation start
	*/

	if ($(".progress-bar").length) {
		var $progress_bar = $(".progress-bar");
		$progress_bar.appear();
		$(document.body).on("appear", ".progress-bar", function () {
		  var current_item = $(this);
		  if (!current_item.hasClass("appeared")) {
			var percent = current_item.data("percent");
			current_item
			  .css("width", percent + "%")
			  .addClass("appeared")
			  .parent()
			  .append("<span>" + percent + "%" + "</span>");
		  }
		});
	  }
	
	/*
	progress bar activation end
	*/


	/*
	nice-selector-activiton
	====start====
	*/

	$('.nice-select select').niceSelect();
	/*
	nice-selector-activiton
	=====end==== 
	*/


	

	/*
	wow-activition
	=====start==== 
	*/


	new WOW().init();
		
	/*
	wow-activition
	=====end==== 
	*/



	/*
	popup-video-activition
	====start====
	*/
	$('.popup-video').magnificPopup({
		type: 'iframe'
	});
	/*
	popup-video-activition
	====end====
	*/




	/*
	popup-img-activition
	====start====
	*/
	$('.popup_img').magnificPopup({
		type: 'image',
		gallery: {
			enabled: true,
		},
	});
	/*
	popup-img-activition
	====end====
	*/



	/*
	counter-activition
	====start====
	*/
	$('.counter').counterUp({
		delay: 10,
		time: 3000
	});
	/*
	counter-activition
	====end====
	*/



	/*
	data-bg-activition
	====start====
	*/
	$("[data-background]").each(function(){
		$(this).css("background-image","url("+$(this).attr("data-background") + ") ")
	})
	/*
	data-bg-activition
	====end====
	*/


		/*
	marquee-activiton
	====start====
	*/


	
	$('.egx-1-marquee').marquee({
		speed: 100,
		gap: 45,
		delayBeforeStart: 0,
		direction: 'left',
		duplicated: true,
		pauseOnHover: true,
	
	})

	
	/*
	marquee-activiton
	=====end==== 
	*/



	// parallax-img
	$('.parallax-img').parallaxie({  
		speed: 0.5,
	});


	
	})(jQuery);