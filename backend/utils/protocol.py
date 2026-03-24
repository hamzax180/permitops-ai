# ---------------------------------------------------------------------------
# Manual instructions for Agent-operated steps (bot disabled pending law approval)
# Shared across business types; keyed by (step_key, lang)
# ---------------------------------------------------------------------------
_AGENT_NOTES = {
    # Step 3 – MERSİS name reservation
    ("mersis_name", "en"): (
        "🔒 Bot disabled — do manually: Go to mersis.ticaret.gov.tr → "
        "log in via e-Devlet → click 'Ön Başvuru' → type your desired company name → "
        "submit. System checks uniqueness instantly."
    ),
    ("mersis_name", "tr"): (
        "🔒 Bot devre dışı — manuel yapın: mersis.ticaret.gov.tr → "
        "e-Devlet ile giriş → 'Ön Başvuru' → şirket unvanını girin → gönderin. "
        "Sistem benzersizliği anında kontrol eder."
    ),
    ("mersis_name", "ar"): (
        "🔒 البوت معطّل — أكمل يدوياً: mersis.ticaret.gov.tr ← "
        "تسجيل الدخول عبر e-Devlet ← انقر 'Ön Başvuru' ← أدخل اسم الشركة ← أرسل. "
        "يتحقق النظام من التفرد فوراً."
    ),
    # Step 4 – NACE code selection in MERSİS
    ("mersis_nace", "en"): (
        "🔒 Bot disabled — do manually: Inside MERSİS after step 3, click "
        "'Faaliyet Ekle' (Add Activity) → search keywords → select your NACE code "
        "(e.g. 56.10 Restaurant, 47.xx Retail, 62.01 Software) → confirm."
    ),
    ("mersis_nace", "tr"): (
        "🔒 Bot devre dışı — manuel yapın: MERSİS'te 3. adımdan sonra "
        "'Faaliyet Ekle' → anahtar kelime arayın → NACE kodunu seçin "
        "(örn. 56.10 Restoran, 47.xx Perakende) → onaylayın."
    ),
    ("mersis_nace", "ar"): (
        "🔒 البوت معطّل — أكمل يدوياً: في MERSİS بعد الخطوة 3، انقر "
        "'Faaliyet Ekle' ← ابحث بالكلمات المفتاحية ← اختر كود NACE ← أكّد."
    ),
    # Step 5 – Articles of Association
    ("mersis_articles", "en"): (
        "🔒 Bot disabled — do manually: MERSİS auto-generates Articles after "
        "steps 3–4. Review on screen → download PDF → print 3 copies for your notary visit in step 7."
    ),
    ("mersis_articles", "tr"): (
        "🔒 Bot devre dışı — manuel yapın: MERSİS 3-4. adımlardan sonra "
        "Ana Sözleşme'yi otomatik oluşturur. Belgei inceleyin → PDF indirin → "
        "7. adımdaki noter ziyareti için 3 kopya yazdırın."
    ),
    ("mersis_articles", "ar"): (
        "🔒 البوت معطّل — أكمل يدوياً: يُنشئ MERSİS العقد تلقائياً بعد الخطوتين 3–4. "
        "راجع المستند ← حمّل PDF ← اطبع 3 نسخ لكاتب العدل في الخطوة 7."
    ),
    # Step 11 – e-Devlet business operating permit
    ("edevlet_permit", "en"): (
        "🔒 Bot disabled — do manually: Go to turkiye.gov.tr → search "
        "'İşyeri Açma ve Çalışma Ruhsatı' → select your district municipality → "
        "fill in business name, address, activity type → upload: signed lease, "
        "tax registration certificate, scaled floor plan."
    ),
    ("edevlet_permit", "tr"): (
        "🔒 Bot devre dışı — manuel yapın: turkiye.gov.tr → "
        "'İşyeri Açma ve Çalışma Ruhsatı' arayın → ilçe belediyenizi seçin → "
        "girin: işyeri adı, adres, faaliyet türü → yükleyin: imzalı kira sözleşmesi, "
        "vergi levhası, ölçekli kat planı."
    ),
    ("edevlet_permit", "ar"): (
        "🔒 البوت معطّل — أكمل يدوياً: اذهب إلى turkiye.gov.tr ← ابحث عن "
        "'İşyeri Açma ve Çalışma Ruhsatı' ← اختر البلدية ← أدخل: اسم الأعمال، العنوان، "
        "نوع النشاط ← ارفع: عقد الإيجار الموقّع، شهادة التسجيل الضريبي، مخطط الطابق."
    ),
    # Step 12 food – Gıda Sicil
    ("food_sicil", "en"): (
        "🔒 Bot disabled — do manually: Go to tarim.gov.tr → 'Gıda İşletmeci Kaydı' "
        "→ fill form (business name, address, capacity, NACE food code) → upload: "
        "lease agreement, scaled floor plan, tax registration. Or visit your local "
        "Agriculture District Directorate (Tarım İlçe Müdürlüğü)."
    ),
    ("food_sicil", "tr"): (
        "🔒 Bot devre dışı — manuel yapın: tarim.gov.tr → 'Gıda İşletmeci Kaydı' "
        "→ formu doldurun (işletme adı, adres, kapasite, gıda NACE kodu) → yükleyin: "
        "kira sözleşmesi, kat planı, vergi levhası. Veya yerel Tarım İlçe Müdürlüğü'ne gidin."
    ),
    ("food_sicil", "ar"): (
        "🔒 البوت معطّل — أكمل يدوياً: اذهب إلى tarim.gov.tr ← 'Gıda İşletmeci Kaydı' "
        "← أكمل النموذج (اسم المنشأة، العنوان، الطاقة، كود NACE الغذائي) "
        "← ارفع: عقد الإيجار، مخطط الطابق، التسجيل الضريبي. "
        "أو زر مديرية الزراعة المحلية (Tarım İlçe Müdürlüğü)."
    ),
}

