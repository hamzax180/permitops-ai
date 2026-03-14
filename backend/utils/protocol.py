def get_localized_steps(lang: str = "en"):
    specs_map = {
        "en": [
            (1, "Obtain Turkish Tax Number", "Human", "Go to local tax office with passport (required for foreigners)."),
            (2, "Decide Company Type (LTD or A.Ş.)", "Human/Agent", "Choose LTD (small/medium) or A.Ş. (large) before registration."),
            (3, "Reserve Company Name", "Agent", "Done online via MERSİS portal; system checks uniqueness."),
            (4, "Select Business Activity (NACE code)", "Agent", "Example: café → 5610 – Restaurants. Selected in MERSİS."),
            (5, "Generate Articles of Association", "Agent", "MERSİS auto-generates based on type, shareholders, and capital."),
            (6, "Prepare Company Address", "Human", "Rent office/shop/restaurant or use virtual office. Must be verifiable for tax inspection."),
            (7, "Notarize Articles & Signatures", "Human", "Visit Turkish notary for signatures and translations."),
            (8, "Deposit Initial Capital (if required)", "Human", "Deposit in Turkish bank (Ziraat, İş Bankası, Garanti, VakıfBank). Bank issues capital deposit letter."),
            (9, "Submit Registration to Trade Registry", "Agent/Human", "Submit notarized documents and deposit letter to Trade Registry Office. Company is published officially."),
            (10, "Open Corporate Bank Account", "Human", "After registration, unblocked capital becomes working funds."),
            (11, "Register Company with Tax Office", "Human", "Register VAT, corporate tax, and obtain official tax information."),
            (12, "Submit Municipality & Food Permit Forms", "Agent", "Use e-Devlet / municipal portal to submit applications online. Physical inspections by municipal authorities remain Human."),
            (13, "Hire Accountant & Register Employees", "Human", "Certified accountant required; register employees with SGK (social security)."),
            (14, "Start Business Operations", "Human", "Open café/shop/online store after all permits approved.")
        ],
        "tr": [
            (1, "Vergi Kimlik Numarası Al", "İnsan", "Pasaportunuzla yerel vergi dairesine gidin (yabancılar için zorunludur)."),
            (2, "Şirket Türüne Karar Ver (LTD veya A.Ş.)", "İnsan/Ajan", "Tescilden önce LTD (küçük/orta) veya A.Ş. (büyük) seçin."),
            (3, "Şirket Unvanını Rezerve Et", "Ajan", "MERSİS portalı üzerinden online yapılır; sistem benzersizliği kontrol eder."),
            (4, "İş Faaliyetini Seç (NACE kodu)", "Ajan", "Örnek: kafe → 5610 – Restoranlar. MERSİS'te seçilir."),
            (5, "Ana Sözleşmeyi Oluştur", "Ajan", "MERSİS; tür, hissedarlar ve sermayeye göre otomatik oluşturur."),
            (6, "Şirket Adresini Hazırla", "İnsan", "Ofis/dükkan/restoran kiralayın veya sanal ofis kullanın. Vergi denetimi için doğrulanabilir olmalıdır."),
            (7, "Sözleşmeyi ve İmzaları Noter Onaylı Yap", "İnsan", "İmzalar ve tercümeler için Türk noterini ziyaret edin."),
            (8, "Başlangıç Sermayesini Yatır (Gerekliyse)", "İnsan", "Türk bankasına yatırın (Ziraat, İş Bankası, Garanti, VakıfBank). Banka sermaye yatırma mektubu düzenler."),
            (9, "Kayıt Başvurusunu Ticaret Siciline Yap", "Ajan/İnsan", "Noter onaylı belgeleri ve banka mektubunu Ticaret Sicili Müdürlüğü'ne sunun. Şirket resmen ilan edilir."),
            (10, "Kurumsal Banka Hesabı Aç", "İnsan", "Tescilden sonra bloke edilen sermaye işletme fonuna dönüşür."),
            (11, "Şirketi Vergi Dairesine Kaydet", "İnsan", "KDV, kurumlar vergisi kaydı yapın ve resmi vergi levhasını alın."),
            (12, "Belediye ve Gıda İzni Formlarını Sun", "Ajan", "Başvuruları online yapmak için e-Devlet / belediye portalını kullanın. Fiziksel denetimler insan tarafından yapılır."),
            (13, "Muhasebeci Tut ve Çalışanları Kaydet", "İnsan", "Sertifikalı muhasebeci zorunludur; çalışanları SGK'ya kaydedin."),
            (14, "Ticari Faaliyetlere Başla", "İnsan", "Tüm izinler onaylandıktan sonra kafe/dükkan/online mağazanızı açın.")
        ],
        "ar": [
            (1, "الحصول على الرقم الضريبي التركي", "بشري", "اذهب إلى مكتب الضرائب المحلي مع جواز السفر (مطلوب للأجانب)."),
            (2, "تقييم نوع الشركة (LTD أو A.Ş.)", "بشري/وكيل", "اختر LTD (صغيرة/متوسطة) أو A.Ş. (كبيرة) قبل التسجيل."),
            (3, "حجز اسم الشركة", "وكيل", "يتم عبر بوابة MERSİS؛ يتحقق النظام من التفرد."),
            (4, "اختيار نشاط العمل (كود NACE)", "وكيل", "مثال: مقهى ← 5610 – مطاعم. يتم اختياره في MERSİS."),
            (5, "إنشاء النظام الأساسي للشركة", "وكيل", "يقوم MERSİS بإنشائه تلقائياً بناءً على النوع والمساهمين ورأس المال."),
            (6, "إعداد عنوان الشركة", "بشري", "استئجار مكتب/محل/مطعم أو استخدام مكتب افتراضي. يجب أن يكون قابلاً للتحقق لتفتيش الضرائب."),
            (7, "تصديق العقد والتوقيعات لدى كاتب العدل", "بشري", "زيارة كاتب العدل التركي للتوقيعات والترجمات."),
            (8, "إيداع رأس المال الأولي (إذا لزم الأمر)", "بشري", "الإيداع في بنك تركي (Ziraat, İş Bankası, Garanti, VakıfBank). يرسل البنك خطاب إيداع رأس المال."),
            (9, "تقديم التسجيل إلى السجل التجاري", "وكيل/بشري", "تقديم المستندات المصدقة وخطاب البنك إلى مكتب السجل التجاري. يتم نشر الشركة رسمياً."),
            (10, "فتح حساب بنكي للشركة", "بشري", "بعد التسجيل، يصبح رأس المال المحظور أموالاً عاملة."),
            (11, "تسجيل الشركة في مكتب الضرائب", "بشري", "تسجيل ضريبة القيمة المضافة وضريبة الشركات والحصول على لوحة الضرائب الرسمية."),
            (12, "تقديم نماذج تصاريح البلدية والأغذية", "وكيل", "استخدم بوابة e-Devlet / البلدية لتقديم الطلبات عبر الإنترنت. تفتيشات البلدية تظل بشرية."),
            (13, "تعيين محاسب وتسجيل الموظفين", "بشري", "مطلوب محاسب معتمد؛ تسجيل الموظفين في SGK (التأمينات الاجتماعية)."),
            (14, "بدء عمليات العمل", "بشري", "فتح المقهى/المحل/المتجر الإلكتروني بعد الموافقة على جميع التصاريح.")
        ]
    }
    return specs_map.get(lang, specs_map["en"])
