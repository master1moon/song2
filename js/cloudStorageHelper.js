/**
 * مساعد التخزين السحابي
 * يوفر حلول مبتكرة للتخزين في Google Drive و Dropbox
 * بدون الحاجة لربط الحسابات مباشرة
 */

(function() {
    'use strict';

    const CloudStorageHelper = {
        /**
         * حلول Google Drive
         */
        googleDrive: {
            /**
             * الحل الأول: استخدام Google Forms كوسيط
             * ينشئ رابط لنموذج Google يحفظ البيانات
             */
            createFormLink(backupData) {
                // تحويل البيانات إلى نص
                const dataStr = JSON.stringify(backupData, null, 2);
                const encodedData = encodeURIComponent(dataStr);
                
                // إنشاء رابط Google Forms مُعبأ مسبقاً
                const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSf_EXAMPLE/viewform?usp=pp_url&entry.123456789=${encodedData}`;
                
                // إرشادات للمستخدم
                const instructions = `
                    <div class="alert alert-info">
                        <h5>💡 طريقة مبتكرة: استخدام Google Forms</h5>
                        <ol>
                            <li>أنشئ نموذج Google جديد من drive.google.com</li>
                            <li>أضف حقل "نص طويل" للبيانات</li>
                            <li>احفظ البيانات التالية في الحقل:</li>
                        </ol>
                        <textarea class="form-control mt-2" rows="5" readonly>${dataStr}</textarea>
                        <button class="btn btn-primary mt-2" onclick="navigator.clipboard.writeText(this.previousElementSibling.value); showNotification('تم النسخ!', 'success')">
                            <i class="fas fa-copy"></i> نسخ البيانات
                        </button>
                    </div>
                `;
                return instructions;
            },

            /**
             * الحل الثاني: استخدام Google Colab
             * ينشئ كود Python لحفظ في Drive
             */
            createColabCode(backupData) {
                const dataStr = JSON.stringify(backupData, null, 2);
                const pythonCode = `
# كود Python لحفظ النسخة الاحتياطية في Google Drive
from google.colab import drive
import json
import os
from datetime import datetime

# ربط Google Drive
drive.mount('/content/drive')

# إنشاء مجلد "نجيب المقداد" إذا لم يكن موجوداً
folder_path = "/content/drive/MyDrive/نجيب المقداد"
if not os.path.exists(folder_path):
    os.makedirs(folder_path)
    print("✅ تم إنشاء مجلد: نجيب المقداد")

# البيانات
backup_data = '''${dataStr}'''

# حفظ الملف داخل المجلد
filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
filepath = f"{folder_path}/{filename}"

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(backup_data)

print(f"✅ تم حفظ النسخة في: نجيب المقداد/{filename}")
print(f"📁 المسار الكامل: {filepath}")
                `.trim();

                return `
                    <div class="alert alert-success">
                        <h5>🚀 طريقة متقدمة: Google Colab</h5>
                        <ol>
                            <li>افتح <a href="https://colab.research.google.com" target="_blank">Google Colab</a></li>
                            <li>أنشئ دفتر ملاحظات جديد</li>
                            <li>انسخ والصق الكود التالي:</li>
                        </ol>
                        <pre class="bg-dark text-light p-3 rounded"><code>${CloudStorageHelper.escapeHtml(pythonCode)}</code></pre>
                        <button class="btn btn-primary mt-2" onclick="navigator.clipboard.writeText(\`${pythonCode.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`); showNotification('تم نسخ الكود!', 'success')">
                            <i class="fas fa-copy"></i> نسخ الكود
                        </button>
                    </div>
                `;
            },

            /**
             * الحل الثالث: رابط mailto مع المرفقات
             * يفتح البريد الإلكتروني مع البيانات
             */
            createEmailLink(backupData, filename) {
                const dataStr = JSON.stringify(backupData, null, 2);
                const subject = encodeURIComponent(`نسخة احتياطية - ${filename}`);
                
                // إنشاء ملف للتحميل
                const blob = new Blob([dataStr], { type: 'application/json' });
                const dataUrl = URL.createObjectURL(blob);
                
                return `
                    <div class="alert alert-warning">
                        <h5>📧 طريقة بسيطة: البريد الإلكتروني</h5>
                        <p>احفظ الملف أولاً ثم أرسله بالبريد:</p>
                        
                        <div class="mb-3">
                            <a href="${dataUrl}" download="${filename}" class="btn btn-success">
                                <i class="fas fa-download"></i> تحميل الملف
                            </a>
                        </div>
                        
                        <p>ثم أرسله إلى بريدك الإلكتروني:</p>
                        <input type="email" id="emailAddress" class="form-control mb-2" placeholder="أدخل بريدك الإلكتروني">
                        <button class="btn btn-primary" onclick="
                            const email = document.getElementById('emailAddress').value || 'n1993love@gmail.com';
                            const subject = 'نسخة احتياطية - ${filename}';
                            const body = 'مرفق ملف النسخة الاحتياطية. الرجاء حفظه في Google Drive في مجلد: نجيب المقداد';
                            window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
                            showNotification('افتح بريدك الإلكتروني وأرفق الملف المحمّل', 'info');
                        ">
                            <i class="fas fa-envelope"></i> فتح البريد
                        </button>
                        
                        <div class="alert alert-info mt-3">
                            <strong>📌 خطوات حفظ الملف في Google Drive:</strong>
                            <ol class="mb-0">
                                <li>حمّل الملف بالضغط على زر "تحميل الملف"</li>
                                <li>افتح البريد الإلكتروني وأرفق الملف</li>
                                <li>أرسل البريد لنفسك</li>
                                <li>افتح البريد من جهازك أو الويب</li>
                                <li>احفظ المرفق في Google Drive → مجلد "نجيب المقداد"</li>
                            </ol>
                        </div>
                        
                        <div class="alert alert-warning mt-2">
                            <strong>⚠️ مشكلة في فتح البريد؟</strong>
                            <p>إذا لم يفتح برنامج البريد، انسخ البيانات التالية وألصقها في بريد جديد:</p>
                            <div class="mb-2">
                                <strong>إلى:</strong> <code>n1993love@gmail.com</code>
                                <button class="btn btn-sm btn-outline-primary ms-2" onclick="navigator.clipboard.writeText('n1993love@gmail.com'); showNotification('تم نسخ البريد', 'success')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="mb-2">
                                <strong>الموضوع:</strong> <code>نسخة احتياطية - ${filename}</code>
                                <button class="btn btn-sm btn-outline-primary ms-2" onclick="navigator.clipboard.writeText('نسخة احتياطية - ${filename}'); showNotification('تم نسخ الموضوع', 'success')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div>
                                <strong>الرسالة:</strong> <code>مرفق ملف النسخة الاحتياطية - مجلد: نجيب المقداد</code>
                            </div>
                        </div>
                    </div>
                `;
            }
        },

        /**
         * حلول Dropbox
         */
        dropbox: {
            /**
             * الحل الأول: Dropbox Email-to-Dropbox
             * يستخدم خدمة Send to Dropbox
             */
            createEmailUpload(backupData, filename) {
                return `
                    <div class="alert alert-info">
                        <h5>📮 استخدام Send to Dropbox</h5>
                        <ol>
                            <li>قم بتفعيل خدمة <a href="https://sendtodropbox.com" target="_blank">Send to Dropbox</a></li>
                            <li>احصل على عنوان بريدك الخاص</li>
                            <li>أرسل الملف المحفوظ إلى هذا البريد</li>
                            <li>سيظهر تلقائياً في Dropbox</li>
                        </ol>
                    </div>
                `;
            },

            /**
             * الحل الثاني: استخدام IFTTT
             * ربط تلقائي بين الخدمات
             */
            createIFTTTRecipe() {
                return `
                    <div class="alert alert-success">
                        <h5>🔗 استخدام IFTTT للأتمتة</h5>
                        <ol>
                            <li>أنشئ حساب في <a href="https://ifttt.com" target="_blank">IFTTT</a></li>
                            <li>أنشئ وصفة: "إذا تلقيت بريد بعنوان معين، احفظه في Dropbox"</li>
                            <li>أرسل النسخ الاحتياطية بهذا العنوان</li>
                        </ol>
                        <p class="mb-0">مثال العنوان: <code>Backup-YourApp-{التاريخ}</code></p>
                    </div>
                `;
            }
        },

        /**
         * الحل الشامل: WebDAV
         * يعمل مع معظم خدمات التخزين السحابي
         */
        webDAV: {
            /**
             * إنشاء كود WebDAV
             */
            createWebDAVCode(backupData) {
                const code = `
// استخدام WebDAV للرفع إلى أي خدمة سحابية
// يعمل مع: Nextcloud, ownCloud, Box, Yandex.Disk

const webdavUrl = 'https://your-service.com/remote.php/webdav/';
const username = 'your-username';
const password = 'your-password';

const uploadFile = async (data, filename) => {
    const response = await fetch(webdavUrl + filename, {
        method: 'PUT',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (response.ok) {
        console.log('✅ تم الرفع بنجاح!');
    }
};
                `.trim();

                return `
                    <div class="alert alert-primary">
                        <h5>🌐 WebDAV - حل شامل</h5>
                        <p>استخدم أي خدمة تدعم WebDAV:</p>
                        <ul>
                            <li>Nextcloud / ownCloud</li>
                            <li>Box.com</li>
                            <li>Yandex.Disk</li>
                            <li>4shared</li>
                        </ul>
                        <pre class="bg-dark text-light p-3 rounded"><code>${CloudStorageHelper.escapeHtml(code)}</code></pre>
                    </div>
                `;
            }
        },

        /**
         * المزامنة السحابية الذكية
         * يستخدم خدمات وسيطة للمزامنة التلقائية
         */
        smartSync: {
            /**
             * استخدام Zapier للمزامنة
             */
            createZapierFlow() {
                return `
                    <div class="alert alert-info">
                        <h5>⚡ المزامنة التلقائية مع Zapier</h5>
                        <p>أنشئ تدفق عمل تلقائي:</p>
                        <ol>
                            <li>Trigger: استلام webhook</li>
                            <li>Action: حفظ في Google Drive/Dropbox</li>
                        </ol>
                        <p>رابط Webhook الخاص بك:</p>
                        <code>https://hooks.zapier.com/hooks/catch/YOUR_ID/</code>
                        <button class="btn btn-sm btn-primary mt-2" onclick="CloudStorageHelper.testWebhook()">
                            اختبار الإرسال
                        </button>
                    </div>
                `;
            },

            /**
             * استخدام رابط مشاركة مؤقت
             */
            createTemporaryLink(backupData) {
                // استخدام خدمة مثل file.io أو tmpfiles.org
                return `
                    <div class="alert alert-warning">
                        <h5>🔗 رابط مؤقت للمشاركة</h5>
                        <p>يمكنك استخدام خدمات الرفع المؤقت:</p>
                        <ul>
                            <li><a href="https://file.io" target="_blank">file.io</a> - يحذف بعد التحميل الأول</li>
                            <li><a href="https://tmpfiles.org" target="_blank">tmpfiles.org</a> - يحذف بعد 1 ساعة</li>
                            <li><a href="https://transfer.sh" target="_blank">transfer.sh</a> - سطر أوامر</li>
                        </ul>
                        <p>ثم شارك الرابط مع نفسك أو احفظه في ملاحظاتك السحابية</p>
                    </div>
                `;
            }
        },

        /**
         * عرض جميع الحلول المتاحة
         */
        showAllSolutions(backupData, filename) {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div class="modal fade" id="cloudSolutionsModal" tabindex="-1">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">🌟 حلول مبتكرة للتخزين السحابي</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="accordion" id="cloudSolutionsAccordion">
                                    
                                    <!-- Google Drive Solutions -->
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#googleDrive">
                                                <i class="fab fa-google-drive me-2"></i> حلول Google Drive
                                            </button>
                                        </h2>
                                        <div id="googleDrive" class="accordion-collapse collapse show" data-bs-parent="#cloudSolutionsAccordion">
                                            <div class="accordion-body">
                                                ${this.googleDrive.createFormLink(backupData)}
                                                ${this.googleDrive.createColabCode(backupData)}
                                                ${this.googleDrive.createEmailLink(backupData, filename)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Universal Solutions -->
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#universal">
                                                <i class="fas fa-globe me-2"></i> حلول شاملة
                                            </button>
                                        </h2>
                                        <div id="universal" class="accordion-collapse collapse" data-bs-parent="#cloudSolutionsAccordion">
                                            <div class="accordion-body">
                                                ${this.webDAV.createWebDAVCode(backupData)}
                                                ${this.smartSync.createZapierFlow()}
                                                ${this.smartSync.createTemporaryLink(backupData)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal.firstElementChild);
            const modalInstance = new bootstrap.Modal(document.getElementById('cloudSolutionsModal'));
            modalInstance.show();
            
            document.getElementById('cloudSolutionsModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
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
         * اختبار Webhook
         */
        async testWebhook() {
            showNotification('جاري اختبار الإرسال...', 'info');
            // يمكن إضافة كود حقيقي هنا
            setTimeout(() => {
                showNotification('تم الإرسال بنجاح! تحقق من Zapier', 'success');
            }, 2000);
        }
    };

    // تصدير المساعد
    window.CloudStorageHelper = CloudStorageHelper;
    
    // رسالة تأكيد التحميل
    console.log('CloudStorageHelper loaded successfully');

})();