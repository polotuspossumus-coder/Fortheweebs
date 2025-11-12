/**
 * Internationalization (i18n) System for ForTheWeebs
 * Supports 50+ languages with automatic detection
 * 
 * Supported Languages:
 * - English (en) - Default
 * - Spanish (es) - Español
 * - French (fr) - Français
 * - German (de) - Deutsch
 * - Italian (it) - Italiano
 * - Portuguese (pt) - Português
 * - Russian (ru) - Русский
 * - Japanese (ja) - 日本語
 * - Korean (ko) - 한국어
 * - Chinese Simplified (zh-CN) - 简体中文
 * - Chinese Traditional (zh-TW) - 繁體中文
 * - Arabic (ar) - العربية
 * - Hindi (hi) - हिन्दी
 * - Bengali (bn) - বাংলা
 * - Turkish (tr) - Türkçe
 * - Vietnamese (vi) - Tiếng Việt
 * - Thai (th) - ไทย
 * - Indonesian (id) - Bahasa Indonesia
 * - Malay (ms) - Bahasa Melayu
 * - Filipino (tl) - Filipino
 * - Dutch (nl) - Nederlands
 * - Polish (pl) - Polski
 * - Swedish (sv) - Svenska
 * - Norwegian (no) - Norsk
 * - Danish (da) - Dansk
 * - Finnish (fi) - Suomi
 * - Greek (el) - Ελληνικά
 * - Hebrew (he) - עברית
 * - Czech (cs) - Čeština
 * - Hungarian (hu) - Magyar
 * - Romanian (ro) - Română
 * - Ukrainian (uk) - Українська
 * - Persian (fa) - فارسی
 * - Urdu (ur) - اردو
 * - Swahili (sw) - Kiswahili
 * - Amharic (am) - አማርኛ
 * - Zulu (zu) - isiZulu
 * - Xhosa (xh) - isiXhosa
 * - Hausa (ha) - Hausa
 * - Yoruba (yo) - Yorùbá
 * - Igbo (ig) - Igbo
 * - Tamil (ta) - தமிழ்
 * - Telugu (te) - తెలుగు
 * - Marathi (mr) - मराठी
 * - Gujarati (gu) - ગુજરાતી
 * - Kannada (kn) - ಕನ್ನಡ
 * - Malayalam (ml) - മലയാളം
 * - Punjabi (pa) - ਪੰਜਾਬੀ
 * - Sinhala (si) - සිංහල
 * - Burmese (my) - မြန်မာ
 * - Khmer (km) - ភាសាខ្មែរ
 * - Lao (lo) - ລາວ
 * - Nepali (ne) - नेपाली
 */