def _n(key, lang):
    """Shorthand: get agent note for a given key and language."""
    return _AGENT_NOTES.get((key, lang), _AGENT_NOTES.get((key, "en"), ""))


def _detect_type(business_type: str) -> str:
    bt = business_type.lower()
    if any(k in bt for k in ["cafe","kafe","restaur","lokanta","food","yemek","gıda","mutfak",
                               "pasta","bakery","fırın","döner","kebab","pizza","burger",
                               "kantin","patisserie","tatlı","dondurma","bar","pub"]):
        return "food"
    if any(k in bt for k in ["retail","perakende","shop","store","market","dükkan",
                               "mağaza","boutique","clothes","giyim","electronics","elektronik"]):
        return "retail"
    if any(k in bt for k in ["service","hizmet","consulting","danışman","office","ofis",
                               "tech","yazılım","software","agency","ajans","law","hukuk",
                               "accounting","muhasebe","clinic","klinik","salon","güzellik"]):
        return "service"
    return "general"


def _steps_food(lang):
    return [
        (1,  {"en":"Obtain Turkish Tax Number","tr":"Vergi Kimlik Numarası Al","ar":"الحصول على الرقم الضريبي التركي"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Go to local tax office with passport (required for foreigners).",
               "tr":"Pasaportunuzla yerel vergi dairesine gidin (yabancılar için zorunludur).",
               "ar":"اذهب إلى مكتب الضرائب المحلي مع جواز السفر (مطلوب للأجانب)."}[lang]),
        (2,  {"en":"Decide Company Type (LTD or Sole Prop.)","tr":"Şirket Türüne Karar Ver (LTD/Şahıs)","ar":"تحديد نوع الشركة (LTD أو ملكية فردية)"}[lang],
              {"en":"Human/Agent","tr":"İnsan/Ajan","ar":"بشري/وكيل"}[lang],
              {"en":"Sole Prop. for small cafes/restaurants; LTD for partnerships.",
               "tr":"Küçük kafe/restoran için şahıs, ortaklık için LTD seçin.",
               "ar":"الملكية الفردية للمقاهي الصغيرة، LTD للشراكات."}[lang]),
        (3,  {"en":"Reserve Company Name via MERSİS","tr":"MERSİS'te Şirket Unvanını Rezerve Et","ar":"حجز اسم الشركة عبر MERSİS"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_name", lang)),
        (4,  {"en":"Select NACE Code (Food & Beverage)","tr":"NACE Kodu Seç (Gıda & İçecek)","ar":"اختيار كود NACE (الغذاء والمشروبات)"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_nace", lang)),
        (5,  {"en":"Generate Articles of Association","tr":"Ana Sözleşmeyi Oluştur","ar":"إنشاء النظام الأساسي للشركة"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_articles", lang)),
        (6,  {"en":"Secure Business Premises","tr":"İşyeri Tut","ar":"تأمين مقر العمل"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Premises must meet fire, hygiene, and ventilation standards; obtain signed lease.",
               "tr":"Önce yangın, hijyen ve havalandırma standartlarına uygun kira sözleşmesi alın.",
               "ar":"يجب أن تستوفي المقر معايير الحريق والصحة والتهوية؛ احصل على عقد إيجار موقّع."}[lang]),
        (7,  {"en":"Notarize Articles & Signatures","tr":"Sözleşme ve İmzaları Noter Onaylı Yap","ar":"تصديق العقد والتوقيعات لدى كاتب العدل"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Visit Turkish notary with printed Articles (step 5), IDs, and translations if needed.",
               "tr":"Basılı Ana Sözleşme (5. adım), kimlikler ve gerekirse tercümelerle noter ziyareti yapın.",
               "ar":"زر كاتب العدل التركي مع العقد المطبوع (الخطوة 5) والهويات والترجمات إذا لزم."}[lang]),
        (8,  {"en":"Submit Registration to Trade Registry","tr":"Ticaret Siciline Tescil Başvurusu Yap","ar":"تقديم التسجيل إلى السجل التجاري"}[lang],
              {"en":"Agent/Human","tr":"Ajan/İnsan","ar":"وكيل/بشري"}[lang],
              {"en":"Go to local Trade Registry Office with: notarized Articles, shareholder list, lease, ID copies. Pay fee (~500–1,500 TL). Agent assists with document check.",
               "tr":"Yerel Ticaret Sicili'ne gidin: noter onaylı sözleşme, hissedar listesi, kira, kimlik. Ücret ödeyin (~500–1.500 TL). Ajan belge kontrolü yapar.",
               "ar":"اذهب إلى السجل التجاري المحلي بـ: العقد الموثق، قائمة المساهمين، الإيجار، الهويات. ادفع الرسوم (~500–1,500 TL). الوكيل يراجع المستندات."}[lang]),
        (9,  {"en":"Open Corporate Bank Account","tr":"Kurumsal Banka Hesabı Aç","ar":"فتح حساب بنكي للشركة"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"After Trade Registry approval, open account at any Turkish bank (Ziraat, İş, Garanti, VakıfBank). Bring registration certificate.",
               "tr":"Ticaret Sicili onayından sonra herhangi bir Türk bankasında hesap açın. Tescil belgesi zorunludur.",
               "ar":"بعد موافقة السجل التجاري، افتح حساباً في أي بنك تركي. أحضر شهادة التسجيل."}[lang]),
        (10, {"en":"Register with Tax Office (VAT & Corp. Tax)","tr":"Vergi Dairesine Kayıt (KDV & Kurumlar Vergisi)","ar":"التسجيل في مكتب الضرائب"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Register VAT and corporate tax at local tax office; receive official tax plate to display in premises.",
               "tr":"Yerel vergi dairesinde KDV ve kurumlar vergisi kaydı; işyerinde asılacak vergi levhası alın.",
               "ar":"سجّل ضريبة القيمة المضافة وضريبة الشركات في مكتب الضرائب المحلي؛ احصل على لوحة الضرائب."}[lang]),
        (11, {"en":"Apply for İşyeri Açma ve Çalışma Ruhsatı","tr":"İşyeri Açma ve Çalışma Ruhsatı Başvurusu","ar":"التقدم بطلب رخصة فتح وتشغيل المحل"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("edevlet_permit", lang)),
        (12, {"en":"Obtain Gıda Sicil / Food Registration","tr":"Gıda Sicil Kaydı Al","ar":"الحصول على سجل غذائي"}[lang],
              {"en":"Agent/Human","tr":"Ajan/İnsan","ar":"وكيل/بشري"}[lang],
              _n("food_sicil", lang)),
        (13, {"en":"Pass Municipal Hygiene Inspection","tr":"Belediye Hijyen Denetiminden Geç","ar":"اجتياز فحص النظافة البلدي"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Inspector visits to check kitchen, ventilation, restrooms, and fire extinguishers on-site. Ensure all are compliant before scheduling.",
               "tr":"Denetçi; mutfak, havalandırma, tuvalet ve yangın tüplerini denetler. Planlamadan önce uyumluluğu sağlayın.",
               "ar":"يفحص المفتش المطبخ والتهوية ودورات المياه وطفايات الحريق. تأكد من الامتثال قبل الجدولة."}[lang]),
        (14, {"en":"Fire Safety Certificate","tr":"Yangın Güvenlik Sertifikası Al","ar":"شهادة السلامة من الحريق"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Fire department inspects extinguishers, exits, and signage. Book inspection via local fire station (İtfaiye).",
               "tr":"İtfaiye; tüpler, çıkışlar ve levhaları kontrol eder. Yerel itfaiyeden randevu alın.",
               "ar":"تفحص الإطفاء الطفايات والمخارج واللافتات. احجز المعاينة عبر محطة الإطفاء المحلية."}[lang]),
        (15, {"en":"Hire Accountant & Register Employees with SGK","tr":"Muhasebeci Tut ve Çalışanları SGK'ya Kaydet","ar":"توظيف محاسب وتسجيل الموظفين في SGK"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Certified accountant (SMMM) required by law. Register all staff with SGK before their first working day.",
               "tr":"Kanunla zorunlu SMMM muhasebeci. Tüm personeli ilk çalışma gününden önce SGK'ya kaydedin.",
               "ar":"محاسب معتمد (SMMM) مطلوب قانونياً. سجّل جميع الموظفين في SGK قبل أول يوم عمل."}[lang]),
        (16, {"en":"Display Permits & Open for Business","tr":"İzinleri Görünür Yere As ve Aç","ar":"عرض التصاريح والافتتاح"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Post İşyeri Ruhsatı, Food Registration, and Fire Certificate visibly inside premises before serving your first customer.",
               "tr":"İşyeri Ruhsatı, Gıda Sicil belgesi ve Yangın Sertifikası'nı ilk müşteriden önce görünür yere asın.",
               "ar":"علّق رخصة المحل وسجل الغذاء وشهادة الحريق بشكل واضح داخل المقر قبل استقبال أول عميل."}[lang]),
    ]


def _steps_retail(lang):
    return [
        (1,  {"en":"Obtain Turkish Tax Number","tr":"Vergi Kimlik Numarası Al","ar":"الحصول على الرقم الضريبي التركي"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Go to local tax office with passport (required for foreigners).",
               "tr":"Pasaportunuzla yerel vergi dairesine gidin.",
               "ar":"اذهب إلى مكتب الضرائب المحلي مع جواز السفر."}[lang]),
        (2,  {"en":"Decide Company Type (LTD or Sole Prop.)","tr":"Şirket Türüne Karar Ver","ar":"تحديد نوع الشركة"}[lang],
              {"en":"Human/Agent","tr":"İnsan/Ajan","ar":"بشري/وكيل"}[lang],
              {"en":"Sole Prop. for single-owner shops; LTD for partnerships.",
               "tr":"Tekli sahiplik için şahıs, ortaklık için LTD.",
               "ar":"الملكية الفردية للمحلات الفردية؛ LTD للشراكات."}[lang]),
        (3,  {"en":"Reserve Company Name via MERSİS","tr":"MERSİS'te Şirket Unvanını Rezerve Et","ar":"حجز اسم الشركة عبر MERSİS"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_name", lang)),
        (4,  {"en":"Select NACE Code (Retail)","tr":"NACE Kodu Seç (Perakende)","ar":"اختيار كود NACE (التجزئة)"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_nace", lang)),
        (5,  {"en":"Generate Articles of Association","tr":"Ana Sözleşmeyi Oluştur","ar":"إنشاء النظام الأساسي للشركة"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_articles", lang)),
        (6,  {"en":"Lease Business Premises","tr":"İşyeri Kirala","ar":"استئجار مقر العمل"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Ensure zoning allows retail use; obtain signed lease agreement.",
               "tr":"Bölge imar planına uygunluğu kontrol edin; imzalı kira sözleşmesi alın.",
               "ar":"تأكد من أن التصنيف يسمح بالتجزئة؛ احصل على عقد إيجار موقّع."}[lang]),
        (7,  {"en":"Notarize Articles & Signatures","tr":"Sözleşme ve İmzaları Noter Onaylı Yap","ar":"تصديق العقد والتوقيعات"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Visit Turkish notary with printed Articles, IDs, and translations if needed.",
               "tr":"Basılı Ana Sözleşme ve kimliklerle noter ziyareti yapın.",
               "ar":"زر كاتب العدل التركي مع العقد المطبوع والهويات."}[lang]),
        (8,  {"en":"Submit Registration to Trade Registry","tr":"Ticaret Siciline Tescil Başvurusu Yap","ar":"تقديم التسجيل إلى السجل التجاري"}[lang],
              {"en":"Agent/Human","tr":"Ajan/İnsan","ar":"وكيل/بشري"}[lang],
              {"en":"Go to local Trade Registry Office with notarized Articles, shareholder list, lease, ID copies. Pay fee (~500–1,500 TL).",
               "tr":"Yerel Ticaret Sicili'ne: noter onaylı sözleşme, hissedar listesi, kira, kimlik. Ücret: ~500–1.500 TL.",
               "ar":"اذهب إلى السجل التجاري المحلي بـ: العقد الموثق، قائمة المساهمين، الإيجار، الهويات. ادفع ~500–1,500 TL."}[lang]),
        (9,  {"en":"Open Corporate Bank Account","tr":"Kurumsal Banka Hesabı Aç","ar":"فتح حساب بنكي للشركة"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Open at any Turkish bank after Trade Registry approval. Bring registration certificate.",
               "tr":"Ticaret Sicili onayından sonra herhangi bir Türk bankasında açın.",
               "ar":"افتح في أي بنك تركي بعد موافقة السجل التجاري."}[lang]),
        (10, {"en":"Register with Tax Office","tr":"Vergi Dairesine Kayıt Ol","ar":"التسجيل في مكتب الضرائب"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Register VAT and corporate tax; collect official tax plate to display in store.",
               "tr":"KDV ve kurumlar vergisi kaydı; mağazada asılacak vergi levhası alın.",
               "ar":"سجّل ضريبة القيمة المضافة وضريبة الشركات؛ احصل على لوحة الضرائب للعرض."}[lang]),
        (11, {"en":"Apply for İşyeri Açma ve Çalışma Ruhsatı","tr":"İşyeri Açma ve Çalışma Ruhsatı Başvurusu","ar":"التقدم بطلب رخصة فتح وتشغيل المحل"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("edevlet_permit", lang)),
        (12, {"en":"Hire Accountant & Register Employees with SGK","tr":"Muhasebeci Tut ve Çalışanları SGK'ya Kaydet","ar":"توظيف محاسب وتسجيل الموظفين في SGK"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Certified accountant (SMMM) required by law. Register employees with SGK before first working day.",
               "tr":"Kanunla zorunlu SMMM. Çalışanları ilk iş gününden önce SGK'ya kaydedin.",
               "ar":"محاسب معتمد (SMMM) مطلوب. سجّل الموظفين في SGK قبل أول يوم عمل."}[lang]),
        (13, {"en":"Open Store for Business","tr":"Mağazayı Açın","ar":"افتتاح المتجر"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Display İşyeri Ruhsatı visibly; begin trading only after all approvals received.",
               "tr":"İşyeri Ruhsatı'nı görünür yere asın; yalnızca tüm onaylar alındıktan sonra açın.",
               "ar":"علّق رخصة المحل بوضوح؛ ابدأ البيع فقط بعد الحصول على جميع الموافقات."}[lang]),
    ]


def _steps_service(lang):
    return [
        (1,  {"en":"Obtain Turkish Tax Number","tr":"Vergi Kimlik Numarası Al","ar":"الحصول على الرقم الضريبي التركي"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Go to local tax office with passport (required for foreigners).",
               "tr":"Pasaportunuzla yerel vergi dairesine gidin.",
               "ar":"اذهب إلى مكتب الضرائب المحلي مع جواز السفر."}[lang]),
        (2,  {"en":"Decide Company Type (LTD or A.Ş.)","tr":"Şirket Türüne Karar Ver (LTD/A.Ş.)","ar":"تحديد نوع الشركة (LTD أو A.Ş.)"}[lang],
              {"en":"Human/Agent","tr":"İnsan/Ajan","ar":"بشري/وكيل"}[lang],
              {"en":"LTD suits most consulting/tech firms; A.Ş. for larger investor-backed companies.",
               "tr":"LTD çoğu danışmanlık/teknoloji şirketine uygundur; büyük yatırımcılı şirketler için A.Ş.",
               "ar":"LTD مناسبة لمعظم شركات الاستشارات والتكنولوجيا؛ A.Ş. للشركات الكبيرة."}[lang]),
        (3,  {"en":"Reserve Company Name via MERSİS","tr":"MERSİS'te Şirket Unvanını Rezerve Et","ar":"حجز اسم الشركة عبر MERSİS"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_name", lang)),
        (4,  {"en":"Select NACE Code (Service Sector)","tr":"NACE Kodu Seç (Hizmet Sektörü)","ar":"اختيار كود NACE (قطاع الخدمات)"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_nace", lang)),
        (5,  {"en":"Generate Articles of Association","tr":"Ana Sözleşmeyi Oluştur","ar":"إنشاء النظام الأساسي للشركة"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_articles", lang)),
        (6,  {"en":"Secure Office Address","tr":"Ofis Adresi Temin Et","ar":"تأمين عنوان المكتب"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Physical or virtual office address accepted for registration. Ensure it's verifiable for tax inspection.",
               "tr":"Fiziksel veya sanal ofis adresi kabul edilir. Vergi denetimi için doğrulanabilir olmalıdır.",
               "ar":"مكتب فعلي أو افتراضي مقبول للتسجيل. تأكد من إمكانية التحقق منه."}[lang]),
        (7,  {"en":"Notarize Articles & Signatures","tr":"Sözleşme ve İmzaları Noter Onaylı Yap","ar":"تصديق العقد والتوقيعات"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Visit Turkish notary with printed Articles, IDs, and translations if needed.",
               "tr":"Basılı Ana Sözleşme ve kimliklerle noter ziyareti yapın.",
               "ar":"زر كاتب العدل التركي مع العقد المطبوع والهويات."}[lang]),
        (8,  {"en":"Deposit Share Capital (LTD min. 10,000 TL)","tr":"Sermayeyi Bankaya Yatır (LTD min. 10.000 TL)","ar":"إيداع رأس المال (LTD الحد الأدنى 10,000 TL)"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Deposit in any Turkish bank; bank issues capital deposit letter needed for Trade Registry.",
               "tr":"Herhangi bir Türk bankasına yatırın; banka Ticaret Sicili için sermaye mektubu düzenler.",
               "ar":"أودع في أي بنك تركي؛ يصدر البنك خطاب إيداع رأس المال المطلوب للسجل التجاري."}[lang]),
        (9,  {"en":"Submit Registration to Trade Registry","tr":"Ticaret Siciline Tescil Başvurusu Yap","ar":"تقديم التسجيل إلى السجل التجاري"}[lang],
              {"en":"Agent/Human","tr":"Ajan/İnsan","ar":"وكيل/بشري"}[lang],
              {"en":"Go to local Trade Registry Office with notarized Articles, bank deposit letter, shareholder list, ID copies. Pay fee (~500–1,500 TL).",
               "tr":"Yerel Ticaret Sicili'ne: noter onaylı sözleşme, banka mektubu, hissedar listesi, kimlik. Ücret: ~500–1.500 TL.",
               "ar":"اذهب إلى السجل التجاري المحلي بـ: العقد الموثق، خطاب البنك، قائمة المساهمين. ادفع ~500–1,500 TL."}[lang]),
        (10, {"en":"Open Corporate Bank Account","tr":"Kurumsal Banka Hesabı Aç","ar":"فتح حساب بنكي للشركة"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Capital unblocked after registration—becomes working funds. Bring registration certificate.",
               "tr":"Tescilden sonra sermaye işletme fonuna dönüşür. Tescil belgesi götürün.",
               "ar":"رأس المال يصبح متاحاً بعد التسجيل. أحضر شهادة التسجيل."}[lang]),
        (11, {"en":"Register with Tax Office (VAT & Corp. Tax)","tr":"Vergi Dairesine Kayıt Ol","ar":"التسجيل في مكتب الضرائب"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Register VAT and corporate tax at local tax office; collect official tax plate.",
               "tr":"Yerel vergi dairesinde KDV ve kurumlar vergisi kaydı; vergi levhası alın.",
               "ar":"سجّل ضريبة القيمة المضافة وضريبة الشركات في مكتب الضرائب المحلي."}[lang]),
        (12, {"en":"Apply for İşyeri Açma ve Çalışma Ruhsatı","tr":"İşyeri Açma ve Çalışma Ruhsatı Başvurusu","ar":"التقدم بطلب رخصة فتح وتشغيل المحل"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("edevlet_permit", lang)),
        (13, {"en":"Hire Accountant & Register Employees with SGK","tr":"Muhasebeci Tut ve Çalışanları SGK'ya Kaydet","ar":"توظيف محاسب وتسجيل الموظفين في SGK"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Certified accountant (SMMM) required by law. Register employees with SGK before first working day.",
               "tr":"Kanunla zorunlu SMMM. Çalışanları ilk iş gününden önce SGK'ya kaydedin.",
               "ar":"محاسب معتمد (SMMM) مطلوب. سجّل الموظفين في SGK قبل أول يوم عمل."}[lang]),
        (14, {"en":"Begin Business Operations","tr":"Ticari Faaliyetlere Başla","ar":"بدء العمليات التجارية"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Start delivering services only after all permits and registrations are complete.",
               "tr":"Tüm kayıt ve izinler tamamlanınca hizmete başlayın.",
               "ar":"ابدأ تقديم الخدمات فقط بعد اكتمال جميع التسجيلات والتصاريح."}[lang]),
    ]


def _steps_general(lang):
    return [
        (1,  {"en":"Obtain Turkish Tax Number","tr":"Vergi Kimlik Numarası Al","ar":"الحصول على الرقم الضريبي التركي"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Go to local tax office with passport (required for foreigners).",
               "tr":"Pasaportunuzla yerel vergi dairesine gidin.",
               "ar":"اذهب إلى مكتب الضرائب المحلي مع جواز السفر."}[lang]),
        (2,  {"en":"Decide Company Type (LTD or A.Ş.)","tr":"Şirket Türüne Karar Ver (LTD/A.Ş.)","ar":"تحديد نوع الشركة (LTD أو A.Ş.)"}[lang],
              {"en":"Human/Agent","tr":"İnsan/Ajan","ar":"بشري/وكيل"}[lang],
              {"en":"Choose based on company size, shareholder structure, and funding needs.",
               "tr":"Büyüklük, hissedar yapısı ve finansman ihtiyacına göre seçin.",
               "ar":"اختر بناءً على حجم الشركة وهيكل المساهمين واحتياجات التمويل."}[lang]),
        (3,  {"en":"Reserve Company Name via MERSİS","tr":"MERSİS'te Şirket Unvanını Rezerve Et","ar":"حجز اسم الشركة عبر MERSİS"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_name", lang)),
        (4,  {"en":"Select Business Activity (NACE Code)","tr":"İş Faaliyetini Seç (NACE Kodu)","ar":"اختيار نشاط العمل (كود NACE)"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_nace", lang)),
        (5,  {"en":"Generate Articles of Association","tr":"Ana Sözleşmeyi Oluştur","ar":"إنشاء النظام الأساسي للشركة"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("mersis_articles", lang)),
        (6,  {"en":"Prepare Company Address","tr":"Şirket Adresini Hazırla","ar":"إعداد عنوان الشركة"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Physical or virtual office. Must be verifiable for tax inspection.",
               "tr":"Fiziksel veya sanal ofis. Vergi denetimi için doğrulanabilir olmalıdır.",
               "ar":"مكتب فعلي أو افتراضي. يجب أن يكون قابلاً للتحقق منه."}[lang]),
        (7,  {"en":"Notarize Articles & Signatures","tr":"Sözleşme ve İmzaları Noter Onaylı Yap","ar":"تصديق العقد والتوقيعات"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Visit Turkish notary with printed Articles, IDs, and translations if needed.",
               "tr":"Basılı Ana Sözleşme ve kimliklerle noter ziyareti yapın.",
               "ar":"زر كاتب العدل التركي مع العقد المطبوع والهويات."}[lang]),
        (8,  {"en":"Deposit Initial Capital (if required)","tr":"Başlangıç Sermayesini Yatır (Gerekliyse)","ar":"إيداع رأس المال الأولي (إذا لزم)"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Deposit in Turkish bank; bank issues capital deposit letter for Trade Registry.",
               "tr":"Türk bankasına yatırın; banka Ticaret Sicili için sermaye mektubu düzenler.",
               "ar":"أودع في بنك تركي؛ يصدر البنك خطاب إيداع رأس المال للسجل التجاري."}[lang]),
        (9,  {"en":"Submit Registration to Trade Registry","tr":"Ticaret Siciline Tescil Başvurusu Yap","ar":"تقديم التسجيل إلى السجل التجاري"}[lang],
              {"en":"Agent/Human","tr":"Ajan/İnsan","ar":"وكيل/بشري"}[lang],
              {"en":"Go to local Trade Registry Office with notarized Articles, bank letter, shareholder list, ID copies. Pay fee (~500–1,500 TL).",
               "tr":"Yerel Ticaret Sicili'ne: noter onaylı sözleşme, banka mektubu, hissedar listesi, kimlik. Ücret: ~500–1.500 TL.",
               "ar":"اذهب إلى السجل التجاري المحلي بـ: العقد الموثق، خطاب البنك، قائمة المساهمين. ادفع ~500–1,500 TL."}[lang]),
        (10, {"en":"Open Corporate Bank Account","tr":"Kurumsal Banka Hesabı Aç","ar":"فتح حساب بنكي للشركة"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Capital becomes working funds after registration. Bring registration certificate to bank.",
               "tr":"Tescilden sonra sermaye işletme fonuna dönüşür. Tescil belgesi götürün.",
               "ar":"رأس المال يصبح أموالاً تشغيلية بعد التسجيل. أحضر شهادة التسجيل."}[lang]),
        (11, {"en":"Register with Tax Office","tr":"Vergi Dairesine Kayıt Ol","ar":"التسجيل في مكتب الضرائب"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Register VAT and corporate tax at local tax office; collect official tax plate.",
               "tr":"Yerel vergi dairesinde KDV ve kurumlar vergisi kaydı; vergi levhası alın.",
               "ar":"سجّل الضرائب في مكتب الضرائب المحلي؛ احصل على لوحة الضرائب."}[lang]),
        (12, {"en":"Apply for İşyeri Açma ve Çalışma Ruhsatı","tr":"İşyeri Açma ve Çalışma Ruhsatı Başvurusu","ar":"التقدم بطلب رخصة فتح وتشغيل المحل"}[lang],
              {"en":"Agent","tr":"Ajan","ar":"وكيل"}[lang],
              _n("edevlet_permit", lang)),
        (13, {"en":"Hire Accountant & Register Employees with SGK","tr":"Muhasebeci Tut ve Çalışanları Kaydet","ar":"توظيف محاسب وتسجيل الموظفين في SGK"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Certified accountant (SMMM) required by law. Register employees with SGK before first working day.",
               "tr":"Kanunla zorunlu SMMM. Çalışanları ilk iş gününden önce SGK'ya kaydedin.",
               "ar":"محاسب معتمد (SMMM) مطلوب. سجّل الموظفين قبل أول يوم عمل."}[lang]),
        (14, {"en":"Start Business Operations","tr":"Ticari Faaliyetlere Başla","ar":"بدء العمليات التجارية"}[lang],
              {"en":"Human","tr":"İnsan","ar":"بشري"}[lang],
              {"en":"Open after all permits and registrations are approved.",
               "tr":"Tüm izin ve kayıtlar onaylandıktan sonra açın.",
               "ar":"الافتتاح بعد الموافقة على جميع التصاريح والتسجيلات."}[lang]),
    ]


_BUILDERS = {
    "food":    _steps_food,
    "retail":  _steps_retail,
    "service": _steps_service,
    "general": _steps_general,
}


def get_localized_steps(lang: str = "en", business_type: str = "Business"):
    """
    Return dynamic step list (id, title, responsible, notes) based on
    detected business category and requested language.

    Step counts:
      food     → 16  (adds Gıda Sicil, hygiene inspection, fire safety)
      retail   → 13  (no food permits, no capital deposit)
      service  → 14  (virtual office OK, no food steps)
      general  → 14  (safe fallback)

    Agent steps carry detailed 🔒 manual instructions — bot disabled pending legal approval.
    """
    btype = _detect_type(business_type)
    builder = _BUILDERS.get(btype, _steps_general)
    supported = {"en", "tr", "ar"}
    safe_lang = lang if lang in supported else "en"
    return builder(safe_lang)
