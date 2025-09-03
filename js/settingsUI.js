/**
 * ملف settingsUI.js - واجهة المستخدم لنظام الإعدادات
 * يدير عرض وتحديث الإعدادات في الواجهة
 * يتكامل مع settings.js لتطبيق التغييرات
 */

(function() {
    'use strict';

    /**
     * تهيئة واجهة الإعدادات
     * يتم استدعاؤها عند تحميل الصفحة
     */
    function initSettingsUI() {
        // التحقق من وجود AppSettings
        if (typeof window.AppSettings === 'undefined') {
            console.error('AppSettings غير موجود. تأكد من تحميل settings.js أولاً');
            return;
        }

        // تحميل الإعدادات الحالية في الواجهة
        loadSettingsToUI();

        // إضافة مستمعات الأحداث
        setupEventListeners();

        // إنشاء محتوى التبويبات الديناميكي
        createSettingsTabs();
    }

    /**
     * تحميل الإعدادات الحالية في عناصر الواجهة
     */
    function loadSettingsToUI() {
        const settings = AppSettings.getAll();
        
        // تحميل إعدادات العرض
        setElementValue('setting-theme', settings.display.theme);
        setElementValue('setting-fontSize', settings.display.fontSize);
        setElementValue('setting-fontWeight', settings.display.fontWeight);
        setElementValue('setting-density', settings.display.density);
        setElementValue('setting-primaryColor', settings.display.primaryColor);
        setElementValue('setting-secondaryColor', settings.display.secondaryColor);
        setElementValue('setting-textColor', settings.display.textColor);
        setElementChecked('setting-animations', settings.display.animations);
        setElementChecked('setting-roundedCorners', settings.display.roundedCorners);

        // تحميل إعدادات المالية
        setElementValue('setting-currency', settings.financial.currency);
        setElementValue('setting-currencyName', settings.financial.currencyName);
        setElementValue('setting-currencyPosition', settings.financial.currencyPosition);
        setElementValue('setting-decimals', settings.financial.decimals);
        setElementValue('setting-taxRate', settings.financial.taxRate);
        setElementValue('setting-numberFormat', settings.financial.numberFormat);
        setElementChecked('setting-taxIncluded', settings.financial.taxIncluded);
        setElementChecked('setting-showZeroDecimals', settings.financial.showZeroDecimals);

        // تحميل إعدادات التنبيهات
        setElementChecked('setting-notificationsEnabled', settings.notifications.enabled);
        setElementChecked('setting-soundEnabled', settings.notifications.soundEnabled);
        setElementValue('setting-notificationPosition', settings.notifications.position);
        setElementValue('setting-notificationDuration', settings.notifications.duration / 1000);
        setElementChecked('setting-lowStockEnabled', settings.notifications.lowStock.enabled);
        setElementValue('setting-lowStockThreshold', settings.notifications.lowStock.threshold);
        setElementValue('setting-lowStockUrgent', settings.notifications.lowStock.urgentThreshold);

        // تحميل إعدادات النسخ الاحتياطي
        setElementChecked('setting-autoBackup', settings.backup.autoBackup);
        setElementValue('setting-backupFrequency', settings.backup.frequency);
        setElementValue('setting-backupTime', settings.backup.time);
        setElementValue('setting-keepCount', settings.backup.keepCount);
        setElementValue('setting-backupLocation', settings.backup.location);
        setElementChecked('setting-compress', settings.backup.compress);
        setElementChecked('setting-encrypt', settings.backup.encrypt);
        setElementChecked('setting-cloudSync', settings.backup.cloudSync);

        // تحميل إعدادات الأمان
        setElementChecked('setting-appLock', settings.security.appLock);
        setElementValue('setting-lockType', settings.security.lockType);
        setElementValue('setting-autoLockMinutes', settings.security.autoLockMinutes);
        setElementValue('setting-maxLoginAttempts', settings.security.maxLoginAttempts);
        setElementValue('setting-sessionTimeout', settings.security.sessionTimeout);
        setElementChecked('setting-encryptSensitive', settings.security.encryptSensitive);
        setElementChecked('setting-hideBalances', settings.security.hideBalances);
        setElementChecked('setting-activityLog', settings.security.activityLog);

        // تحميل إعدادات الأداء
        setElementChecked('setting-cacheEnabled', settings.performance.cacheEnabled);
        setElementValue('setting-cacheSize', settings.performance.cacheSize);
        setElementValue('setting-cacheDuration', settings.performance.cacheDuration);
        setElementChecked('setting-lazyLoading', settings.performance.lazyLoading);
        setElementValue('setting-itemsPerPage', settings.performance.itemsPerPage);
        setElementChecked('setting-offlineMode', settings.performance.offlineMode);
        setElementChecked('setting-powerSaveMode', settings.performance.powerSaveMode);
    }

    /**
     * إعداد مستمعات الأحداث
     */
    function setupEventListeners() {
        // مستمع لتبديل التبويبات
        const tabs = document.querySelectorAll('#settingsTabs .list-group-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                switchSettingsTab(tab.dataset.tab);
            });
        });

        // مستمع لزر التصدير
        const exportBtn = document.getElementById('exportSettingsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSettings);
        }

        // مستمع لزر الاستيراد
        const importBtn = document.getElementById('importSettingsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', importSettings);
        }
    }

    /**
     * تبديل التبويب النشط
     */
    function switchSettingsTab(tabName) {
        // إخفاء جميع التبويبات
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.style.display = 'none';
        });

        // إزالة active من جميع الروابط
        document.querySelectorAll('#settingsTabs .list-group-item').forEach(link => {
            link.classList.remove('active');
        });

        // إظهار التبويب المحدد
        const selectedTab = document.getElementById(`${tabName}-settings`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // تفعيل الرابط المحدد
        const selectedLink = document.querySelector(`#settingsTabs [data-tab="${tabName}"]`);
        if (selectedLink) {
            selectedLink.classList.add('active');
        }
    }

    /**
     * إنشاء محتوى التبويبات الديناميكي
     */
    function createSettingsTabs() {
        const container = document.getElementById('settingsContent');
        if (!container) return;

        const settings = AppSettings.getAll();
        
        // إنشاء HTML للتبويبات
        let html = '';

        // تبويب العرض والمظهر
        html += createDisplayTab(settings.display);
        
        // تبويب المالية والعملة
        html += createFinancialTab(settings.financial);
        
        // تبويب التنبيهات
        html += createNotificationsTab(settings.notifications);
        
        // تبويب النسخ الاحتياطي
        html += createBackupTab(settings.backup);
        
        // تبويب الأمان
        html += createSecurityTab(settings.security);
        
        // تبويب الأداء
        html += createPerformanceTab(settings.performance);

        container.innerHTML = html;

        // إعادة تحميل القيم
        loadSettingsToUI();
    }

    /**
     * إنشاء تبويب العرض والمظهر
     */
    function createDisplayTab(display) {
        return `
            <div class="settings-tab active" id="display-settings">
                <h5 class="mb-4"><i class="fas fa-palette"></i> إعدادات العرض والمظهر</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">المظهر</label>
                        <select class="form-select" id="setting-theme" onchange="AppSettings.update('display.theme', this.value)">
                            <option value="light">فاتح</option>
                            <option value="dark">داكن</option>
                            <option value="auto">تلقائي (حسب النظام)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">حجم الخط</label>
                        <select class="form-select" id="setting-fontSize" onchange="AppSettings.update('display.fontSize', this.value)">
                            <option value="tiny">صغير جداً</option>
                            <option value="small">صغير</option>
                            <option value="medium">متوسط</option>
                            <option value="large">كبير</option>
                            <option value="xlarge">كبير جداً</option>
                            <option value="huge">ضخم</option>
                            <option value="massive">ضخم جداً</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">وزن/سمك الخط</label>
                        <select class="form-select" id="setting-fontWeight" onchange="AppSettings.update('display.fontWeight', this.value)">
                            <option value="thin">رفيع جداً</option>
                            <option value="light">رفيع</option>
                            <option value="normal">عادي</option>
                            <option value="medium">متوسط</option>
                            <option value="semibold">شبه عريض</option>
                            <option value="bold">عريض</option>
                            <option value="extrabold">عريض جداً</option>
                            <option value="black">أسود</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">كثافة العرض</label>
                        <select class="form-select" id="setting-density" onchange="AppSettings.update('display.density', this.value)">
                            <option value="ultra-compact">مضغوط جداً</option>
                            <option value="compact">مضغوط</option>
                            <option value="normal">عادي</option>
                            <option value="comfortable">مريح</option>
                            <option value="spacious">واسع</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">اللون الرئيسي</label>
                        <div class="input-group">
                            <input type="color" class="form-control form-control-color" id="setting-primaryColor" 
                                   value="${display.primaryColor}" onchange="AppSettings.update('display.primaryColor', this.value)">
                            <input type="text" class="form-control" value="${display.primaryColor}" 
                                   onchange="document.getElementById('setting-primaryColor').value = this.value; AppSettings.update('display.primaryColor', this.value)">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">اللون الثانوي</label>
                        <div class="input-group">
                            <input type="color" class="form-control form-control-color" id="setting-secondaryColor"
                                   value="${display.secondaryColor}" onchange="AppSettings.update('display.secondaryColor', this.value)">
                            <input type="text" class="form-control" value="${display.secondaryColor}"
                                   onchange="document.getElementById('setting-secondaryColor').value = this.value; AppSettings.update('display.secondaryColor', this.value)">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">لون النص</label>
                        <div class="input-group">
                            <input type="color" class="form-control form-control-color" id="setting-textColor"
                                   value="${display.textColor}" onchange="AppSettings.update('display.textColor', this.value)">
                            <input type="text" class="form-control" value="${display.textColor}"
                                   onchange="document.getElementById('setting-textColor').value = this.value; AppSettings.update('display.textColor', this.value)">
                        </div>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-animations"
                                   ${display.animations ? 'checked' : ''} onchange="AppSettings.update('display.animations', this.checked)">
                            <label class="form-check-label" for="setting-animations">
                                تفعيل التأثيرات الحركية
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-roundedCorners"
                                   ${display.roundedCorners ? 'checked' : ''} onchange="AppSettings.update('display.roundedCorners', this.checked)">
                            <label class="form-check-label" for="setting-roundedCorners">
                                الزوايا المستديرة
                            </label>
                        </div>
                    </div>
                </div>

                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> التغييرات على إعدادات العرض تطبق فوراً
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب المالية والعملة
     */
    function createFinancialTab(financial) {
        return `
            <div class="settings-tab" id="financial-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-money-bill"></i> إعدادات المالية والعملة</h5>
                
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">رمز العملة</label>
                        <input type="text" class="form-control" id="setting-currency" 
                               value="${financial.currency}" placeholder="SAR" 
                               onchange="AppSettings.update('financial.currency', this.value)">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">اسم العملة</label>
                        <input type="text" class="form-control" id="setting-currencyName"
                               value="${financial.currencyName}" placeholder="ريال" 
                               onchange="AppSettings.update('financial.currencyName', this.value)">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">موضع العملة</label>
                        <select class="form-select" id="setting-currencyPosition"
                                onchange="AppSettings.update('financial.currencyPosition', this.value)">
                            <option value="after" ${financial.currencyPosition === 'after' ? 'selected' : ''}>بعد الرقم</option>
                            <option value="before" ${financial.currencyPosition === 'before' ? 'selected' : ''}>قبل الرقم</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">عدد الخانات العشرية</label>
                        <input type="number" class="form-control" id="setting-decimals"
                               value="${financial.decimals}" min="0" max="4" 
                               onchange="AppSettings.update('financial.decimals', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">نسبة الضريبة %</label>
                        <input type="number" class="form-control" id="setting-taxRate"
                               value="${financial.taxRate}" min="0" max="100" step="0.5" 
                               onchange="AppSettings.update('financial.taxRate', parseFloat(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">صيغة الأرقام</label>
                        <select class="form-select" id="setting-numberFormat"
                                onchange="AppSettings.update('financial.numberFormat', this.value)">
                            <option value="en" ${financial.numberFormat === 'en' ? 'selected' : ''}>إنجليزية (123)</option>
                            <option value="ar" ${financial.numberFormat === 'ar' ? 'selected' : ''}>عربية (١٢٣)</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-taxIncluded"
                                   ${financial.taxIncluded ? 'checked' : ''} 
                                   onchange="AppSettings.update('financial.taxIncluded', this.checked)">
                            <label class="form-check-label" for="setting-taxIncluded">
                                الضريبة مضمنة في السعر
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-showZeroDecimals"
                                   ${financial.showZeroDecimals ? 'checked' : ''} 
                                   onchange="AppSettings.update('financial.showZeroDecimals', this.checked)">
                            <label class="form-check-label" for="setting-showZeroDecimals">
                                عرض الأصفار العشرية
                            </label>
                        </div>
                    </div>
                </div>

                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> تغيير إعدادات العملة لا يؤثر على البيانات المحفوظة مسبقاً
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب التنبيهات
     */
    function createNotificationsTab(notifications) {
        return `
            <div class="settings-tab" id="notifications-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-bell"></i> إعدادات التنبيهات والإشعارات</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-notificationsEnabled"
                                   ${notifications.enabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('notifications.enabled', this.checked)">
                            <label class="form-check-label" for="setting-notificationsEnabled">
                                تفعيل التنبيهات
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-soundEnabled"
                                   ${notifications.soundEnabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('notifications.soundEnabled', this.checked)">
                            <label class="form-check-label" for="setting-soundEnabled">
                                تفعيل الأصوات
                            </label>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary mt-2" onclick="testNotificationSound()">
                            <i class="fas fa-volume-up"></i> اختبار الصوت
                        </button>
                        
                        <div class="mt-3">
                            <label class="form-label">مستوى الصوت: <span id="volumeValue">${notifications.soundVolume || 50}%</span></label>
                            <input type="range" class="form-range" id="setting-soundVolume"
                                   min="0" max="100" step="10" 
                                   value="${notifications.soundVolume || 50}"
                                   onchange="AppSettings.update('notifications.soundVolume', parseInt(this.value)); document.getElementById('volumeValue').textContent = this.value + '%';">
                        </div>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">موضع التنبيهات</label>
                        <select class="form-select" id="setting-notificationPosition"
                                onchange="AppSettings.update('notifications.position', this.value)">
                            <option value="top-right" ${notifications.position === 'top-right' ? 'selected' : ''}>أعلى اليمين</option>
                            <option value="top-left" ${notifications.position === 'top-left' ? 'selected' : ''}>أعلى اليسار</option>
                            <option value="bottom-right" ${notifications.position === 'bottom-right' ? 'selected' : ''}>أسفل اليمين</option>
                            <option value="bottom-left" ${notifications.position === 'bottom-left' ? 'selected' : ''}>أسفل اليسار</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">مدة العرض (ثانية)</label>
                        <input type="number" class="form-control" id="setting-notificationDuration"
                               value="${notifications.duration / 1000}" min="1" max="10" step="0.5" 
                               onchange="AppSettings.update('notifications.duration', this.value * 1000)">
                    </div>
                </div>

                <hr>
                <h6>تنبيهات المخزون</h6>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-lowStockEnabled"
                                   ${notifications.lowStock.enabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('notifications.lowStock.enabled', this.checked)">
                            <label class="form-check-label" for="setting-lowStockEnabled">
                                تفعيل تنبيه المخزون المنخفض
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">الحد الأدنى</label>
                        <input type="number" class="form-control" id="setting-lowStockThreshold"
                               value="${notifications.lowStock.threshold}" min="1" 
                               onchange="AppSettings.update('notifications.lowStock.threshold', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">الحد الحرج</label>
                        <input type="number" class="form-control" id="setting-lowStockUrgent"
                               value="${notifications.lowStock.urgentThreshold}" min="1" 
                               onchange="AppSettings.update('notifications.lowStock.urgentThreshold', parseInt(this.value))">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب النسخ الاحتياطي
     */
    function createBackupTab(backup) {
        return `
            <div class="settings-tab" id="backup-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-cloud-upload-alt"></i> إعدادات النسخ الاحتياطي</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-autoBackup"
                                   ${backup.autoBackup ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.autoBackup', this.checked)">
                            <label class="form-check-label" for="setting-autoBackup">
                                النسخ الاحتياطي التلقائي
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">التكرار</label>
                        <select class="form-select" id="setting-backupFrequency"
                                onchange="AppSettings.update('backup.frequency', this.value)">
                            <option value="hourly" ${backup.frequency === 'hourly' ? 'selected' : ''}>كل ساعة</option>
                            <option value="daily" ${backup.frequency === 'daily' ? 'selected' : ''}>يومياً</option>
                            <option value="weekly" ${backup.frequency === 'weekly' ? 'selected' : ''}>أسبوعياً</option>
                            <option value="monthly" ${backup.frequency === 'monthly' ? 'selected' : ''}>شهرياً</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">وقت النسخ</label>
                        <input type="time" class="form-control" id="setting-backupTime"
                               value="${backup.time}" onchange="AppSettings.update('backup.time', this.value)">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">عدد النسخ المحفوظة</label>
                        <input type="number" class="form-control" id="setting-keepCount"
                               value="${backup.keepCount}" min="1" max="30" 
                               onchange="AppSettings.update('backup.keepCount', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">مكان الحفظ</label>
                        <select class="form-select" id="setting-backupLocation"
                                onchange="AppSettings.update('backup.location', this.value)">
                            <option value="local" ${backup.location === 'local' ? 'selected' : ''}>محلي (جهازك)</option>
                            <option value="browser" ${backup.location === 'browser' ? 'selected' : ''}>المتصفح</option>
                            <option value="drive" ${backup.location === 'drive' ? 'selected' : ''}>Google Drive</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-compress"
                                   ${backup.compress ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.compress', this.checked)">
                            <label class="form-check-label" for="setting-compress">
                                ضغط البيانات
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-encrypt"
                                   ${backup.encrypt ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.encrypt', this.checked)">
                            <label class="form-check-label" for="setting-encrypt">
                                تشفير النسخ
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-cloudSync"
                                   ${backup.cloudSync ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.cloudSync', this.checked)">
                            <label class="form-check-label" for="setting-cloudSync">
                                المزامنة السحابية
                            </label>
                        </div>
                        <small class="text-muted d-block mt-1">
                            يحاول الرفع تلقائياً للسحابة عند إنشاء نسخة احتياطية
                        </small>
                    </div>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-primary" onclick="if(typeof createBackup === 'function') createBackup()">
                        <i class="fas fa-save"></i> إنشاء نسخة احتياطية الآن
                    </button>
                    <button class="btn btn-warning" onclick="if(typeof testGoogleDriveBackup === 'function') testGoogleDriveBackup()">
                        <i class="fas fa-vial"></i> اختبار Google Drive
                    </button>
                    
                    <button class="btn btn-info" onclick="if(typeof BackupSystem !== 'undefined') BackupSystem.createEmailBackup()">
                        <i class="fas fa-envelope"></i> إرسال بالبريد
                    </button>
                    
                    <button class="btn btn-secondary" onclick="document.getElementById('restoreBackupFile').click()">
                        <i class="fas fa-upload"></i> استعادة نسخة احتياطية
                    </button>
                    
                    <button class="btn btn-info" onclick="if(typeof BackupSystem !== 'undefined') BackupSystem.showBrowserBackups()">
                        <i class="fas fa-list"></i> النسخ المحفوظة
                    </button>
                </div>
                
                <input type="file" id="restoreBackupFile" accept=".json" style="display:none" 
                       onchange="if(this.files[0] && typeof restoreBackup === 'function') restoreBackup(this.files[0])">
                
                <div class="alert alert-info mt-3">
                    <h6><i class="fas fa-info-circle"></i> معلومات عن أماكن الحفظ:</h6>
                    <ul class="mb-0">
                        <li><strong>محلي (جهازك):</strong> يتم تحميل الملف مباشرة إلى مجلد التنزيلات - الأسرع والأبسط</li>
                        <li><strong>المتصفح:</strong> يحفظ في ذاكرة المتصفح، يمكن استعراض آخر 10 نسخ (محدود بـ 5-10 ميجا)</li>
                        <li><strong>Google Drive:</strong> 
                            <ul>
                                <li>يحمّل الملف أولاً ثم يعرض نافذة بحلول متعددة</li>
                                <li>أسهل طريقة: Google Colab (انسخ الكود والصقه)</li>
                                <li>أو: أرسل بالبريد ثم احفظ في Drive</li>
                            </ul>
                        </li>
                    </ul>
                    
                    <div class="alert alert-success mt-2 mb-0">
                        <strong>💡 نصيحة:</strong> ابدأ بـ "محلي" أو "المتصفح" - الأسهل والأسرع. 
                        Google Drive يحتاج خطوات إضافية لكنه يوفر أماناً أكثر.
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب الأمان
     */
    function createSecurityTab(security) {
        return `
            <div class="settings-tab" id="security-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-shield-alt"></i> إعدادات الأمان والخصوصية</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-appLock"
                                   ${security.appLock ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.appLock', this.checked)">
                            <label class="form-check-label" for="setting-appLock">
                                قفل التطبيق
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">نوع القفل</label>
                        <select class="form-select" id="setting-lockType"
                                onchange="AppSettings.update('security.lockType', this.value)">
                            <option value="none" ${security.lockType === 'none' ? 'selected' : ''}>بدون قفل</option>
                            <option value="pin" ${security.lockType === 'pin' ? 'selected' : ''}>رمز PIN</option>
                            <option value="password" ${security.lockType === 'password' ? 'selected' : ''}>كلمة مرور</option>
                            <option value="pattern" ${security.lockType === 'pattern' ? 'selected' : ''}>نمط</option>
                            <option value="biometric" ${security.lockType === 'biometric' ? 'selected' : ''}>بصمة</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">القفل التلقائي (دقائق)</label>
                        <input type="number" class="form-control" id="setting-autoLockMinutes"
                               value="${security.autoLockMinutes}" min="1" max="60" 
                               onchange="AppSettings.update('security.autoLockMinutes', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">محاولات الدخول القصوى</label>
                        <input type="number" class="form-control" id="setting-maxLoginAttempts"
                               value="${security.maxLoginAttempts}" min="3" max="10" 
                               onchange="AppSettings.update('security.maxLoginAttempts', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">مهلة الجلسة (دقائق)</label>
                        <input type="number" class="form-control" id="setting-sessionTimeout"
                               value="${security.sessionTimeout}" min="5" max="120" 
                               onchange="AppSettings.update('security.sessionTimeout', parseInt(this.value))">
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-encryptSensitive"
                                   ${security.encryptSensitive ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.encryptSensitive', this.checked)">
                            <label class="form-check-label" for="setting-encryptSensitive">
                                تشفير البيانات الحساسة
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-hideBalances"
                                   ${security.hideBalances ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.hideBalances', this.checked)">
                            <label class="form-check-label" for="setting-hideBalances">
                                إخفاء الأرصدة
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-activityLog"
                                   ${security.activityLog ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.activityLog', this.checked)">
                            <label class="form-check-label" for="setting-activityLog">
                                سجل النشاطات
                            </label>
                        </div>
                    </div>
                </div>

                <div class="alert alert-danger">
                    <i class="fas fa-lock"></i> تأكد من حفظ كلمة المرور أو رمز PIN في مكان آمن
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب الأداء
     */
    function createPerformanceTab(performance) {
        return `
            <div class="settings-tab" id="performance-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-tachometer-alt"></i> إعدادات الأداء</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-cacheEnabled"
                                   ${performance.cacheEnabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.cacheEnabled', this.checked)">
                            <label class="form-check-label" for="setting-cacheEnabled">
                                تفعيل الكاش الذكي
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">حجم الكاش</label>
                        <select class="form-select" id="setting-cacheSize"
                                onchange="AppSettings.update('performance.cacheSize', this.value)">
                            <option value="small" ${performance.cacheSize === 'small' ? 'selected' : ''}>صغير (100 عنصر)</option>
                            <option value="medium" ${performance.cacheSize === 'medium' ? 'selected' : ''}>متوسط (200 عنصر)</option>
                            <option value="large" ${performance.cacheSize === 'large' ? 'selected' : ''}>كبير (500 عنصر)</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">مدة الكاش (دقائق)</label>
                        <input type="number" class="form-control" id="setting-cacheDuration"
                               value="${performance.cacheDuration}" min="1" max="60" 
                               onchange="AppSettings.update('performance.cacheDuration', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">عدد العناصر بالصفحة</label>
                        <input type="number" class="form-control" id="setting-itemsPerPage"
                               value="${performance.itemsPerPage}" min="10" max="100" step="5" 
                               onchange="AppSettings.update('performance.itemsPerPage', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">فترة المزامنة (دقائق)</label>
                        <input type="number" class="form-control" id="setting-syncInterval"
                               value="${performance.syncInterval}" min="1" max="60" 
                               onchange="AppSettings.update('performance.syncInterval', parseInt(this.value))">
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-lazyLoading"
                                   ${performance.lazyLoading ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.lazyLoading', this.checked)">
                            <label class="form-check-label" for="setting-lazyLoading">
                                التحميل الكسول
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-offlineMode"
                                   ${performance.offlineMode ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.offlineMode', this.checked)">
                            <label class="form-check-label" for="setting-offlineMode">
                                الوضع دون اتصال
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-powerSaveMode"
                                   ${performance.powerSaveMode ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.powerSaveMode', this.checked)">
                            <label class="form-check-label" for="setting-powerSaveMode">
                                وضع توفير الطاقة
                            </label>
                        </div>
                    </div>
                </div>

                <button class="btn btn-warning" onclick="if(typeof balanceCache !== 'undefined') { balanceCache.clear(); reportCache.clear(); showNotification('تم مسح الكاش', 'success'); }">
                    <i class="fas fa-broom"></i> مسح الكاش
                </button>
            </div>
        `;
    }

    /**
     * وظائف مساعدة لتعيين القيم
     */
    function setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    function setElementChecked(id, checked) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = checked;
        }
    }

    /**
     * تصدير الإعدادات
     */
    function exportSettings() {
        const jsonString = AppSettings.export();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof showNotification === 'function') {
            showNotification('تم تصدير الإعدادات بنجاح', 'success');
        }
    }

    /**
     * استيراد الإعدادات
     */
    function importSettings() {
        const fileInput = document.getElementById('importSettingsFile');
        if (!fileInput || !fileInput.files.length) {
            if (typeof showNotification === 'function') {
                showNotification('الرجاء اختيار ملف الإعدادات', 'warning');
            }
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const success = AppSettings.import(e.target.result);
                if (success) {
                    loadSettingsToUI();
                    createSettingsTabs();
                }
            } catch (error) {
                console.error('خطأ في استيراد الإعدادات:', error);
                if (typeof showNotification === 'function') {
                    showNotification('فشل استيراد الإعدادات', 'error');
                }
            }
        };
        
        reader.readAsText(file);
    }

    // تصدير الوظائف للاستخدام العام
    window.SettingsUI = {
        init: initSettingsUI,
        switchTab: switchSettingsTab,
        reload: loadSettingsToUI,
        export: exportSettings,
        import: importSettings
    };

    // تهيئة الواجهة عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', initSettingsUI);

})();