(function () {
  'use strict';

  var ANALYTICS_ID = 'G-LKV47FWN2N';
  var SCROLL_MARKS = [50, 90];
  var seenScrollMarks = {};

  function hasValidAnalyticsId(id) {
    return /^G-[A-Z0-9]+$/i.test(id) && id !== 'G-XXXXXXXXXX';
  }

  function loadGtag(id) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', id, {
      anonymize_ip: true,
      allow_google_signals: false
    });
  }

  function trackEvent(name, params) {
    if (typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', name, params || {});
  }

  function isExternalLink(url) {
    try {
      var parsed = new URL(url, window.location.origin);
      return parsed.origin !== window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function getSocialNetwork(href) {
    if (!href) return '';
    var lower = href.toLowerCase();
    if (lower.indexOf('instagram.com') !== -1) return 'instagram';
    if (lower.indexOf('x.com') !== -1 || lower.indexOf('twitter.com') !== -1) return 'x';
    if (lower.indexOf('strava') !== -1) return 'strava';
    return '';
  }

  function setupClickTracking() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target) return;

      var element = target.closest('a, button');
      if (!element) return;

      var href = element.getAttribute('href') || '';
      var label = (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);

      if (href && href.indexOf('mailto:') === 0) {
        trackEvent('contact_click', {
          method: 'email',
          label: label
        });
        trackEvent('generate_lead', {
          method: 'email',
          source: 'mailto_link'
        });
        return;
      }

      if (href && isExternalLink(href)) {
        var network = getSocialNetwork(href);
        if (network) {
          trackEvent('social_click', {
            network: network,
            destination: href
          });
        } else {
          trackEvent('outbound_click', {
            destination: href,
            label: label
          });
        }
        return;
      }

      var looksLikeCTA =
        element.classList.contains('btn') ||
        /book|apply|subscribe|download|view|read more|contact|assessment/i.test(label);

      if (looksLikeCTA) {
        trackEvent('cta_click', {
          label: label,
          destination: href || 'button'
        });
      }
    });
  }

  function setupFormTracking() {
    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || form.tagName !== 'FORM') return;

      var action = form.getAttribute('action') || '';
      var formType = 'generic_form';

      if (/kit\.com\/forms|convertkit|seva-form/i.test(action + ' ' + form.className)) {
        formType = 'newsletter_signup';
      }

      trackEvent('form_submit', {
        form_type: formType,
        action: action || 'inline_form',
        page_path: window.location.pathname
      });

      if (formType === 'newsletter_signup') {
        trackEvent('generate_lead', {
          method: 'newsletter',
          form_destination: action || 'inline_form',
          page_path: window.location.pathname
        });
      }
    });
  }

  function setupScrollTracking() {
    window.addEventListener('scroll', function () {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight <= 0) return;

      var percent = Math.round((scrollTop / scrollHeight) * 100);
      for (var i = 0; i < SCROLL_MARKS.length; i++) {
        var mark = SCROLL_MARKS[i];
        if (percent >= mark && !seenScrollMarks[mark]) {
          seenScrollMarks[mark] = true;
          trackEvent('scroll_depth', {
            percent: mark,
            page_path: window.location.pathname
          });
        }
      }
    }, { passive: true });
  }

  function setupEngagementTracking() {
    window.setTimeout(function () {
      trackEvent('engaged_30_seconds', {
        page_path: window.location.pathname
      });
    }, 30000);
  }

  function init() {
    if (hasValidAnalyticsId(ANALYTICS_ID)) {
      loadGtag(ANALYTICS_ID);
    }

    setupClickTracking();
    setupFormTracking();
    setupScrollTracking();
    setupEngagementTracking();
  }

  init();
})();
