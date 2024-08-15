var x, y;
document.body.addEventListener('contextmenu', function (e) {
    // When right clicked, show context menu
    // But if touched the border of body, fix the position of context menu to another side of the mouse
    // Touched right border: show context menu on the left side of the mouse;
    // Touched bottom border: show context menu on the top side of the mouse;
    // The context menu should be on the left bottom side of the mouse by default
    let devMode = localStorage.getItem('dev') === 'true';
    if (devMode) {
        return;
    }
    var menu = document.getElementById('contextMenu');
    menu.style.animation = 'none';
    x = e.clientX;
    y = e.clientY;
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (x + menu.offsetWidth > w) {
        x -= menu.offsetWidth;
    }
    if (y + menu.offsetHeight > h) {
        y -= menu.offsetHeight;
    }
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.opacity = '1';
    menu.style.pointerEvents = 'auto';
    // Solve the problem that the context menu shown as one up and one down
    // If the context menu is shown as one up and one down, change the position of the context menu
    // If the context menu is shown as one left and one right, do nothing
    if (menu.offsetTop + menu.offsetHeight > h) {
        menu.style.top = h - menu.offsetHeight + 'px';
    }
    if (menu.offsetLeft + menu.offsetWidth > w) {
        menu.style.left = w - menu.offsetWidth + 'px';
    }

    // Prevent default right click event
    if (e.target != menu && e.target.className != 'item') {
        e.preventDefault();
    } else {
        // If clicked on the context menu, remove the context menu
        menu.style.opacity = '0';
        // Remove animation(fadein) to context menu with css (animation: fadein 0.3s ease-in-out;)
        menu.style.animation = 'none';
        menu.style.pointerEvents = 'none';
    }
    // Add animation
    menu.style.animation = 'fadein 0.1s ease-in-out';
});

var items = document.getElementsByClassName('item');
for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', function (e) {
        // Click event for context menu items
        var menu = document.getElementById('contextMenu');
        menu.style.opacity = '0';
        // Remove animation(fadein) to context menu with css (animation: fadein 0.3s ease-in-out;)
        menu.style.animation = 'none';
        menu.style.pointerEvents = 'none';
    });
}

document.getElementById('time').addEventListener('click', function () {
    // show context menu on the same position of the #time
    var menu = document.getElementById('contextMenu');
    menu.style.animation = 'none';
    x = document.getElementById('time').offsetLeft;
    y = document.getElementById('time').offsetTop;
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (x + menu.offsetWidth > w) {
        x -= menu.offsetWidth;
    }
    if (y + menu.offsetHeight > h) {
        y -= menu.offsetHeight;
    }

    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.opacity = '1';
    menu.style.pointerEvents = 'auto';
});

// Pre load context menu, position it to the top-left corner of the screen
var menu = document.getElementById('contextMenu');
menu.style.left = '0px';
menu.style.top = '0px';
menu.style.display = 'block';
menu.style.opacity = '0';
menu.style.pointerEvents = 'none';


// Remove context menu
document.body.addEventListener('click', function (e) {
    const t = e.target;
    // Remove context menu if clicked outside
    var menu = document.getElementById('contextMenu');
    if (t != menu && t.className != 'item' && t.id != 'time') {
        menu.style.opacity = '0';
        // Remove animation(fadein) to context menu with css (animation: fadein 0.3s ease-in-out;)
        menu.style.animation = 'none';
        menu.style.pointerEvents = 'none';
    }
    if (alert_boxes.length > 0 && t.className === 'player' || t.id === 'albumArt' || t.className == 'theme-color-transit' || t.className == 'l-line' || t.className == 'removed-active' || t.className == 'lyrics') {
        alert_boxes[alert_boxes.length - 1].style.animation = 'slideout .5s forwards';
        // remove from array
        try {
            let id = alert_boxes[alert_boxes.length - 1].id;
            if (id) {
                // remove id from alerts_toggled
                let index = alerts_toggled.indexOf(id);
                if (index > -1) {
                    alerts_toggled.splice(index, 1);
                }
            }

            if (alert_boxes.length - 1 == 0) {
                let player = document.querySelector('.player');
                player.classList.remove('alerted');
            }

            setTimeout(() => {
                alert_boxes[alert_boxes.length - 1].remove();
                alert_boxes.pop();
            }, 500);
        } catch (e) {
            console.log(e);
        }
    }
});

// document.body.addEventListener('dblclick', function (e) {
//     // DOUBLED CLICK EVENT
//     if (e.target.id === 'albumArt') {
//         return;
//     }
// });

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});
document.addEventListener('doubleclick', function (e) {
    e.preventDefault();
});

// Ctrl + S event
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 's' && !e.altKey) {
        e.preventDefault();
        app.share();
    }
    else if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault();
        app.settings();
    }
    else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        app.details();
    }
    else if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        app.queue();
    }
});

// Touch on Large-Alert
var touch = {
    start_x: 0,
    start_y: 0,
}

document.body.addEventListener('touchstart', function (e) {
    if (e.target.className === 'large-alert') {
        touch.start_x = e.touches[0].clientX;
        touch.start_y = e.touches[0].clientY;
    }
});

document.body.addEventListener('touchmove', function (e) {
    if (e.target.className === 'large-alert') {
        var y = e.touches[0].clientY;
        var dy = y - touch.start_y;
        var percentage = dy / window.innerHeight * 100;
        e.target.style.transform = 'translateY(' + Max(percentage, 0) + '%)';
        e.target.style.willChange = 'transform';
        e.target.style.transition = 'none';

        // smoother touch
        e.preventDefault();

    }
});

document.body.addEventListener('touchend', function (e) {
    if (e.target.className === 'large-alert') {
        // if the alert is moved more than 50% of the screen, remove the alert
        if (alerts_toggled.includes(e.target.id)) {
            // remove from array
            let index = alerts_toggled.indexOf(e.target.id);
            if (index > -1) {
                alerts_toggled.splice(index, 1);
            }
        }
        var y = e.changedTouches[0].clientY;
        var dy = y - touch.start_y;
        var percentage = dy / window.innerHeight * 100;

        if (percentage > 20) {
            e.target.style.transition = 'transform 0.5s';
            e.target.style.transform = 'translateY(100%)';
            if (alert_boxes.length - 1 == 0) {
                let player = document.querySelector('.player');
                player.classList.remove('alerted')
            }
            
            setTimeout(() => {
                e.target.remove();
                alert_boxes.pop();
            }, 500);
        } else {
            e.target.style.transition = 'transform 0.5s';
            e.target.style.transform = 'translateY(0)';
        }
    }
});

Max = (a, b) => {
    return a > b ? a : b;
}

Min = (a, b) => {
    return a < b ? a : b;
}