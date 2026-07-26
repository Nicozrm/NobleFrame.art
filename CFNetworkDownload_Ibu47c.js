/* =====================================================
   NOBLEFRAME - COOKIE CONSENT BANNER (DSGVO/TTDSG)
   ===================================================== */

(function() {
    'use strict';
    
    const CONSENT_KEY = 'nobleframe_cookie_consent';
    const CONSENT_VERSION = '1.0';
    
    // Check if consent already given
    function getConsent() {
        try {
            const consent = localStorage.getItem(CONSENT_KEY);
            if (consent) {
                const parsed = JSON.parse(consent);
                if (parsed.version === CONSENT_VERSION) {
                    return parsed;
                }
            }
        } catch (e) {}
        return null;
    }
    
    // Save consent
    function saveConsent(preferences) {
        const consent = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            preferences: preferences
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    }
    
    // Create and inject styles
    function injectStyles() {
        const styles = `
            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #0A0A0A;
                border-top: 1px solid rgba(201, 169, 98, 0.3);
                padding: 25px;
                z-index: 99999;
                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
                box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
                transform: translateY(100%);
                transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            .cookie-banner.visible {
                transform: translateY(0);
            }
            .cookie-banner-inner {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: flex-start;
                gap: 30px;
                flex-wrap: wrap;
            }
            .cookie-banner-content {
                flex: 1;
                min-width: 300px;
            }
            .cookie-banner h3 {
                font-family: 'Cormorant Garamond', serif;
                font-size: 22px;
                font-weight: 400;
                color: #FAFAFA;
                margin-bottom: 10px;
            }
            .cookie-banner p {
                font-size: 13px;
                line-height: 1.7;
                color: #888888;
                margin-bottom: 15px;
            }
            .cookie-banner a {
                color: #C9A962;
                text-decoration: none;
            }
            .cookie-banner a:hover {
                text-decoration: underline;
            }
            .cookie-options {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 5px;
            }
            .cookie-option {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .cookie-option input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: #C9A962;
                cursor: pointer;
            }
            .cookie-option label {
                font-size: 13px;
                color: #FAFAFA;
                cursor: pointer;
            }
            .cookie-option label span {
                color: #888888;
                font-size: 11px;
            }
            .cookie-banner-buttons {
                display: flex;
                gap: 15px;
                align-items: center;
                flex-wrap: wrap;
            }
            .cookie-btn {
                padding: 14px 28px;
                font-family: 'Montserrat', sans-serif;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .cookie-btn-accept {
                background: #C9A962;
                color: #0A0A0A;
            }
            .cookie-btn-accept:hover {
                background: #E8D5A3;
            }
            .cookie-btn-save {
                background: transparent;
                color: #C9A962;
                border: 1px solid #C9A962;
            }
            .cookie-btn-save:hover {
                background: #C9A962;
                color: #0A0A0A;
            }
            .cookie-btn-reject {
                background: transparent;
                color: #888888;
                border: 1px solid #444444;
            }
            .cookie-btn-reject:hover {
                border-color: #888888;
                color: #FAFAFA;
            }
            @media (max-width: 768px) {
                .cookie-banner {
                    padding: 20px 15px;
                }
                .cookie-banner-inner {
                    flex-direction: column;
                    gap: 20px;
                }
                .cookie-banner-buttons {
                    width: 100%;
                }
                .cookie-btn {
                    flex: 1;
                    text-align: center;
                    padding: 12px 20px;
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    // Create banner HTML
    function createBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.id = 'cookieBanner';
        banner.innerHTML = `
            <div class="cookie-banner-inner">
                <div class="cookie-banner-content">
                    <h3>Cookie-Einstellungen</h3>
                    <p>Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                       Einige Cookies sind für den Betrieb der Website erforderlich, während andere uns helfen, 
                       die Website zu verbessern. Weitere Informationen finden Sie in unserer 
                       <a href="datenschutz.html">Datenschutzerklärung</a>.</p>
                    <div class="cookie-options">
                        <div class="cookie-option">
                            <input type="checkbox" id="cookieEssential" checked disabled>
                            <label for="cookieEssential">Essentiell <span>(erforderlich)</span></label>
                        </div>
                        <div class="cookie-option">
                            <input type="checkbox" id="cookieAnalytics">
                            <label for="cookieAnalytics">Analyse <span>(optional)</span></label>
                        </div>
                        <div class="cookie-option">
                            <input type="checkbox" id="cookieMarketing">
                            <label for="cookieMarketing">Marketing <span>(optional)</span></label>
                        </div>
                    </div>
                </div>
                <div class="cookie-banner-buttons">
                    <button class="cookie-btn cookie-btn-accept" id="cookieAcceptAll">Alle akzeptieren</button>
                    <button class="cookie-btn cookie-btn-save" id="cookieSave">Auswahl speichern</button>
                    <button class="cookie-btn cookie-btn-reject" id="cookieReject">Nur essentiell</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        
        // Show banner with animation
        setTimeout(() => banner.classList.add('visible'), 100);
        
        // Event listeners
        document.getElementById('cookieAcceptAll').addEventListener('click', function() {
            saveConsent({ essential: true, analytics: true, marketing: true });
            hideBanner();
            loadOptionalScripts(true, true);
        });
        
        document.getElementById('cookieSave').addEventListener('click', function() {
            const analytics = document.getElementById('cookieAnalytics').checked;
            const marketing = document.getElementById('cookieMarketing').checked;
            saveConsent({ essential: true, analytics: analytics, marketing: marketing });
            hideBanner();
            loadOptionalScripts(analytics, marketing);
        });
        
        document.getElementById('cookieReject').addEventListener('click', function() {
            saveConsent({ essential: true, analytics: false, marketing: false });
            hideBanner();
        });
    }
    
    // Hide banner
    function hideBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('visible');
            setTimeout(() => banner.remove(), 400);
        }
    }
    
    // Load optional scripts based on consent
    function loadOptionalScripts(analytics, marketing) {
        // Example: Load Google Analytics if analytics consent given
        if (analytics) {
            // Uncomment and add your GA tracking ID when needed:
            /*
            (function() {
                var script = document.createElement('script');
                script.async = true;
                script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXXX-X';
                document.head.appendChild(script);
                
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'UA-XXXXXXXXX-X');
            })();
            */
            console.log('Analytics consent granted');
        }
        
        // Example: Load marketing pixels if marketing consent given
        if (marketing) {
            // Add your marketing scripts here
            console.log('Marketing consent granted');
        }
    }
    
    // Initialize
    function init() {
        const existingConsent = getConsent();
        
        if (existingConsent) {
            // User already consented, load appropriate scripts
            loadOptionalScripts(
                existingConsent.preferences.analytics,
                existingConsent.preferences.marketing
            );
        } else {
            // Show cookie banner
            injectStyles();
            
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', createBanner);
            } else {
                createBanner();
            }
        }
    }
    
    // Expose functions globally for manual trigger
    window.NobleFrameCookies = {
        showBanner: function() {
            localStorage.removeItem(CONSENT_KEY);
            injectStyles();
            createBanner();
        },
        getConsent: getConsent
    };
    
    // Run
    init();
})();