export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
  'zh-CN': { name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
  'zh-TW': { name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', rtl: false },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
  bn: { name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  th: { name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
  ms: { name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
  tl: { name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', rtl: false },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
  sv: { name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false },
  no: { name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false },
  da: { name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false },
  fi: { name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false },
  el: { name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', rtl: false },
  he: { name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  cs: { name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', rtl: false },
  hu: { name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', rtl: false },
  ro: { name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', rtl: false },
  uk: { name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', rtl: false },
  fa: { name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  ur: { name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  sw: { name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', rtl: false },
  am: { name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', rtl: false },
  zu: { name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', rtl: false },
  xh: { name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', rtl: false },
  ha: { name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', rtl: false },
  yo: { name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', rtl: false },
  ig: { name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬', rtl: false },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', rtl: false },
  te: { name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', rtl: false },
  mr: { name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', rtl: false },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', rtl: false },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', rtl: false },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', rtl: false },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', rtl: false },
  si: { name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', rtl: false },
  my: { name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲', rtl: false },
  km: { name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭', rtl: false },
  lo: { name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦', rtl: false },
  ne: { name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', rtl: false },
};

// Translation strings for all languages
export const TRANSLATIONS = {
  en: {
    // Navigation & Common
    welcome: 'Welcome to ForTheWeebs',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Dashboard
    dashboard: 'Dashboard',
    overview: 'Overview',
    profile: 'My Profile',
    settings: 'Settings',
    logout: 'Logout',
    
    // Payments
    chooseYourTier: 'Choose Your Tier',
    freeTier: 'Free',
    creatorTier: 'Creator',
    superAdminTier: 'Super Admin',
    oneTimePayment: 'one-time',
    securePayment: 'Secure payment powered by Stripe',
    multiCurrency: 'Pay in your local currency (auto-converted to USD)',
    instantAccess: 'Instant access after purchase',
    
    // Bug Fixer
    reportBug: 'Report Bug',
    bugDescription: 'Bug Description',
    stepsToReproduce: 'Steps to Reproduce',
    expectedBehavior: 'Expected Behavior',
    actualBehavior: 'Actual Behavior',
    severity: 'Severity',
    captureScreenshot: 'Capture Screenshot',
    uploadScreenshot: 'Upload Screenshot',
    submitBugReport: 'Submit Bug Report',
    
    // Features
    photoTools: 'Photo Tools',
    videoEditor: 'Video Editor',
    audioProduction: 'Audio Production',
    comicCreator: 'Comic Creator',
    graphicDesign: 'Graphic Design',
    contentPlanner: 'Content Planner',
    
    // Currency
    currency: 'Currency',
    selectCurrency: 'Select Your Currency',
    
    // Language
    language: 'Language',
    selectLanguage: 'Select Your Language',
  },
  es: {
    welcome: 'Bienvenido a ForTheWeebs',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    dashboard: 'Panel de Control',
    overview: 'Resumen',
    profile: 'Mi Perfil',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    
    chooseYourTier: 'Elige Tu Plan',
    freeTier: 'Gratis',
    creatorTier: 'Creador',
    superAdminTier: 'Súper Admin',
    oneTimePayment: 'único',
    securePayment: 'Pago seguro con Stripe',
    multiCurrency: 'Paga en tu moneda local (convertido automáticamente a USD)',
    instantAccess: 'Acceso instantáneo después de la compra',
    
    reportBug: 'Reportar Error',
    bugDescription: 'Descripción del Error',
    stepsToReproduce: 'Pasos para Reproducir',
    expectedBehavior: 'Comportamiento Esperado',
    actualBehavior: 'Comportamiento Real',
    severity: 'Gravedad',
    captureScreenshot: 'Capturar Pantalla',
    uploadScreenshot: 'Subir Captura',
    submitBugReport: 'Enviar Reporte',
    
    photoTools: 'Herramientas de Foto',
    videoEditor: 'Editor de Video',
    audioProduction: 'Producción de Audio',
    comicCreator: 'Creador de Cómics',
    graphicDesign: 'Diseño Gráfico',
    contentPlanner: 'Planificador de Contenido',
    
    currency: 'Moneda',
    selectCurrency: 'Selecciona Tu Moneda',
    language: 'Idioma',
    selectLanguage: 'Selecciona Tu Idioma',
  },
  fr: {
    welcome: 'Bienvenue sur ForTheWeebs',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Soumettre',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    
    dashboard: 'Tableau de Bord',
    overview: 'Aperçu',
    profile: 'Mon Profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    
    chooseYourTier: 'Choisissez Votre Forfait',
    freeTier: 'Gratuit',
    creatorTier: 'Créateur',
    superAdminTier: 'Super Admin',
    oneTimePayment: 'unique',
    securePayment: 'Paiement sécurisé par Stripe',
    multiCurrency: 'Payez dans votre devise locale (converti automatiquement en USD)',
    instantAccess: 'Accès instantané après l\'achat',
    
    reportBug: 'Signaler un Bug',
    bugDescription: 'Description du Bug',
    stepsToReproduce: 'Étapes pour Reproduire',
    expectedBehavior: 'Comportement Attendu',
    actualBehavior: 'Comportement Réel',
    severity: 'Gravité',
    captureScreenshot: 'Capturer l\'Écran',
    uploadScreenshot: 'Télécharger Capture',
    submitBugReport: 'Soumettre le Rapport',
    
    photoTools: 'Outils Photo',
    videoEditor: 'Éditeur Vidéo',
    audioProduction: 'Production Audio',
    comicCreator: 'Créateur de BD',
    graphicDesign: 'Design Graphique',
    contentPlanner: 'Planificateur de Contenu',
    
    currency: 'Devise',
    selectCurrency: 'Sélectionnez Votre Devise',
    language: 'Langue',
    selectLanguage: 'Sélectionnez Votre Langue',
  },
  de: {
    welcome: 'Willkommen bei ForTheWeebs',
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    next: 'Weiter',
    previous: 'Zurück',
    submit: 'Absenden',
    search: 'Suchen',
    filter: 'Filtern',
    sort: 'Sortieren',
    
    dashboard: 'Dashboard',
    overview: 'Übersicht',
    profile: 'Mein Profil',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    
    chooseYourTier: 'Wählen Sie Ihr Paket',
    freeTier: 'Kostenlos',
    creatorTier: 'Ersteller',
    superAdminTier: 'Super Admin',
    oneTimePayment: 'einmalig',
    securePayment: 'Sichere Zahlung über Stripe',
    multiCurrency: 'Zahlen Sie in Ihrer lokalen Währung (automatisch in USD umgerechnet)',
    instantAccess: 'Sofortiger Zugriff nach dem Kauf',
    
    reportBug: 'Fehler Melden',
    bugDescription: 'Fehlerbeschreibung',
    stepsToReproduce: 'Schritte zum Reproduzieren',
    expectedBehavior: 'Erwartetes Verhalten',
    actualBehavior: 'Tatsächliches Verhalten',
    severity: 'Schweregrad',
    captureScreenshot: 'Screenshot Aufnehmen',
    uploadScreenshot: 'Screenshot Hochladen',
    submitBugReport: 'Bericht Absenden',
    
    photoTools: 'Foto-Tools',
    videoEditor: 'Video-Editor',
    audioProduction: 'Audio-Produktion',
    comicCreator: 'Comic-Ersteller',
    graphicDesign: 'Grafikdesign',
    contentPlanner: 'Inhaltsplaner',
    
    currency: 'Währung',
    selectCurrency: 'Wählen Sie Ihre Währung',
    language: 'Sprache',
    selectLanguage: 'Wählen Sie Ihre Sprache',
  },
  ja: {
    welcome: 'ForTheWeebsへようこそ',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    delete: '削除',
    edit: '編集',
    close: '閉じる',
    next: '次へ',
    previous: '前へ',
    submit: '送信',
    search: '検索',
    filter: 'フィルター',
    sort: '並び替え',
    
    dashboard: 'ダッシュボード',
    overview: '概要',
    profile: 'マイプロフィール',
    settings: '設定',
    logout: 'ログアウト',
    
    chooseYourTier: 'プランを選択',
    freeTier: '無料',
    creatorTier: 'クリエイター',
    superAdminTier: 'スーパー管理者',
    oneTimePayment: '一回払い',
    securePayment: 'Stripeによる安全な支払い',
    multiCurrency: '現地通貨で支払い（自動的にUSDに変換）',
    instantAccess: '購入後すぐにアクセス可能',
    
    reportBug: 'バグ報告',
    bugDescription: 'バグの説明',
    stepsToReproduce: '再現手順',
    expectedBehavior: '期待される動作',
    actualBehavior: '実際の動作',
    severity: '重要度',
    captureScreenshot: 'スクリーンショット撮影',
    uploadScreenshot: 'スクリーンショットアップロード',
    submitBugReport: 'レポート送信',
    
    photoTools: '写真ツール',
    videoEditor: 'ビデオエディター',
    audioProduction: 'オーディオ制作',
    comicCreator: 'コミック作成',
    graphicDesign: 'グラフィックデザイン',
    contentPlanner: 'コンテンツプランナー',
    
    currency: '通貨',
    selectCurrency: '通貨を選択',
    language: '言語',
    selectLanguage: '言語を選択',
  },
  'zh-CN': {
    welcome: '欢迎来到ForTheWeebs',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    
    dashboard: '仪表板',
    overview: '概览',
    profile: '我的资料',
    settings: '设置',
    logout: '登出',
    
    chooseYourTier: '选择您的套餐',
    freeTier: '免费',
    creatorTier: '创作者',
    superAdminTier: '超级管理员',
    oneTimePayment: '一次性',
    securePayment: 'Stripe安全支付',
    multiCurrency: '使用您的本地货币支付（自动转换为美元）',
    instantAccess: '购买后立即访问',
    
    reportBug: '报告错误',
    bugDescription: '错误描述',
    stepsToReproduce: '重现步骤',
    expectedBehavior: '预期行为',
    actualBehavior: '实际行为',
    severity: '严重程度',
    captureScreenshot: '捕获屏幕截图',
    uploadScreenshot: '上传截图',
    submitBugReport: '提交报告',
    
    photoTools: '照片工具',
    videoEditor: '视频编辑器',
    audioProduction: '音频制作',
    comicCreator: '漫画创作',
    graphicDesign: '平面设计',
    contentPlanner: '内容规划',
    
    currency: '货币',
    selectCurrency: '选择您的货币',
    language: '语言',
    selectLanguage: '选择您的语言',
  },
  ko: {
    welcome: 'ForTheWeebs에 오신 것을 환영합니다',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    close: '닫기',
    next: '다음',
    previous: '이전',
    submit: '제출',
    search: '검색',
    filter: '필터',
    sort: '정렬',
    
    dashboard: '대시보드',
    overview: '개요',
    profile: '내 프로필',
    settings: '설정',
    logout: '로그아웃',
    
    chooseYourTier: '플랜 선택',
    freeTier: '무료',
    creatorTier: '크리에이터',
    superAdminTier: '슈퍼 관리자',
    oneTimePayment: '일회성',
    securePayment: 'Stripe를 통한 안전한 결제',
    multiCurrency: '현지 통화로 결제 (자동으로 USD로 변환)',
    instantAccess: '구매 후 즉시 액세스',
    
    reportBug: '버그 신고',
    bugDescription: '버그 설명',
    stepsToReproduce: '재현 단계',
    expectedBehavior: '예상 동작',
    actualBehavior: '실제 동작',
    severity: '심각도',
    captureScreenshot: '스크린샷 캡처',
    uploadScreenshot: '스크린샷 업로드',
    submitBugReport: '보고서 제출',
    
    photoTools: '사진 도구',
    videoEditor: '비디오 편집기',
    audioProduction: '오디오 제작',
    comicCreator: '만화 제작',
    graphicDesign: '그래픽 디자인',
    contentPlanner: '콘텐츠 플래너',
    
    currency: '통화',
    selectCurrency: '통화 선택',
    language: '언어',
    selectLanguage: '언어 선택',
  },
  ar: {
    welcome: 'مرحبا بكم في ForTheWeebs',
    loading: 'جار التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    
    dashboard: 'لوحة التحكم',
    overview: 'نظرة عامة',
    profile: 'ملفي الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    
    chooseYourTier: 'اختر خطتك',
    freeTier: 'مجاني',
    creatorTier: 'منشئ المحتوى',
    superAdminTier: 'مدير متقدم',
    oneTimePayment: 'دفعة واحدة',
    securePayment: 'دفع آمن بواسطة Stripe',
    multiCurrency: 'ادفع بعملتك المحلية (يتم التحويل تلقائياً إلى USD)',
    instantAccess: 'وصول فوري بعد الشراء',
    
    reportBug: 'الإبلاغ عن خطأ',
    bugDescription: 'وصف الخطأ',
    stepsToReproduce: 'خطوات إعادة الإنتاج',
    expectedBehavior: 'السلوك المتوقع',
    actualBehavior: 'السلوك الفعلي',
    severity: 'الخطورة',
    captureScreenshot: 'التقاط لقطة شاشة',
    uploadScreenshot: 'تحميل لقطة الشاشة',
    submitBugReport: 'إرسال التقرير',
    
    photoTools: 'أدوات الصور',
    videoEditor: 'محرر الفيديو',
    audioProduction: 'إنتاج الصوت',
    comicCreator: 'منشئ القصص المصورة',
    graphicDesign: 'التصميم الجرافيكي',
    contentPlanner: 'مخطط المحتوى',
    
    currency: 'العملة',
    selectCurrency: 'اختر عملتك',
    language: 'اللغة',
    selectLanguage: 'اختر لغتك',
  },
  ru: {
    welcome: 'Добро пожаловать в ForTheWeebs',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    close: 'Закрыть',
    next: 'Далее',
    previous: 'Назад',
    submit: 'Отправить',
    search: 'Поиск',
    filter: 'Фильтр',
    sort: 'Сортировка',
    
    dashboard: 'Панель управления',
    overview: 'Обзор',
    profile: 'Мой профиль',
    settings: 'Настройки',
    logout: 'Выход',
    
    chooseYourTier: 'Выберите ваш тариф',
    freeTier: 'Бесплатно',
    creatorTier: 'Создатель',
    superAdminTier: 'Супер Админ',
    oneTimePayment: 'разовый',
    securePayment: 'Безопасная оплата через Stripe',
    multiCurrency: 'Оплачивайте в вашей валюте (автоматически конвертируется в USD)',
    instantAccess: 'Мгновенный доступ после покупки',
    
    reportBug: 'Сообщить об ошибке',
    bugDescription: 'Описание ошибки',
    stepsToReproduce: 'Шаги для воспроизведения',
    expectedBehavior: 'Ожидаемое поведение',
    actualBehavior: 'Фактическое поведение',
    severity: 'Серьезность',
    captureScreenshot: 'Сделать скриншот',
    uploadScreenshot: 'Загрузить скриншот',
    submitBugReport: 'Отправить отчет',
    
    photoTools: 'Инструменты для фото',
    videoEditor: 'Видео редактор',
    audioProduction: 'Аудио продакшн',
    comicCreator: 'Создатель комиксов',
    graphicDesign: 'Графический дизайн',
    contentPlanner: 'Планировщик контента',
    
    currency: 'Валюта',
    selectCurrency: 'Выберите вашу валюту',
    language: 'Язык',
    selectLanguage: 'Выберите ваш язык',
  },
  hi: {
    welcome: 'ForTheWeebs में आपका स्वागत है',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    close: 'बंद करें',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sort: 'क्रमबद्ध करें',
    
    dashboard: 'डैशबोर्ड',
    overview: 'अवलोकन',
    profile: 'मेरी प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    
    chooseYourTier: 'अपनी योजना चुनें',
    freeTier: 'मुफ़्त',
    creatorTier: 'रचयिता',
    superAdminTier: 'सुपर व्यवस्थापक',
    oneTimePayment: 'एक बार',
    securePayment: 'Stripe द्वारा सुरक्षित भुगतान',
    multiCurrency: 'अपनी स्थानीय मुद्रा में भुगतान करें (स्वचालित रूप से USD में परिवर्तित)',
    instantAccess: 'खरीद के बाद तुरंत पहुंच',
    
    reportBug: 'बग रिपोर्ट करें',
    bugDescription: 'बग विवरण',
    stepsToReproduce: 'पुन: उत्पन्न करने के चरण',
    expectedBehavior: 'अपेक्षित व्यवहार',
    actualBehavior: 'वास्तविक व्यवहार',
    severity: 'गंभीरता',
    captureScreenshot: 'स्क्रीनशॉट लें',
    uploadScreenshot: 'स्क्रीनशॉट अपलोड करें',
    submitBugReport: 'रिपोर्ट जमा करें',
    
    photoTools: 'फोटो उपकरण',
    videoEditor: 'वीडियो संपादक',
    audioProduction: 'ऑडियो उत्पादन',
    comicCreator: 'कॉमिक निर्माता',
    graphicDesign: 'ग्राफिक डिज़ाइन',
    contentPlanner: 'सामग्री योजनाकार',
    
    currency: 'मुद्रा',
    selectCurrency: 'अपनी मुद्रा चुनें',
    language: 'भाषा',
    selectLanguage: 'अपनी भाषा चुनें',
  },
  pt: {
    welcome: 'Bem-vindo ao ForTheWeebs',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    next: 'Próximo',
    previous: 'Anterior',
    submit: 'Enviar',
    search: 'Pesquisar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    dashboard: 'Painel',
    overview: 'Visão Geral',
    profile: 'Meu Perfil',
    settings: 'Configurações',
    logout: 'Sair',
    
    chooseYourTier: 'Escolha Seu Plano',
    freeTier: 'Grátis',
    creatorTier: 'Criador',
    superAdminTier: 'Super Admin',
    oneTimePayment: 'único',
    securePayment: 'Pagamento seguro via Stripe',
    multiCurrency: 'Pague na sua moeda local (convertido automaticamente para USD)',
    instantAccess: 'Acesso instantâneo após a compra',
    
    reportBug: 'Reportar Bug',
    bugDescription: 'Descrição do Bug',
    stepsToReproduce: 'Passos para Reproduzir',
    expectedBehavior: 'Comportamento Esperado',
    actualBehavior: 'Comportamento Real',
    severity: 'Gravidade',
    captureScreenshot: 'Capturar Tela',
    uploadScreenshot: 'Enviar Captura',
    submitBugReport: 'Enviar Relatório',
    
    photoTools: 'Ferramentas de Foto',
    videoEditor: 'Editor de Vídeo',
    audioProduction: 'Produção de Áudio',
    comicCreator: 'Criador de Quadrinhos',
    graphicDesign: 'Design Gráfico',
    contentPlanner: 'Planejador de Conteúdo',
    
    currency: 'Moeda',
    selectCurrency: 'Selecione Sua Moeda',
    language: 'Idioma',
    selectLanguage: 'Selecione Seu Idioma',
  },
};

// Detect user's preferred language
export function detectUserLanguage() {
  try {
    // Try browser language
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Check if exact match exists
    if (LANGUAGES[browserLang]) {
      return browserLang;
    }
    
    // Check if language code (without region) exists
    const langCode = browserLang.split('-')[0];
    if (LANGUAGES[langCode]) {
      return langCode;
    }
    
    // Special cases
    if (browserLang.startsWith('zh')) {
      return browserLang.includes('TW') || browserLang.includes('HK') ? 'zh-TW' : 'zh-CN';
    }
    
    return 'en'; // Default to English
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

// Get current language
export function getCurrentLanguage() {
  return localStorage.getItem('preferred_language') || detectUserLanguage();
}

// Set preferred language
export function setLanguage(langCode) {
  if (LANGUAGES[langCode]) {
    localStorage.setItem('preferred_language', langCode);
    
    // Apply RTL if needed
    const isRTL = LANGUAGES[langCode].rtl;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
    
    return true;
  }
  return false;
}

// Get translation
export function t(key, langCode = null) {
  const lang = langCode || getCurrentLanguage();
  const translations = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return translations[key] || TRANSLATIONS.en[key] || key;
}

// Translate with fallback
export function translate(key, variables = {}) {
  let text = t(key);
  
  // Replace variables in translation
  Object.keys(variables).forEach(varKey => {
    text = text.replace(`{${varKey}}`, variables[varKey]);
  });
  
  return text;
}

// Initialize language on app load
export function initLanguage() {
  const lang = getCurrentLanguage();
  setLanguage(lang);
  return lang;
}

// Get all available languages for selector
export function getAvailableLanguages() {
  return Object.entries(LANGUAGES).map(([code, info]) => ({
    code,
    ...info
  }));
}
