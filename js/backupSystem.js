/**
 * نظام النسخ الاحتياطي
 * يدير عمليات النسخ الاحتياطي والاستعادة للبيانات
 * يدعم التخزين المحلي والسحابي
 */

(function() {
    'use strict';

    /**
     * نظام النسخ الاحتياطي الرئيسي
     */
    const BackupSystem = {
        /**
         * إنشاء نسخة احتياطية
         * @param {boolean} silent - إنشاء بدون رسائل
         * @returns {Promise<Object>} بيانات النسخة الاحتياطية
         */
        async createBackup(silent = false) {
            try {
                if (!silent) {
                    showNotification('جاري إنشاء النسخة الاحتياطية...', 'info');
                }

                // جمع جميع البيانات
                const backupData = {
                    version: '2.0',
                    timestamp: new Date().toISOString(),
                    app: 'نظام إدارة كروت الشبكات',
                    data: {
                        stores: data.stores || [],
                        packages: data.packages || [],
                        inventory: data.inventory || [],
                        sales: data.sales || [],
                        payments: data.payments || [],
                        expenses: data.expenses || [],
                        trash: data.trash || [],
                        settings: AppSettings.getAll()
                    },
                    metadata: {
                        storesCount: data.stores?.length || 0,
                        salesCount: data.sales?.length || 0,
                        paymentsCount: data.payments?.length || 0,
                        expensesCount: data.expenses?.length || 0,
                        totalRecords: 0
                    }
                };

                // حساب إجمالي السجلات
                backupData.metadata.totalRecords = Object.values(backupData.data)
                    .filter(Array.isArray)
                    .reduce((sum, arr) => sum + arr.length, 0);

                // الحصول على إعدادات النسخ الاحتياطي
                const backupSettings = AppSettings.get('backup') || {};
                
                // تطبيق الضغط إذا كان مفعلاً
                if (backupSettings.compress) {
                    backupData.compressed = true;
                    backupData.data = this.compressData(JSON.stringify(backupData.data));
                }

                // تطبيق التشفير إذا كان مفعلاً
                if (backupSettings.encrypt) {
                    backupData.encrypted = true;
                    const password = await this.getPassword();
                    if (password) {
                        backupData.data = this.encryptData(backupData.data, password);
                    }
                }

                // حفظ النسخة حسب المكان المحدد
                await this.saveBackup(backupData, backupSettings.location);

                if (!silent) {
                    showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
                }

                return backupData;

            } catch (error) {
                console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
                showNotification('فشل إنشاء النسخة الاحتياطية', 'error');
                throw error;
            }
        },

        /**
         * حفظ النسخة الاحتياطية
         * @param {Object} backupData - بيانات النسخة
         * @param {string} location - مكان الحفظ
         */
        async saveBackup(backupData, location = 'local') {
            const filename = `backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
            
            switch(location) {
                case 'local':
                    // تحميل كملف محلي
                    this.downloadBackup(backupData, filename);
                    break;
                    
                case 'browser':
                    // حفظ في متصفح (localStorage)
                    this.saveToBrowser(backupData);
                    break;
                    
                case 'drive':
                    // Google Drive - عرض الحلول المبتكرة
                    this.downloadBackup(backupData, filename);
                    // تأخير بسيط للتأكد من تحميل المكتبة
                    setTimeout(() => {
                        if (typeof window.CloudStorageHelper !== 'undefined' && window.CloudStorageHelper.showAllSolutions) {
                            window.CloudStorageHelper.showAllSolutions(backupData, filename);
                        } else if (typeof window.showGoogleDriveInstructions === 'function') {
                            // استخدام الحل الاحتياطي
                            window.showGoogleDriveInstructions(backupData);
                        } else {
                            this.showCloudInstructions('drive', backupData, filename);
                        }
                    }, 100);
                    break;
                    
                case 'dropbox':
                    // Dropbox - عرض الحلول المبتكرة
                    this.downloadBackup(backupData, filename);
                    // تأخير بسيط للتأكد من تحميل المكتبة
                    setTimeout(() => {
                        if (typeof window.CloudStorageHelper !== 'undefined' && window.CloudStorageHelper.showAllSolutions) {
                            window.CloudStorageHelper.showAllSolutions(backupData, filename);
                        } else {
                            this.showCloudInstructions('dropbox', backupData, filename);
                        }
                    }, 100);
                    break;
                    
                case 'github':
                    // GitHub Gist - يستخدم النظام الموجود
                    await this.saveToGithub(backupData);
                    break;
                    
                default:
                    this.downloadBackup(backupData, filename);
            }
        },

        /**
         * تحميل النسخة كملف
         * @param {Object} data - البيانات
         * @param {string} filename - اسم الملف
         */
        downloadBackup(data, filename) {
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        /**
         * حفظ في المتصفح
         * @param {Object} data - البيانات
         */
        saveToBrowser(data) {
            try {
                // حفظ في localStorage
                const key = `backup_${Date.now()}`;
                localStorage.setItem(key, JSON.stringify(data));
                
                // حفظ قائمة النسخ
                let backupsList = JSON.parse(localStorage.getItem('backupsList') || '[]');
                backupsList.push({
                    key: key,
                    timestamp: data.timestamp,
                    size: JSON.stringify(data).length,
                    metadata: data.metadata
                });
                
                // الاحتفاظ بآخر 10 نسخ فقط
                if (backupsList.length > 10) {
                    const oldBackup = backupsList.shift();
                    localStorage.removeItem(oldBackup.key);
                }
                
                localStorage.setItem('backupsList', JSON.stringify(backupsList));
                
                showNotification('تم حفظ النسخة في المتصفح', 'success');
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    showNotification('لا توجد مساحة كافية في المتصفح', 'error');
                } else {
                    throw error;
                }
            }
        },

        /**
         * عرض تعليمات التخزين السحابي
         * @param {string} service - نوع الخدمة
         * @param {Object} data - البيانات
         * @param {string} filename - اسم الملف
         */
        showCloudInstructions(service, data, filename) {
            // إنشاء كود Google Colab
            const dataStr = JSON.stringify(data, null, 2);
            const colabCode = `# كود Python لحفظ النسخة الاحتياطية في Google Drive
from google.colab import drive
import json
from datetime import datetime

# ربط Google Drive
drive.mount('/content/drive')

# البيانات
backup_data = '''${dataStr}'''

# حفظ الملف
filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
filepath = f"/content/drive/MyDrive/{filename}"

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(backup_data)

print(f"✅ تم حفظ النسخة في: {filename}")`;
            
            // عرض التعليمات
            const instructions = {
                drive: {
                    title: 'حفظ في Google Drive',
                    content: `
                        <div class="accordion" id="driveInstructions">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#colabMethod">
                                        <strong>الطريقة 1: Google Colab (الأسهل والأسرع)</strong>
                                    </button>
                                </h2>
                                <div id="colabMethod" class="accordion-collapse collapse show">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>افتح <a href="https://colab.research.google.com" target="_blank">Google Colab</a></li>
                                            <li>أنشئ دفتر ملاحظات جديد</li>
                                            <li>انسخ الكود التالي:</li>
                                        </ol>
                                        <pre class="bg-dark text-light p-3 rounded" style="max-height: 300px; overflow-y: auto;"><code>${this.escapeHtml(colabCode)}</code></pre>
                                        <button class="btn btn-primary mt-2" onclick="navigator.clipboard.writeText(\`${colabCode.replace(/`/g, '\\`')}\`); showNotification('تم نسخ الكود!', 'success')">
                                            <i class="fas fa-copy"></i> نسخ الكود
                                        </button>
                                        <ol start="4">
                                            <li>الصق الكود في Colab واضغط تشغيل ▶️</li>
                                            <li>اسمح بالوصول لـ Drive</li>
                                            <li>انتظر رسالة النجاح!</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#manualMethod">
                                        الطريقة 2: الرفع اليدوي
                                    </button>
                                </h2>
                                <div id="manualMethod" class="accordion-collapse collapse">
                                    <div class="accordion-body">
                                        <p>تم تحميل الملف: <strong>${filename}</strong></p>
                                        <ol>
                                            <li>افتح <a href="https://drive.google.com" target="_blank">Google Drive</a></li>
                                            <li>اضغط على "جديد" أو "New"</li>
                                            <li>اختر "رفع ملف" أو "File upload"</li>
                                            <li>اختر الملف من مجلد التنزيلات</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                dropbox: {
                    title: 'حفظ في Dropbox',
                    content: `
                        <div class="accordion" id="dropboxInstructions">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sendToDropbox">
                                        <strong>الطريقة 1: Send to Dropbox (الأسهل)</strong>
                                    </button>
                                </h2>
                                <div id="sendToDropbox" class="accordion-collapse collapse show">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>سجل في <a href="https://sendtodropbox.com" target="_blank">Send to Dropbox</a></li>
                                            <li>احصل على بريدك الخاص (مثل: yourname.xyz@sendtodropbox.com)</li>
                                            <li>أرسل الملف المحمّل إلى هذا البريد</li>
                                            <li>سيظهر تلقائياً في Dropbox!</li>
                                        </ol>
                                        <p class="alert alert-success">
                                            <strong>ملاحظة:</strong> الملف <strong>${filename}</strong> محفوظ في مجلد التنزيلات
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#dropboxManual">
                                        الطريقة 2: الرفع اليدوي
                                    </button>
                                </h2>
                                <div id="dropboxManual" class="accordion-collapse collapse">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>افتح <a href="https://dropbox.com" target="_blank">Dropbox</a></li>
                                            <li>اضغط على "رفع" أو "Upload"</li>
                                            <li>اختر الملف: <strong>${filename}</strong></li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                }
            };
            
            const info = instructions[service];
            if (info) {
                // إنشاء نافذة التعليمات
                const modal = `
                    <div class="modal fade" id="cloudInstructionsModal" tabindex="-1">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">
                                        <i class="${service === 'drive' ? 'fab fa-google-drive' : 'fab fa-dropbox'}"></i>
                                        ${info.title}
                                    </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    ${info.content}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // إضافة وعرض النافذة
                const modalEl = document.createElement('div');
                modalEl.innerHTML = modal;
                document.body.appendChild(modalEl.firstElementChild);
                const modalInstance = new bootstrap.Modal(document.getElementById('cloudInstructionsModal'));
                modalInstance.show();
                
                // إزالة النافذة عند الإغلاق
                document.getElementById('cloudInstructionsModal').addEventListener('hidden.bs.modal', function() {
                    this.remove();
                });
            }
        },

        /**
         * حفظ في GitHub
         * @param {Object} data - البيانات
         */
        async saveToGithub(data) {
            if (typeof githubUploadData === 'function') {
                try {
                    await githubUploadData();
                    showNotification('تم رفع النسخة إلى GitHub', 'success');
                } catch (error) {
                    showNotification('فشل الرفع إلى GitHub - تحقق من الإعدادات', 'error');
                    // تحميل محلي كبديل
                    this.downloadBackup(data, `backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`);
                }
            } else {
                showNotification('GitHub غير مهيأ - سيتم التحميل محلياً', 'warning');
                this.downloadBackup(data, `backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`);
            }
        },

        /**
         * ضغط البيانات
         * @param {string} str - النص
         * @returns {string} النص المضغوط
         */
        compressData(str) {
            // استخدام ضغط بسيط (يمكن استبداله بمكتبة ضغط حقيقية)
            return btoa(encodeURIComponent(str));
        },

        /**
         * فك ضغط البيانات
         * @param {string} str - النص المضغوط
         * @returns {string} النص الأصلي
         */
        decompressData(str) {
            return decodeURIComponent(atob(str));
        },

        /**
         * تشفير البيانات
         * @param {string} data - البيانات
         * @param {string} password - كلمة المرور
         * @returns {string} البيانات المشفرة
         */
        encryptData(data, password) {
            // استخدام تشفير بسيط (يُفضل استخدام مكتبة تشفير قوية)
            if (typeof simpleEncrypt === 'function') {
                return simpleEncrypt(data, password);
            }
            return data; // إرجاع البيانات كما هي إذا لم يكن التشفير متاحاً
        },

        /**
         * فك تشفير البيانات
         * @param {string} data - البيانات المشفرة
         * @param {string} password - كلمة المرور
         * @returns {string} البيانات الأصلية
         */
        decryptData(data, password) {
            if (typeof simpleDecrypt === 'function') {
                return simpleDecrypt(data, password);
            }
            return data;
        },

        /**
         * الحصول على كلمة المرور من المستخدم
         * @returns {Promise<string>} كلمة المرور
         */
        async getPassword() {
            return new Promise((resolve) => {
                const password = prompt('أدخل كلمة مرور للتشفير (اختياري):');
                resolve(password || null);
            });
        },

        /**
         * استعادة نسخة احتياطية
         * @param {File} file - ملف النسخة الاحتياطية
         */
        async restoreBackup(file) {
            try {
                showNotification('جاري استعادة النسخة الاحتياطية...', 'info');
                
                const text = await file.text();
                let backupData = JSON.parse(text);
                
                // التحقق من صحة البيانات
                if (!backupData.version || !backupData.data) {
                    throw new Error('ملف نسخة احتياطية غير صالح');
                }
                
                // فك التشفير إذا كان مشفراً
                if (backupData.encrypted) {
                    const password = await this.getPassword();
                    if (!password) {
                        showNotification('التشفير مطلوب - تم إلغاء الاستعادة', 'warning');
                        return;
                    }
                    backupData.data = this.decryptData(backupData.data, password);
                }
                
                // فك الضغط إذا كان مضغوطاً
                if (backupData.compressed) {
                    backupData.data = JSON.parse(this.decompressData(backupData.data));
                }
                
                // استعادة البيانات
                if (typeof backupData.data === 'string') {
                    backupData.data = JSON.parse(backupData.data);
                }
                
                // تطبيق البيانات
                Object.assign(data, backupData.data);
                
                // حفظ البيانات
                saveData();
                
                // استعادة الإعدادات إذا كانت موجودة
                if (backupData.data.settings) {
                    AppSettings.import(JSON.stringify({
                        settings: backupData.data.settings,
                        version: '1.0.0'
                    }));
                }
                
                showNotification('تمت استعادة النسخة الاحتياطية بنجاح', 'success');
                
                // تحديث جميع الواجهات
                if (typeof refreshCurrentView === 'function') {
                    refreshCurrentView();
                }
                
            } catch (error) {
                console.error('خطأ في استعادة النسخة:', error);
                showNotification('فشلت استعادة النسخة الاحتياطية', 'error');
            }
        },

        /**
         * عرض قائمة النسخ المحفوظة في المتصفح
         */
        showBrowserBackups() {
            const backupsList = JSON.parse(localStorage.getItem('backupsList') || '[]');
            
            if (backupsList.length === 0) {
                showNotification('لا توجد نسخ احتياطية محفوظة', 'info');
                return;
            }
            
            // إنشاء قائمة بالنسخ
            let html = '<div class="list-group">';
            backupsList.forEach(backup => {
                const date = moment(backup.timestamp).format('YYYY-MM-DD HH:mm');
                const size = (backup.size / 1024).toFixed(2) + ' KB';
                html += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${date}</h6>
                                <small>الحجم: ${size} | السجلات: ${backup.metadata.totalRecords}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-primary" onclick="BackupSystem.restoreBrowserBackup('${backup.key}')">
                                    استعادة
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="BackupSystem.deleteBrowserBackup('${backup.key}')">
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            // عرض في نافذة
            const modal = `
                <div class="modal fade" id="browserBackupsModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">النسخ الاحتياطية المحفوظة</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${html}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const modalEl = document.createElement('div');
            modalEl.innerHTML = modal;
            document.body.appendChild(modalEl.firstElementChild);
            const modalInstance = new bootstrap.Modal(document.getElementById('browserBackupsModal'));
            modalInstance.show();
            
            document.getElementById('browserBackupsModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        },

        /**
         * استعادة نسخة من المتصفح
         * @param {string} key - مفتاح النسخة
         */
        async restoreBrowserBackup(key) {
            try {
                const backupStr = localStorage.getItem(key);
                if (!backupStr) {
                    showNotification('النسخة غير موجودة', 'error');
                    return;
                }
                
                const backupData = JSON.parse(backupStr);
                const file = new File([JSON.stringify(backupData)], 'backup.json', { type: 'application/json' });
                await this.restoreBackup(file);
                
                // إغلاق النافذة
                const modal = bootstrap.Modal.getInstance(document.getElementById('browserBackupsModal'));
                if (modal) modal.hide();
                
            } catch (error) {
                console.error('خطأ في استعادة النسخة:', error);
                showNotification('فشلت استعادة النسخة', 'error');
            }
        },

        /**
         * تنظيف HTML
         */
        escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        },

        /**
         * حذف نسخة من المتصفح
         * @param {string} key - مفتاح النسخة
         */
        deleteBrowserBackup(key) {
            if (!confirm('هل أنت متأكد من حذف هذه النسخة؟')) return;
            
            try {
                localStorage.removeItem(key);
                
                // تحديث القائمة
                let backupsList = JSON.parse(localStorage.getItem('backupsList') || '[]');
                backupsList = backupsList.filter(b => b.key !== key);
                localStorage.setItem('backupsList', JSON.stringify(backupsList));
                
                showNotification('تم حذف النسخة', 'success');
                
                // تحديث العرض
                this.showBrowserBackups();
                
            } catch (error) {
                console.error('خطأ في حذف النسخة:', error);
                showNotification('فشل حذف النسخة', 'error');
            }
        }
    };

    // تصدير النظام
    window.BackupSystem = BackupSystem;
    
    // دالة مختصرة للاستخدام السريع
    window.createBackup = () => BackupSystem.createBackup();
    window.restoreBackup = (file) => BackupSystem.restoreBackup(file);

})();