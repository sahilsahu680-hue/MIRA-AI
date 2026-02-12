/**
 * Talio Download Page Script
 * Handles dynamic device detection and auto-selection of best download
 * Downloads are served from GitHub Releases
 */

// ============================================
// RELEASE CONFIGURATION - Update for new releases
// ============================================
const RELEASE_VERSION = '3.2.0';

// GitHub Release Download URLs
const DOWNLOADS = {
  mac: {
    arm64: {
      url: 'https://github.com/avirajsharma-ops/Talio/releases/download/v3.2.0/Talio-3.2.0-arm64.dmg',
      filename: 'Talio-3.2.0-arm64.dmg',
      label: 'Apple Silicon (M-series)',
      size: ''
    },
    x64: {
      url: 'https://github.com/avirajsharma-ops/Talio/releases/download/v3.2.0/Talio-3.2.0.dmg',
      filename: 'Talio-3.2.0.dmg',
      label: 'Intel (x64)',
      size: ''
    }
  },
  windows: {
    x64: {
      url: 'https://github.com/avirajsharma-ops/Talio/releases/download/v3.2.0/Talio.Setup.3.2.0.exe',
      filename: 'Talio.Setup.3.2.0.exe',
      label: 'Windows 10/11 (64-bit)',
      size: ''
    }
  },
  ios: {
    appStore: null
  }
};

// Platform icons as SVG strings
const ICONS = {
  mac: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></svg>`,
  windows: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12V6.75L9 5.43V11.91L3 12ZM20 3V11.75L10 11.9V5.21L20 3ZM3 13L9 13.09V19.9L3 18.75V13ZM10 13.25L20 13.5V22L10 20.09V13.25Z"/></svg>`,
  ios: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></svg>`
};

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const platformBadge = document.getElementById('platformBadge');
  const recommendedBtn = document.getElementById('recommendedBtn');
  const recommendedIcon = document.getElementById('recommendedIcon');
  const recommendedTitle = document.getElementById('recommendedTitle');
  const recommendedSubtitle = document.getElementById('recommendedSubtitle');

  // Platform cards for highlighting
  const macCard = document.getElementById('macCard');
  const windowsCard = document.getElementById('windowsCard');
  const iosCard = document.getElementById('iosCard');

  function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || '';

    // Mobile iOS
    if (/iphone|ipad|ipod/i.test(userAgent)) {
      return 'ios';
    }

    // Desktop
    if (platform.includes('mac') || userAgent.includes('mac')) {
      return 'mac';
    }

    if (platform.includes('win') || userAgent.includes('win')) {
      return 'windows';
    }

    // Linux defaults to Windows option
    if (platform.includes('linux')) {
      return 'windows';
    }

    return 'unknown';
  }

  async function detectMacArch() {
    // Chromium User-Agent Client Hints (best when available)
    try {
      if (navigator.userAgentData?.getHighEntropyValues) {
        const values = await navigator.userAgentData.getHighEntropyValues(['architecture']);
        const arch = (values.architecture || '').toLowerCase();
        if (arch.includes('arm')) return 'arm64';
        if (arch.includes('x86')) return 'x64';
      }
    } catch (e) {
      // Ignore
    }

    // WebGL renderer heuristic
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        if (renderer) {
          if (/Apple|M1|M2|M3|M4/i.test(renderer)) return 'arm64';
          if (/Intel|AMD|NVIDIA/i.test(renderer)) return 'x64';
        }
      }
    } catch (e) {
      // Ignore
    }

    // UA fallback (some browsers expose it)
    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('arm64') || ua.includes('aarch64')) return 'arm64';

    // Safe default: Intel build runs on Apple Silicon via Rosetta,
    // but Apple Silicon build does not run on Intel.
    return 'x64';
  }

  async function updateRecommendedDownload(device) {
    let download, title, subtitle, icon, badge;

    switch (device) {
      case 'mac': {
        const macArch = await detectMacArch();
        download = DOWNLOADS.mac[macArch] || DOWNLOADS.mac.x64;
        title = 'Download for macOS';
        subtitle = `${download.label} • v${RELEASE_VERSION}`;
        icon = ICONS.mac;
        badge = '✦ DESKTOP APPLICATION';
        highlightCard(macCard);
        break;
      }

      case 'windows':
        download = DOWNLOADS.windows.x64;
        title = 'Download for Windows';
        subtitle = `${download.label} • v${RELEASE_VERSION}`;
        icon = ICONS.windows;
        badge = '✦ DESKTOP APPLICATION';
        highlightCard(windowsCard);
        break;

      case 'ios':
        download = null;
        title = 'iOS App Coming Soon';
        subtitle = 'App Store';
        icon = ICONS.ios;
        badge = '✦ MOBILE APPLICATION';
        highlightCard(iosCard);
        break;

      default:
        download = DOWNLOADS.mac.x64;
        title = 'Download Talio';
        subtitle = 'Select your platform below';
        icon = ICONS.mac;
        badge = '✦ MULTI-PLATFORM';
    }

    if (platformBadge) platformBadge.textContent = badge;
    if (recommendedIcon) recommendedIcon.innerHTML = icon;
    if (recommendedTitle) recommendedTitle.textContent = title;
    if (recommendedSubtitle) recommendedSubtitle.textContent = subtitle;

    if (recommendedBtn) {
      if (download) {
        recommendedBtn.href = download.url;
        recommendedBtn.setAttribute('download', download.filename);
        recommendedBtn.classList.remove('disabled');
      } else {
        recommendedBtn.href = '#';
        recommendedBtn.removeAttribute('download');
        recommendedBtn.classList.add('disabled');
        recommendedBtn.addEventListener('click', function(e) {
          e.preventDefault();
          alert('iOS app is coming soon!');
        });
      }
    }
  }

  function highlightCard(card) {
    [macCard, windowsCard, iosCard].forEach(c => {
      if (c) c.classList.remove('highlighted');
    });

    if (card) {
      card.classList.add('highlighted');
    }
  }

  function trackDownload(href) {
    console.log('Download initiated:', href);

    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', {
        event_category: 'App Download',
        event_label: href
      });
    }

    if (typeof analytics !== 'undefined') {
      analytics.track('App Downloaded', { url: href });
    }
  }

  (async function init() {
    const detectedDevice = detectDevice();
    console.log('Detected device:', detectedDevice);

    await updateRecommendedDownload(detectedDevice);

    document.querySelectorAll('.download-btn-large, .platform-link').forEach(function(link) {
      link.addEventListener('click', function() {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
          trackDownload(href);
        }
      });
    });

    document.querySelectorAll('.platform-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
          return;
        }

        const firstLink = card.querySelector('.platform-link');
        if (firstLink) {
          firstLink.click();
        }
      });
    });
  })();
});
