
export class Notify {

    static MessageBox(message, title = "Message", bgClass = "bg-success", iconClass = 'fas fa-envelope fa-lg') {

        const toast = $.toast({
            heading: title,
            text: message,
            icon: iconClass,
            hideAfter: 5000,
            position: 'bottom-right',
            class: bgClass,
            showHideTransition: 'slide',
            afterHidden: function() {
                toast.reset();
            }
        });
    }
}