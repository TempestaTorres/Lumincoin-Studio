(function ($) {
    'use strict';

    $(window).on('scroll', function () {
        let scroll = $(window).scrollTop();
        if (scroll < 400) {
            $('.back-top').fadeOut(500);
        } else {
            $('.back-top').fadeIn(500);
        }
    });

   // back to top
    $('.back-top a').on("click", function () {
        $('body,html').animate({
            scrollTop: 0
        }, 1000);
        return false;
    });

    // PAGE ACTIVE
    $( "#sidebar_menu" ).find( "a" ).removeClass("active");
    $( "#sidebar_menu" ).find( "li" ).removeClass("mm-active");
    $( "#sidebar_menu" ).find( "li ul" ).removeClass("mm-show");

    var current = window.location.pathname
    $("#sidebar_menu >li a").filter(function() {

        var link = $(this).attr("href");
        if(link){
            if (current.indexOf(link) != -1) {
                $(this).parents().parents().children('ul.mm-collapse').addClass('mm-show').closest('li').addClass('mm-active');
                $(this).addClass('active');
                return false;
            }
        }
    });

    //Nice select
    let niceSelect = $('.nice_Select2');
    if (niceSelect.length) {
        niceSelect.niceSelect();
    };

    // metisMenu
    $("#sidebar_menu").metisMenu();
    $("#admin_profile_active").metisMenu();

    // for MENU notification
    $('.bell_notification_clicker').on('click', function () {
        $('.Menu_NOtification_Wrap').toggleClass('active');
    });

    // Sidebar
    $(".open_miniSide").click(function () {
        $(".sidebar").toggleClass("mini_sidebar");
        $(".main_content ").toggleClass("full_main_content");
        $(".footer_part ").toggleClass("full_footer");
    });

    //active sidebar
    $('.sidebar_icon').on('click', function(){
        $('.sidebar').toggleClass('active_sidebar');
    });
    $('.sidebar_close_icon i').on('click', function(){
        $('.sidebar').removeClass('active_sidebar');
    });

    //active menu
    $('.troggle_icon').on('click', function(){
        $('.setting_navbar_bar').toggleClass('active_menu');
    });
    // CHAT_MENU_OPEN
    $('.CHATBOX_open').on('click', function() {
        $('.CHAT_MESSAGE_POPUPBOX').toggleClass('active');
    });

    $('.MSEESAGE_CHATBOX_CLOSE').on('click', function() {
        $('.CHAT_MESSAGE_POPUPBOX').removeClass('active');
    });

    // CHAT_MENU_OPEN
    $('.serach_button').on('click', function() {
        $('.serach_field-area ').addClass('active');
    });

    $(document).click(function(event) {
        if (!$(event.target).closest(".CHAT_MESSAGE_POPUPBOX, .CHATBOX_open").length) {
            $("body").find(".CHAT_MESSAGE_POPUPBOX").removeClass("active");
        }

        if (!$(event.target).closest(".bell_notification_clicker ,.Menu_NOtification_Wrap").length) {
            $("body").find(".Menu_NOtification_Wrap").removeClass("active");
        }

        if (!$(event.target).closest(".serach_button, .serach_field-area").length) {
            $("body").find(".serach_field-area").removeClass("active");
        }
        //remove sidebar

        if (!$(event.target).closest(".sidebar_icon, .sidebar").length) {
            $("body").find(".sidebar").removeClass("active_sidebar");
        }
    });

    //Data tables
    if ($('.lms_table_active').length) {

        $('.lms_table_active').DataTable({
            bLengthChange: false,
            "bDestroy": true,
            language: {
                search: "<i class='ti-search'></i>",
                searchPlaceholder: 'Quick Search',
                paginate: {
                    next: "<i class='ti-arrow-right'></i>",
                    previous: "<i class='ti-arrow-left'></i>"
                }
            },
            columnDefs: [{
                visible: false
            }],
            responsive: true,
            searching: false,
        });
    }
    if ($('.lms_table_active2').length) {

        $('.lms_table_active2').DataTable({
            bLengthChange: false,
            "bDestroy": false,
            language: {
                search: "<i class='ti-search'></i>",
                searchPlaceholder: 'Quick Search',
                paginate: {
                    next: "<i class='ti-arrow-right'></i>",
                    previous: "<i class='ti-arrow-left'></i>"
                }
            },
            columnDefs: [{
                visible: false
            }],
            responsive: true,
            searching: false,
            info: false,
            paging: false
        });
    }

})(jQuery);