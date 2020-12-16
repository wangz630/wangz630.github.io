window.addEventListener("load", function() {
    var carouselSlides = document.querySelectorAll('.carousel-slide');
    var currentSlide = 0;
    var total = carouselSlides.length;
    var carouselSlides1 = document.querySelectorAll('.carousel-slide1');
    var currentSlide1 = 0;
    var total1 = carouselSlides.length;
    var nextBtn = document.querySelector('#arrow1');
    var prevBtn = document.getElementById('arrow2');

    

    function showNextSlide() {
        hideAllSlides();
        if(currentSlide === total - 1) {
            currentSlide = 0;
        } else {
            currentSlide++;
        }
        carouselSlides[currentSlide].style.opacity = 1;
    }

    function showPrevSlide() {
        hideAllSlides();
        if(currentSlide === 0) {
            currentSlide = total - 1;
        } else {
            currentSlide--;
        }
        carouselSlides[currentSlide].style.opacity = 1;
    }

    function hideAllSlides() {
        carouselSlides.forEach(function(slide) {
            slide.style.opacity = 0;
        });
    }

    function showNextSlide1() {
        hideAllSlides1();
        if(currentSlide1 === total - 1) {
            currentSlide1 = 0;
        } else {
            currentSlide1++;
        }
        carouselSlides[currentSlide].style.opacity = 1;
    }

    function showPrevSlide1() {
        hideAllSlides1();
        if(currentSlide1 === 0) {
            currentSlide1 = total - 1;
        } else {
            currentSlide1--;
        }
        carouselSlides1[currentSlide1].style.opacity = 1;
    }

    function hideAllSlides1() {
        carouselSlides1.forEach(function(slide) {
            slide.style.opacity = 0;
        });
    }

    nextBtn.addEventListener('click', showNextSlide);
    prevBtn.addEventListener('click', showPrevSlide);
    nextBtn.addEventListener('click', showNextSlide1);
    prevBtn.addEventListener('click', showPrevSlide1);

});
