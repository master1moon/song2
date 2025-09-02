/**
 * نظام الصوت للتطبيق
 * يستخدم Web Audio API لتوليد أصوات التنبيهات
 * لا يحتاج لملفات صوتية خارجية
 */

(function() {
    'use strict';

    // كائن نظام الصوت
    const SoundSystem = {
        // السياق الصوتي
        audioContext: null,
        
        // مستوى الصوت الافتراضي (0-100)
        volume: 50,
        
        // حالة النظام
        isEnabled: true,
        isInitialized: false,

        /**
         * تهيئة نظام الصوت
         */
        init: function() {
            if (this.isInitialized) return;
            
            try {
                // إنشاء سياق صوتي
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                this.isInitialized = true;
                
                // تحميل الإعدادات
                this.loadSettings();
                
                console.log('تم تهيئة نظام الصوت بنجاح');
            } catch (error) {
                console.error('خطأ في تهيئة نظام الصوت:', error);
                this.isEnabled = false;
            }
        },

        /**
         * تحميل إعدادات الصوت
         */
        loadSettings: function() {
            if (typeof AppSettings !== 'undefined') {
                const settings = AppSettings.get('notifications');
                if (settings) {
                    this.isEnabled = settings.soundEnabled || false;
                    this.volume = settings.soundVolume || 50;
                }
            }
        },

        /**
         * تشغيل صوت تنبيه
         * @param {string} type - نوع التنبيه (success, error, warning, info)
         */
        playNotification: function(type = 'info') {
            if (!this.isEnabled || !this.audioContext) return;
            
            // استئناف السياق الصوتي إذا كان معلقاً
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // اختيار معاملات الصوت حسب النوع
            let frequency, duration, fadeTime;
            
            switch(type) {
                case 'success':
                    // صوت نجاح - نغمة صاعدة
                    this.playTone(523.25, 0.1); // C5
                    setTimeout(() => this.playTone(659.25, 0.1), 100); // E5
                    setTimeout(() => this.playTone(783.99, 0.2), 200); // G5
                    break;
                    
                case 'error':
                    // صوت خطأ - نغمة هابطة
                    this.playTone(440, 0.15); // A4
                    setTimeout(() => this.playTone(349.23, 0.15), 150); // F4
                    setTimeout(() => this.playTone(293.66, 0.3), 300); // D4
                    break;
                    
                case 'warning':
                    // صوت تحذير - نغمتان متكررتان
                    this.playTone(554.37, 0.1); // C#5
                    setTimeout(() => this.playTone(415.30, 0.1), 100); // G#4
                    setTimeout(() => this.playTone(554.37, 0.1), 200); // C#5
                    setTimeout(() => this.playTone(415.30, 0.1), 300); // G#4
                    break;
                    
                case 'info':
                default:
                    // صوت معلومات - نغمة واحدة
                    this.playTone(440, 0.2); // A4
                    break;
            }
        },

        /**
         * تشغيل نغمة مفردة
         * @param {number} frequency - التردد بالهرتز
         * @param {number} duration - المدة بالثواني
         */
        playTone: function(frequency, duration) {
            if (!this.audioContext) return;
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                // ضبط نوع الموجة
                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;
                
                // ضبط مستوى الصوت
                const actualVolume = (this.volume / 100) * 0.3; // أقصى مستوى 0.3 لتجنب الإزعاج
                gainNode.gain.setValueAtTime(actualVolume, this.audioContext.currentTime);
                
                // تطبيق تأثير التلاشي
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01, 
                    this.audioContext.currentTime + duration
                );
                
                // التوصيل
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // البدء والإيقاف
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
                
            } catch (error) {
                console.error('خطأ في تشغيل النغمة:', error);
            }
        },

        /**
         * تشغيل صوت النقر
         */
        playClick: function() {
            if (!this.isEnabled || !this.audioContext) return;
            
            // صوت نقرة قصيرة
            this.playTone(1000, 0.05);
        },

        /**
         * تحديث الإعدادات
         * @param {boolean} enabled - تفعيل/تعطيل الصوت
         * @param {number} volume - مستوى الصوت (0-100)
         */
        updateSettings: function(enabled, volume) {
            this.isEnabled = enabled;
            this.volume = Math.max(0, Math.min(100, volume));
        },

        /**
         * اختبار الصوت
         * @param {string} type - نوع الصوت للاختبار
         */
        test: function(type = 'info') {
            const wasEnabled = this.isEnabled;
            this.isEnabled = true;
            this.playNotification(type);
            
            // إعادة الحالة السابقة بعد ثانية
            setTimeout(() => {
                this.isEnabled = wasEnabled;
            }, 1000);
        }
    };

    // تهيئة النظام عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        SoundSystem.init();
    });

    // تصدير النظام
    window.SoundSystem = SoundSystem;

})();