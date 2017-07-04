/**
 * Created by qiaoer on 16/8/24.
 */

$(function () {
    $('.nav').singlePageNav({
        offset: 70
    });


    $('#navbar .nav a').click(function () {
        if ($('#navbar').attr('aria-expanded') == 'true') {
            $('#navbar.collapse').collapse('toggle');
        }
    });

    wow = new WOW(
        {
            animateClass: 'animated',
            offset: 100,
            callback: function (box) {
                console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
            }
        }
    );
    wow.init();


});

