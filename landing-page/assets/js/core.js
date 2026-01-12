(function ($) {
    "use strict";
    

    function content_ready_scripts() {
		$('[data-background]').each(function() {
			$(this).css('background-image', 'url('+ $(this).attr('data-background') + ')');
		});

        gsap.to(".feh-exper-3-area", {
            scrollTrigger: {
              trigger: ".feh-exper-3-area",
              start: "top 70%",
              end: "bottom bottom",
              toggleClass: "active",
              once: true,
            },
        });
        gsap.to(".feh-need-3-area", {
			scrollTrigger: {
			  trigger: ".feh-need-3-area",
			  start: "top 70%",
			  end: "bottom bottom",
			  toggleClass: "active",
			  once: true,
			},
		});

        const txaaddclass = gsap.utils.toArray('.ftc-add-class');
	txaaddclass.forEach(img => {
		gsap.to(img, {
			scrollTrigger: {
				trigger: img,
				scrub: 1,
				start: "top 95%",
				toggleClass: "active",
				toggleActions: "play reverse play reverse",
				markers: false
			}
		});
	});
	}
	
	$(window).on('elementor/frontend/init', function() {
	
		if (elementorFrontend.isEditMode()) {
			
			elementorFrontend.hooks.addAction('frontend/element_ready/widget', function() {
				content_ready_scripts();
			});
	
		} else {
			elementorFrontend.hooks.addAction('frontend/element_ready/widget', function() {
				content_ready_scripts();
			});
		}
	
	});


})(jQuery);