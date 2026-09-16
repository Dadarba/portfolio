// =========================================================
// ВЯЧЕСЛАВ OS: АВТОРИЗАЦИЯ И 2FA
// =========================================================

(function() {
    window.currentUser = null;
    let pending2faLogin = '';

    window.isCurrentUserAdmin = function() {
        return !!window.currentUser && window.currentUser.role === 'admin';
    };

    window.checkCurrentAuth = async function() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.authenticated && data.user) {
                window.currentUser = data.user;
                applyUserSession(data.user);
            } else {
                window.currentUser = null;
                applyGuestSession();
            }
        } catch (e) {
            window.currentUser = null;
            applyGuestSession();
        }
    };

    function applyUserSession(user) {
        window.globalCoins = user.coins || 0;
        window.playerXp = user.xp || 0;
        window.playerLevel = user.level || 1;
        window.playerNick = user.login || 'Игрок';
        window.playerTitle = user.title || 'Игрок';
        window.playerAvatar = user.avatar || (user.role === 'admin' ? '👑' : '👤');

        localStorage.setItem('v_user_cases', JSON.stringify(user.cases || {}));
        localStorage.setItem('v_installed_cyberware', JSON.stringify(user.implants || []));

        const isAdm = (user.role === 'admin');
        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) btnAdmin.style.display = isAdm ? 'inline-flex' : 'none';

        const authBadge = document.getElementById('os-auth-user-badge');
        if (authBadge) {
            authBadge.innerHTML = `
                <span style="font-size:10px; color:${isAdm ? '#ffd700' : '#fff'}; font-weight:bold;">${isAdm ? '👑' : '👤'} ${user.login}</span>
                <button class="p-btn" style="padding:2px 6px; font-size:9px; color:var(--danger);" onclick="authLogout()">Выйти</button>
            `;
        }

        const profAuthCard = document.getElementById('prof-auth-action-btn');
        if (profAuthCard) {
            profAuthCard.innerText = '🚪 Сменить аккаунт / Выйти';
            profAuthCard.style.background = 'rgba(239, 68, 68, 0.2)';
            profAuthCard.style.color = '#ef4444';
            profAuthCard.onclick = window.authLogout;
        }

        update2FAStatusUI(user.totp_enabled);

        if (window.updateAllCoinsUI) window.updateAllCoinsUI();
        if (window.renderProfile) window.renderProfile();
        if (window.renderImplantsUI) window.renderImplantsUI();
        if (window.renderCases) window.renderCases();
    }

    function applyGuestSession() {
        window.globalCoins = 100;
        window.playerXp = 0;
        window.playerLevel = 1;
        window.playerNick = 'Гость';
        window.playerTitle = 'Не авторизован';
        window.playerAvatar = '👤';

        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) btnAdmin.style.display = 'none';

        const adminTab = document.getElementById('tab-admin');
        if (adminTab && adminTab.classList.contains('active')) {
            window.showTab('hub');
        }

        const authBadge = document.getElementById('os-auth-user-badge');
        if (authBadge) {
            authBadge.innerHTML = `<button class="p-btn" style="padding:2px 8px; font-size:10px; background:var(--accent); color:#000; font-weight:800;" onclick="openAuthModal('login')">🔑 Войти</button>`;
        }

        const profAuthCard = document.getElementById('prof-auth-action-btn');
        if (profAuthCard) {
            profAuthCard.innerText = '🔑 Войти / Регистрация';
            profAuthCard.style.background = 'var(--accent)';
            profAuthCard.style.color = '#000';
            profAuthCard.onclick = () => window.openAuthModal('login');
        }

        update2FAStatusUI(false);
        if (window.updateAllCoinsUI) window.updateAllCoinsUI();
        if (window.renderProfile) window.renderProfile();
    }

    window.openAuthModal = function(mode = 'login') {
        const modal = document.getElementById('os-auth-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        window.switchAuthMode(mode);
    };

    window.closeAuthModal = function() {
        const modal = document.getElementById('os-auth-modal');
        if (modal) modal.style.display = 'none';
    };

    window.switchAuthMode = function(mode) {
        const isReg = (mode === 'register');
        const tabL = document.getElementById('auth-tab-login');
        const tabR = document.getElementById('auth-tab-register');
        const sBtn = document.getElementById('auth-submit-btn');
        const tTxt = document.getElementById('auth-title-txt');
        const mInp = document.getElementById('auth-modal-mode');
        const tabsRow = document.getElementById('auth-tabs-container');
        const secCreds = document.getElementById('auth-credentials-section');
        const sec2fa = document.getElementById('auth-2fa-section');

        if (tabsRow) tabsRow.style.display = 'flex';
        if (secCreds) secCreds.style.display = 'block';
        if (sec2fa) sec2fa.style.display = 'none';

        if (tabL) tabL.classList.toggle('active', !isReg);
        if (tabR) tabR.classList.toggle('active', isReg);
        if (sBtn) {
            sBtn.disabled = false;
            sBtn.innerText = isReg ? 'Зарегистрироваться' : 'Войти в аккаунт';
        }
        if (tTxt) tTxt.innerText = isReg ? 'Создание профиля' : 'Авторизация в системе';
        if (mInp) mInp.value = mode;
    };

    function show2faInputPrompt(login) {
        pending2faLogin = login;
        const secCreds = document.getElementById('auth-credentials-section');
        const sec2fa = document.getElementById('auth-2fa-section');
        const tabsRow = document.getElementById('auth-tabs-container');
        const sBtn = document.getElementById('auth-submit-btn');
        const tTxt = document.getElementById('auth-title-txt');
        const mInp = document.getElementById('auth-modal-mode');
        const codeInp = document.getElementById('auth-2fa-code-inp');

        if (secCreds) secCreds.style.display = 'none';
        if (sec2fa) sec2fa.style.display = 'block';
        if (tabsRow) tabsRow.style.display = 'none';
        if (mInp) mInp.value = '2fa';
        if (tTxt) tTxt.innerText = 'Двухфакторная защита (2FA)';

        if (sBtn) {
            sBtn.disabled = false;
            sBtn.innerText = 'Подтвердить вход 🛡️';
        }

        if (codeInp) {
            codeInp.value = '';
            setTimeout(() => codeInp.focus(), 100);
        }
    }

    // ГЛАВНЫЙ ОБРАБОТЧИК ФОРМЫ
    window.submitAuthForm = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const mode = document.getElementById('auth-modal-mode')?.value || 'login';

        if (mode === '2fa') {
            const rawCode = document.getElementById('auth-2fa-code-inp')?.value || '';
            const cleanCode = rawCode.replace(/\D/g, '');

            if (!cleanCode || cleanCode.length !== 6) {
                notify("❌ Введите 6 цифр из приложения!");
                return false;
            }

            window.submit2faVerification(pending2faLogin, cleanCode);
            return false;
        }

        const login = document.getElementById('auth-login-inp')?.value.trim() || '';
        const pass = document.getElementById('auth-pass-inp')?.value || '';

        if (!login || !pass) {
            notify("❌ Заполните логин и пароль!");
            return false;
        }

        if (mode === 'register') {
            window.authRegister(login, pass);
        } else {
            window.authLogin(login, pass);
        }
        return false;
    };

    window.authLogin = async function(login, password) {
        const sBtn = document.getElementById('auth-submit-btn');
        if (sBtn) { sBtn.disabled = true; sBtn.innerText = 'Вход...'; }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            const data = await res.json();

            if (data.require_2fa) {
                show2faInputPrompt(data.login);
                return;
            }

            if (sBtn) sBtn.disabled = false;

            if (data.success) {
                window.currentUser = data.user;
                applyUserSession(data.user);
                window.closeAuthModal();
                notify(`👋 Добро пожаловать, <b>${data.user.login}</b>!`);
            } else {
                if (sBtn) sBtn.innerText = 'Войти в аккаунт';
                notify("❌ " + (data.error || "Неверный логин или пароль"));
            }
        } catch (e) {
            if (sBtn) { sBtn.disabled = false; sBtn.innerText = 'Войти в аккаунт'; }
            notify("Ошибка сети при авторизации");
        }
    };

    window.submit2faVerification = async function(login, code) {
        const sBtn = document.getElementById('auth-submit-btn');
        if (sBtn) { sBtn.disabled = true; sBtn.innerText = 'Проверка кода...'; }

        try {
            const res = await fetch('/api/auth/verify_2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: login || 'Вячеслав', code })
            });
            const data = await res.json();

            if (data.success) {
                // Закрываем модалку в первую очередь
                window.closeAuthModal();
                if (window.notify) notify(`🛡️ 2FA подтверждён! Добро пожаловать, <b>${data.user.login}</b>!`, 3000);

                // Перезагружаем страницу через 400 мс — браузер откроется уже с кукой сессии
                setTimeout(() => {
                    location.reload();
                }, 400);
            } else {
                if (sBtn) { sBtn.disabled = false; sBtn.innerText = 'Подтвердить вход 🛡️'; }
                if (window.notify) notify("❌ " + (data.error || "Неверный код 2FA"), 4000);
            }
        } catch (e) {
            if (sBtn) { sBtn.disabled = false; sBtn.innerText = 'Подтвердить вход 🛡️'; }
            if (window.notify) notify("Ошибка сети при проверке 2FA");
        }
    };

    window.authRegister = async function(login, password) {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            const data = await res.json();
            if (data.success) {
                window.currentUser = data.user;
                applyUserSession(data.user);
                window.closeAuthModal();
                notify(`🎉 Аккаунт <b>${data.user.login}</b> создан!`);
            } else {
                notify("❌ " + (data.error || "Ошибка регистрации"));
            }
        } catch (e) {
            notify("Ошибка сети при регистрации");
        }
    };

    window.authLogout = async function() {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
        window.currentUser = null;
        applyGuestSession();
        notify("Вы вышли из аккаунта ⏹");
        window.openAuthModal('login');
    };

    window.copy2FASecretKey = function() {
        const keyEl = document.getElementById('os-2fa-key-txt');
        const key = keyEl ? keyEl.innerText.trim() : '';
        if (!key || key === 'SECRET_KEY') return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(key).then(() => {
                notify("📋 <b>Ключ скопирован в буфер!</b>");
            }).catch(() => fallbackCopy(key));
        } else {
            fallbackCopy(key);
        }
    };

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            document.execCommand('copy');
            notify("📋 <b>Ключ скопирован!</b>");
        } catch (_) {}
        document.body.removeChild(ta);
    }

    window.setup2FA = async function() {
        if (!window.currentUser || window.currentUser.role === 'guest') {
            notify("❌ Сначала войдите в аккаунт!");
            window.openAuthModal('login');
            return;
        }

        try {
            const res = await fetch('/api/auth/setup_2fa', { method: 'POST' });
            const data = await res.json();
            if (!data.success) {
                notify("❌ " + (data.error || "Ошибка"));
                return;
            }

            const modal = document.getElementById('os-2fa-setup-modal');
            const keyEl = document.getElementById('os-2fa-key-txt');
            const qrImg = document.getElementById('os-2fa-qr-img');
            const inp = document.getElementById('os-2fa-confirm-inp');

            if (keyEl) keyEl.innerText = data.secret;
            if (inp) inp.value = '';
            if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data.otpauth_url)}`;
            if (modal) modal.style.display = 'flex';
        } catch (e) {
            notify("Ошибка сети при настройке 2FA");
        }
    };

    window.confirmAndEnable2FA = async function() {
        const inp = document.getElementById('os-2fa-confirm-inp');
        const rawCode = inp ? inp.value : '';
        const code = rawCode.replace(/\D/g, '');

        if (!code || code.length !== 6) {
            notify("Введите 6 цифр из приложения!");
            return;
        }

        try {
            const res = await fetch('/api/auth/enable_2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (data.success) {
                notify("🛡️ <b>2FA активирована!</b>", 4000);
                document.getElementById('os-2fa-setup-modal').style.display = 'none';
                if (window.currentUser) window.currentUser.totp_enabled = true;
                update2FAStatusUI(true);
            } else {
                notify("❌ " + data.error);
            }
        } catch (e) {
            notify("Ошибка проверки кода");
        }
    };

    window.disable2FA = async function() {
        if (!confirm("Отключить двухфакторную защиту (2FA)?")) return;
        try {
            const res = await fetch('/api/auth/disable_2fa', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                notify("2FA отключена ⏹");
                if (window.currentUser) window.currentUser.totp_enabled = false;
                update2FAStatusUI(false);
            }
        } catch (e) {
            notify("Ошибка сети");
        }
    };

    function update2FAStatusUI(enabled) {
        ['prof-2fa-status-tag', 'admin-2fa-status-tag'].forEach(id => {
            const tag = document.getElementById(id);
            if (tag) {
                tag.innerText = enabled ? 'ВКЛЮЧЕНА ✓' : 'ВЫКЛЮЧЕНА';
                tag.style.color = enabled ? '#10b981' : '#f59e0b';
            }
        });
        ['prof-2fa-setup-btn', 'admin-2fa-setup-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = enabled ? 'none' : 'inline-block';
        });
        ['prof-2fa-disable-btn', 'admin-2fa-disable-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = enabled ? 'inline-block' : 'none';
        });
    }

    document.addEventListener('DOMContentLoaded', window.checkCurrentAuth);
})();
