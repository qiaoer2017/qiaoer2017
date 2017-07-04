/**
 * Created by qiaoer on 16/9/9.
 */
AOS.init({
    offset: 200,
    easing: 'ease-in-sine',
    delay: 100,
    once: true
});

$(function () {
    $('.sidebar-trigger').click(function () {
        $('.mask').fadeIn();
        $('aside').animate({
            right:0
        });


    });
    $('.mask').click(function () {
        $('aside').animate({
            right:-300
        });
        $('.mask').fadeOut();
    });

    $('.back-to-top').click(function () {
        $('body').animate({
            scrollTop:0
        });
    });
    $(window).scroll(function () {
        if($(window).scrollTop()>$(window).height()){
            $('.back-to-top').fadeIn();
        }else{
            $('.back-to-top').fadeOut();
        }
    });
    $(window).trigger('scroll');


});

