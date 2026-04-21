/* Grand Hyatt Singapore - Store Interactions */

/* ===== Global Image Fallback ===== */
(function () {
    function makePlaceholder(alt) {
        var label = (alt || 'Grand Hyatt').replace(/[^a-z0-9\s]/gi, '').substring(0, 30);
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#e8e2d6"/><stop offset="100%" stop-color="#c9a961"/>' +
            '</linearGradient></defs>' +
            '<rect width="600" height="600" fill="url(#g)"/>' +
            '<text x="300" y="310" font-family="Georgia, serif" font-size="28" ' +
            'fill="rgba(26,26,26,0.6)" text-anchor="middle">' + label + '</text></svg>';
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    document.addEventListener('error', function (e) {
        var t = e.target;
        if (t && t.tagName === 'IMG' && !t.dataset.fallback) {
            t.dataset.fallback = '1';
            t.src = makePlaceholder(t.alt);
        }
    }, true);
})();

$(function () {

    /* ===== Sticky Header Scroll Effect ===== */
    var $header = $('.site-header');
    $(window).on('scroll', function () {
        if ($(window).scrollTop() > 20) {
            $header.addClass('scrolled');
        } else {
            $header.removeClass('scrolled');
        }
    });

    /* ===== Scroll Reveal Animations ===== */
    function reveal() {
        $('.fade-up, .fade-in, .stagger').each(function () {
            var $el = $(this);
            var top = $el.offset().top;
            var windowBottom = $(window).scrollTop() + $(window).height();
            if (top < windowBottom - 60) {
                $el.addClass('visible');
            }
        });
    }
    $(window).on('scroll load resize', reveal);
    reveal();

    /* ===== Filter Chips (Shop page) ===== */
    $(document).on('click', '.filter-chip:not(.seasonal-chip)', function () {
        $(this).siblings('.filter-chip').removeClass('active');
        $(this).addClass('active');
        filterProducts($(this).data('filter'));
    });

    function filterProducts(filter) {
        var $cards = $('.product-grid .product-card');
        if (!filter || filter === 'all') {
            $cards.fadeIn(300);
            return;
        }
        $cards.each(function () {
            var $card = $(this);
            if ($card.data('category') === filter) {
                $card.fadeIn(300);
            } else {
                $card.fadeOut(200);
            }
        });
    }

    /* ===== Size Options (Product Detail) ===== */
    $(document).on('click', '.size-option', function () {
        $(this).siblings('.size-option').removeClass('active');
        $(this).addClass('active');

        var price = $(this).data('price');
        var unit = $(this).data('unit');
        if (price) {
            $('.product-detail-price .price').text('$' + price);
            $('.add-to-cart-btn .cart-price').text('$' + price);
        }
        if (unit) {
            $('.product-detail-price .price-unit').text('per ' + unit);
        }
    });

    /* ===== Quantity Selector ===== */
    $(document).on('click', '.qty-btn.minus', function () {
        var $val = $(this).siblings('.qty-value');
        var current = parseInt($val.text()) || 1;
        if (current > 1) $val.text(current - 1);
    });

    $(document).on('click', '.qty-btn.plus', function () {
        var $val = $(this).siblings('.qty-value');
        var current = parseInt($val.text()) || 1;
        $val.text(current + 1);
    });

    /* ===== Add to cart ===== */
    $(document).on('click', '.add-to-cart-btn, .btn-card.btn-add', function (e) {
        e.preventDefault();
        var $btn = $(this);
        $btn.addClass('adding');

        // Ensure badge exists (pages without an existing cart badge)
        var $cartLink = $('.icon-btn[href="cart.html"]');
        var $badge = $cartLink.find('.badge-count');
        if (!$badge.length) {
            $badge = $('<span class="badge-count">0</span>');
            $cartLink.append($badge);
        }
        var count = parseInt($badge.text()) || 0;
        $badge.text(count + 1);
        $badge.css('transform', 'scale(1.4)');
        setTimeout(function () { $badge.css('transform', 'scale(1)'); }, 200);

        showToast('Added to cart');
        setTimeout(function () { $btn.removeClass('adding'); }, 600);
    });

    /* ===== Cart item quantity ===== */
    $(document).on('click', '.cart-item .qty-btn.minus', function () {
        var $val = $(this).siblings('.qty-value');
        var current = parseInt($val.text()) || 1;
        if (current > 1) {
            $val.text(current - 1);
            updateCartTotal();
        }
    });

    $(document).on('click', '.cart-item .qty-btn.plus', function () {
        var $val = $(this).siblings('.qty-value');
        var current = parseInt($val.text()) || 1;
        $val.text(current + 1);
        updateCartTotal();
    });

    /* ===== Remove cart item ===== */
    $(document).on('click', '.cart-item-remove', function () {
        var $item = $(this).closest('.cart-item');
        $item.slideUp(300, function () { $item.remove(); updateCartTotal(); });
    });

    function updateCartTotal() {
        // Simple recalculation based on data-price on each item
        var subtotal = 0;
        $('.cart-item').each(function () {
            var price = parseFloat($(this).data('price')) || 0;
            var qty = parseInt($(this).find('.qty-value').text()) || 1;
            subtotal += price * qty;
            $(this).find('.cart-item-price').text('$' + (price * qty).toFixed(0));
        });
        var shipping = subtotal > 0 ? 15 : 0;
        var tax = subtotal * 0.09;
        var total = subtotal + shipping + tax;

        $('.summary-row.subtotal .val').text('$' + subtotal.toFixed(2));
        $('.summary-row.shipping .val').text('$' + shipping.toFixed(2));
        $('.summary-row.tax .val').text('$' + tax.toFixed(2));
        $('.summary-total .val').text('$' + total.toFixed(2));

        // Free shipping note
        var remaining = 150 - subtotal;
        if (remaining > 0) {
            $('.free-shipping-note span').text('Add $' + remaining.toFixed(2) + ' more for free shipping');
        } else {
            $('.free-shipping-note').fadeOut();
        }
    }

    /* ===== Toast ===== */
    function showToast(message) {
        var $toast = $('#gh-toast');
        if (!$toast.length) {
            $toast = $('<div id="gh-toast" class="gh-toast"><span class="toast-icon">✓</span><span class="toast-text"></span></div>');
            $('body').append($toast);
        }
        $toast.find('.toast-text').text(message);
        $toast.addClass('show');
        clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(function () { $toast.removeClass('show'); }, 2200);
    }
    window.ghToast = showToast;

    /* ===== Smooth input focus ripple (payment) ===== */
    $(document).on('focus', '.form-control-gh', function () {
        $(this).parent().addClass('focused');
    });
    $(document).on('blur', '.form-control-gh', function () {
        $(this).parent().removeClass('focused');
    });

    /* ===== Image parallax on hero ===== */
    $(window).on('scroll', function () {
        var scrolled = $(window).scrollTop();
        $('.hero-image::before, .hero-image').css('--parallax', (scrolled * 0.2) + 'px');
    });

});
