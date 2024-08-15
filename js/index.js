const $ = (s, a = false) => {
    if (a) return Array.from(document.querySelectorAll(s));
    return document.querySelector(s);
}

function forPosition(el) {
    // remove space holder if exists
    if (el.nextElementSibling && el.nextElementSibling.classList.contains('space-holder')) {
        el.nextElementSibling.remove();
    }
    const data_unit = el.getAttribute('data-unit') || 'px';
    var ele_space_holder = document.createElement('div');
    ele_space_holder.className = 'space-holder';
    const height = el.offsetHeight;
    ele_space_holder.style.height = height + 'px';
    const margin_top = window.getComputedStyle(el).marginTop;
    const margin_bottom = window.getComputedStyle(el).marginBottom;
    const margin_left = window.getComputedStyle(el).marginLeft;
    const margin_right = window.getComputedStyle(el).marginRight;
    ele_space_holder.style.marginTop = margin_top;
    ele_space_holder.style.marginBottom = margin_bottom;
    ele_space_holder.style.marginLeft = margin_left;
    ele_space_holder.style.marginRight = margin_right;
    if (el.getAttribute('data-margin-top')) {
        const margin = el.getAttribute('data-margin-top');
        ele_space_holder.style.marginTop = margin + data_unit;
    }
    if (el.getAttribute('data-margin-bottom')) {
        const margin = el.getAttribute('data-margin-bottom');
        ele_space_holder.style.marginBottom = margin + data_unit;
    }
    if (el.getAttribute('data-margin-left')) {
        const margin = el.getAttribute('data-margin-left');
        ele_space_holder.style.marginLeft = margin + data_unit;
    }
    if (el.getAttribute('data-margin-right')) {
        const margin = el.getAttribute('data-margin-right');
        ele_space_holder.style.marginRight = margin + data_unit;
    }
    // append space holder after the element
    el.parentNode.insertBefore(ele_space_holder, el.nextSibling);
}

var for_pos = 0;

$('.full', true).forEach(() => {
    for_pos++;
});

$('.abs', true).forEach(() => {
    for_pos++;
});

var filter_to;

let equals = {};

function resized() {

    $('.to-top', true).forEach((el) => {
        const data_unit = el.getAttribute('data-unit') || 'px';
        const data_top = el.getAttribute('data-top');
        const top = data_top ? data_top : 0;
        el.style.top = top + data_unit;
    });

    $('.to-bottom', true).forEach((el) => {
        const data_unit = el.getAttribute('data-unit') || 'px';
        const data_bottom = el.getAttribute('data-bottom');
        const bottom = data_bottom ? data_bottom : 0;
        el.style.bottom = bottom + data_unit;
    });

    $('.to-left', true).forEach((el) => {
        const data_unit = el.getAttribute('data-unit') || 'px';
        const data_left = el.getAttribute('data-left');
        const left = data_left ? data_left : 0;
        el.style.left = left + data_unit;
    });

    $('.sided', true).forEach((el) => {
        el.style.opacity = 0;
        el.style.filter = 'blur(17px)';
        el.style.webkitFilter = 'blur(17px)';
    });

    const width = window.innerWidth;

    if (width < 1000) {
        $('.sided', true).forEach((el) => {
            el.classList.add('mobile-sided');
        });

        $('.reverse-on-mobile', true).forEach((el) => {
            const left = el.querySelector('.on-left');
            const right = el.querySelector('.on-right');

            left.classList.remove('on-left');
            left.classList.add('on-right');
            right.classList.remove('on-right');
            right.classList.add('on-left');

            el.classList.add('mobile-reversed');
            el.classList.remove('reverse-on-mobile');

            // reverse the order of children
            const children = Array.from(el.children);
            children.reverse();
            children.forEach((child) => {
                el.appendChild(child);
            });

        });
    } else {
        $('.sided', true).forEach((el) => {
            el.classList.remove('mobile-sided');
        });

        $('.mobile-reversed', true).forEach((el) => {

            const left = el.querySelector('.on-left');
            const right = el.querySelector('.on-right');

            left.classList.remove('on-left');
            left.classList.add('on-right');
            right.classList.remove('on-right');
            right.classList.add('on-left');

            el.classList.add('mobile-reversed');
            el.classList.remove('reverse-on-mobile');

            // reverse the order of children
            const children = Array.from(el.children);
            children.reverse();
            children.forEach((child) => {
                el.appendChild(child);
            });

            el.classList.add('reverse-on-mobile');
            el.classList.remove('mobile-reversed');
        });
    }

    setTimeout(() => {
        for (let i = 0; i < for_pos * 2; i++) {
            $('.full', true).forEach((el) => {
                forPosition(el);
            });

            $('.abs', true).forEach((el) => {
                forPosition(el);
            });
        }
    }, 500);

    try {
        clearTimeout(filter_to);
    } catch { }

    filter_to = setTimeout(() => {
        $('.sided', true).forEach((el) => {
            el.style.opacity = 1;
            el.style.filter = 'none';
            el.style.webkitFilter = 'none';
        });
    }, 450);
}

window.addEventListener('resize', () => {
    resized();
});

resized();