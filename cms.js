/**
 * Локальная CMS: правки в браузере → localStorage → подстановка на страницах.
 * Панель: admin.html. Смените PIN в SiteCMS.ADMIN_PIN.
 */
(function () {
  const STORAGE_KEY = "zin_site_cms_v1";

  /** Старый дефолт главного фото; из localStorage подставлялся и перекрывал index.html. */
  const LEGACY_PORTRAIT_IMG = "./ChatGPT Image 30 апр. 2026 г., 15_11_42.png";
  const LEGACY_HERO_PORTRAIT = "./hero-portrait.jpg";

  const defaults = {
    site_url: "https://zinusik1989-crypto.github.io/Website",
    page_title: "Нейрофотосессии в Заполярном | Зинаида — AI-фото без камеры",
    meta_description:
      "Зинаида — нейрофотосессии из Заполярного, Мурманская область. AI-визуал в северной эстетике: полярная ночь, сияние, глянец. Женский, детский и семейный портрет.",
    canonical_href: "./",
    og_title: "Нейрофотосессии в Заполярном | Зинаида",
    og_description:
      "Нейрофотосессии из Заполярного — AI-визуал в северной эстетике для экспертов, брендов и бизнеса.",
    og_url: "./",
    og_image: "./arctic-aurora.webp",
    twitter_title: "Нейрофотосессии в Заполярном | Зинаида",
    twitter_description:
      "Нейрофотосессии из Заполярного — AI-визуал в северной эстетике для экспертов, брендов и бизнеса.",
    twitter_image: "./arctic-aurora.webp",

    brand_name: "Зинаида",
    nav_home: "Главная",
    nav_about: "Обо мне",
    nav_services: "Услуги",
    nav_portfolio: "Портфолио",
    nav_songs: "Песни",
    nav_testimonials: "Отзывы",
    nav_pricing: "Тарифы",
    nav_contacts: "Контакты",
    header_portfolio_btn: "Портфолио",
    header_consult_btn: "Написать",

    kicker: "Заполярный • нейрофотосессии • AI-visual",
    hero_h1: "Фото мечты без камеры",
    hero_lead:
      "Создаю нейрофотосессии и AI-визуал из Заполярного — за Полярным кругом, где ночь длинная, а свет в кадре особенный",
    hero_price_hook: "Первое фото — от 150 ₽, без пакетов и обязательств",
    hero_btn_primary: "Написать в Telegram",
    hero_btn_secondary: "Смотреть портфолио",
    order_tg_msg:
      "Здравствуйте! Хочу нейрофотосессию. Подскажите, как начать.",
    order_tg_msg_photo:
      "Здравствуйте! Хочу заказать 1 нейрофото (150 ₽).",
    order_tg_msg_song:
      "Здравствуйте! Хочу заказать авторскую песню. Расскажите, как это проходит.",

    meta1_title: "Север",
    meta1_text: "Полярная ночь, сияние и ледяной свет — атмосфера Заполярного в кадре",
    meta2_title: "Глянец",
    meta2_text: "Редакционная эстетика, много воздуха, премиальный тон",
    meta3_title: "Без студии",
    meta3_text: "Нейросъёмка за дни — без холода, команд и поездок к фотографу",

    portrait_alt: "Нейропортрет Зинаиды на фоне северного сияния, Заполярный",
    portrait_img: "./arctic-aurora.webp",
    caption_title: "Северное сияние",
    caption_text: "Заполярный • полярная ночь • глянец",

    about_h2: "Обо мне",
    about_p1: "Меня зовут Зинаида.",
    about_p2:
      "Я живу в Заполярном, Мурманская область — за Полярным кругом — и создаю нейрофотосессии и AI-визуал для тех, кто хочет видеть себя красивыми, уверенными и «своими» в кадре, без студий и сложных съёмок.",
    about_badge_city: "Заполярный",
    about_badge_lat: "67° с. ш.",
    about_origin_h: "Север в каждом кадре",
    about_origin_p:
      "Полярная ночь, снег, сияние и ледяной свет — то, что я вижу каждый день, превращаю в атмосферу ваших нейрофотосессий. Без поездок на съёмку и без мороза — только вы и образ, который хочется сохранить.",
    about_p3:
      "Мне всегда было важно не просто сделать красивую картинку, а показать человека таким, каким он сам хочет себя чувствовать: спокойным, дорогим, живым и настоящим.",
    about_p4: "Поэтому я внимательно отношусь к деталям, настроению и атмосфере кадра.",
    about_p5: "Чтобы в итоге вы смотрели на фотографии и думали:",
    about_quote: "«Да, это действительно я. Только в своей лучшей версии».",
    about_p6: "AI для меня — всего лишь инструмент.",
    about_p7: "Главное — вкус, чувство меры и умение увидеть ваш образ.",

    pain_h2: "Ваш визуал либо привлекает клиентов, либо теряет их",
    pain_body:
      "Люди принимают решение за секунды. Если упаковка выглядит случайной, устаревшей или не отражает вашу ценность — клиент уходит к тем, кто выглядит дороже.",
    pain_callout:
      "Я делаю так, чтобы вы выглядели как бренд — даже если вы один человек.",

    pain_col1_h: "Что обычно ломает доверие в ленте",
    pain_col1_li1:
      "Разрозненный визуал: разные стили, кропы и свет в каждом посте — мозг считывает это как «любительский аккаунт», даже если экспертиза у вас сильная.",
    pain_col1_li2:
      "Нет единой истории: обложка курса, аватар и сторис выглядят как три разных бренда — сложнее запомнить и порекомендовать вас на словах.",
    pain_col1_li3:
      "Перегруз деталями: когда в кадре всё сразу, глаз не находит «главного героя» — и сообщение о ценности теряется.",
    pain_col2_h: "Что меняется, когда визуал собран системно",
    pain_col2_li1:
      "Читаемый образ: свет, цвет и композиция повторяют одну редакционную линию — как в глянце, только под ваш нишевой запрос.",
    pain_col2_li2:
      "Спокойная подача: меньше визуального шума — больше ощущения статуса и аккуратности; это особенно важно для экспертных и premium-услуг.",
    pain_col2_li3:
      "Готовность к публикации: кадры сразу ложатся в соцсети, на сайт и в презентации — без «дотягивания в телефоне за пять минут до поста».",

    services_h2: "Услуги",
    services_intro:
      "Полный цикл: идея → стиль → AI-визуал → правки → контент, готовый к публикации.",

    s1_t: "Нейрофотосессии",
    s1_d: "Портреты и образы в глянцевой эстетике — без съёмки и команды.",
    s2_t: "AI-видео и клипы",
    s2_d: "Рилсы, тизеры, заставки, атмосферные ролики — дорого и аккуратно.",
    s3_t: "Визуал для бренда",
    s3_d: "Moodboard, стиль, ключевые сцены и визуальные правила.",
    s4_t: "Обложки, баннеры и карточки",
    s4_d: "YouTube, подкасты, курсы, сторис, витрины — единая система.",
    s5_t: "Контент для соцсетей",
    s5_d: "Серии постов и визуальные пакеты, которые выглядят как редакция.",
    s6_t: "Продающие тексты и упаковка",
    s6_d: "Смыслы + структура: чтобы визуал работал на конверсию.",

    svc_detail_h: "Формат работы",
    svc_detail_p1:
      "Короткий бриф: кто вы, аудитория, тон и площадки. При необходимости — moodboard с референсами по свету и настроению. Визуал собираю в AI серией итераций — как работа с кадром и жанром, а не «одна кнопка».",
    svc_detail_p2:
      "На правках доводим детали до ощущения «дорого и цельно», отдаём файлы под формат (пост, сторис, обложка, баннер) и короткие подсказки по использованию. Нужна линия на месяц — выстроим ритм публикаций в одном стиле.",

    portfolio_h2: "Примеры работ",
    portfolio_intro:
      "Северная нейрофотосессия из Заполярного, женский и семейный портрет, детские образы — откройте альбом целиком.",
    work_arctic_img: "./portfolio/arctic.webp",
    work_arctic_alt: "Северная нейрофотосессия у панорамного окна, северное сияние, Заполярный",
    work_arctic_title: "Север / Арктика",
    work_arctic_tag: "Заполярный • альбом • 3 фото",
    work_arctic_btn: "Смотреть альбом",
    work_arctic_aria: "Открыть альбом: Север / Арктика",

    work_women_img: "./portfolio/women.webp",
    work_women_alt: "Женский нейропортрет с букетом тюльпанов, редакционная съёмка",
    work_women_title: "Женский портрет",
    work_women_tag: "альбом • 23 фото",
    work_women_btn: "Смотреть альбом",
    work_women_aria: "Открыть альбом: Женский портрет",

    work_kids_img: "./portfolio/kids.webp",
    work_kids_alt: "Детский нейропортрет в нежных тонах, фотосессия для ребёнка",
    work_kids_title: "Дети",
    work_kids_tag: "альбом • 11 фото",
    work_kids_btn: "Смотреть альбом",
    work_kids_aria: "Открыть альбом: Дети",

    work_family_img: "./portfolio/family.webp",
    work_family_alt: "Семейная нейрофотосессия на природе, золотой час",
    work_family_title: "Семейная",
    work_family_tag: "альбом • 4 фото",
    work_family_btn: "Смотреть альбом",
    work_family_aria: "Открыть альбом: Семейная съёмка",

    songs_kicker: "авторские песни",
    songs_h2: "Примеры работ на заказ",
    songs_intro:
      "Персональные тексты и мелодии — для поздравлений, семьи, экспертов и бренда. Ниже — примеры реальных заказов: послушайте атмосферу и напишите, если нужна своя история в песне.",
    song1_cover: "./songs/covers/koroleva-arktiki.webp?v=7",
    song1_cover_alt: "Обложка — Королева Арктики",
    song1_badge: "на заказ",
    song1_title: "Королева Арктики",
    song1_tag: "Арктика • авторская баллада",
    song1_desc:
      "Сказочный северный образ: сияние, корона из льда и сила Заполярья — песня на заказ под особый повод или презентацию.",
    song1_audio: "./songs/koroleva-arktiki.mp3",
    song1_demo: "Слушать на сайте",
    song2_cover: "./songs/covers/den-rozhdeniya-irina.webp?v=7",
    song2_cover_alt: "Обложка — С днём рождения, Ирина",
    song2_badge: "на заказ",
    song2_title: "С днём рождения, Ирина",
    song2_tag: "Поздравление • личная история",
    song2_desc:
      "Тёплая песня с именем и узнаваемыми деталями — для семейного праздника, видео-открытки или сюрприза близкому человеку.",
    song2_audio: "./songs/den-rozhdeniya-irina.mp3",
    song2_demo: "Слушать на сайте",
    song3_cover: "./songs/covers/severnaya-shamanka.webp?v=7",
    song3_cover_alt: "Обложка — Северная шаманка",
    song3_badge: "на заказ",
    song3_title: "Северная шаманка",
    song3_tag: "Этно • мистика севера",
    song3_desc:
      "Атмосферный трек с северным настроением: ритуал, тайга и голос земли — для тех, кто любит глубину и характер.",
    song3_audio: "./songs/severnaya-shamanka.mp3",
    song3_demo: "Слушать на сайте",
    song4_cover: "./songs/covers/govorili-tishe.webp?v=7",
    song4_cover_alt: "Обложка — Говорили: тише…",
    song4_badge: "на заказ",
    song4_title: "Говорили: тише…",
    song4_tag: "Лирика • камерный звук",
    song4_desc:
      "Спокойная авторская песня с акцентом на чувства и интонацию — когда важны слова, паузы и доверие.",
    song4_audio: "./songs/govorili-tishe.mp3",
    song4_demo: "Слушать на сайте",
    song5_cover: "./songs/covers/demebelskiy-vokzal.webp?v=7",
    song5_cover_alt: "Обложка — Дембельский вокзал",
    song5_badge: "на заказ",
    song5_title: "Дембельский вокзал",
    song5_tag: "Армия • прощание • дорога домой",
    song5_desc:
      "Песня про службу, встречу и возвращение: сильный сюжет и узнаваемые эмоции — частый заказ к дембелю и юбилеям.",
    song5_audio: "./songs/demebelskiy-vokzal.mp3",
    song5_demo: "Слушать на сайте",
    song6_cover: "./songs/covers/murmansk-zapominaet.webp?v=7",
    song6_cover_alt: "Обложка — Мурманск запоминает",
    song6_badge: "на заказ",
    song6_title: "Мурманск запоминает",
    song6_tag: "Заполярье • город • память",
    song6_desc:
      "Песня про Мурманск и северный характер: бухты, сияние и гордость края — для местных проектов, юбилеев и тёплой ностальгии.",
    song6_audio: "./songs/murmansk-zapominaet.mp3",
    song6_demo: "Слушать на сайте",
    song7_cover: "./songs/covers/pozvoni-poka-ne-pozdno.webp?v=7",
    song7_cover_alt: "Обложка — Позвони, пока не поздно",
    song7_badge: "на заказ",
    song7_title: "Позвони, пока не поздно",
    song7_tag: "Любовь • звонок • прощение",
    song7_desc:
      "Эмоциональная лирика о том, что важно успеть сказать и услышать друг друга — для пары, семьи или признания, которое откладывали.",
    song7_audio: "./songs/pozvoni-poka-ne-pozdno.mp3",
    song7_demo: "Слушать на сайте",
    songs_cta_text:
      "Нужна песня под ваш повод — свадьба, день рождения, благодарность коллегам или саунд для контента? Обсудим сюжет, настроение и срок; в прайсе — от 1000 ₽ за индивидуальную композицию.",
    songs_cta_btn: "Заказать песню",
    songs_cta_price: "Смотреть цену",

    audience_h2: "Для кого",
    audience_intro:
      "Если вы хотите выглядеть дороже — мы точно подходим друг другу.",
    chip1: "Эксперты",
    chip2: "Психологи",
    chip3: "Бизнесмены",
    chip4: "Бьюти-мастера",
    chip5: "Локальные бренды",
    chip6: "Те, кто хочет выглядеть дороже в соцсетях",

    audience_detail_h:
      "Если откликается несколько пунктов — вы точно в целевой аудитории",
    audience_detail_li1:
      "Вы продаёте консультации, наставничество или услуги «лицом бренда» и понимаете, что первое впечатление в профиле решает, дочитают ли био до конца.",
    audience_detail_li2:
      "Вам важно выглядеть спокойно и дорого: без крика «купи», но с ощущением уверенности и вкуса — как у редакций и сильных личных брендов.",
    audience_detail_li3:
      "Вы устали от вечного «снять что-нибудь на телефон» и хотите систему: когда визуал можно планировать и он не спорит с позиционированием.",
    audience_detail_li4:
      "Вы готовы к аккуратной дистанции: я не заменяю стратегию продаж и не обещаю магических цифр — но даю визуальный слой, который поддерживает вашу экспертность и чек.",

    process_h2: "Процесс работы",
    process_intro: "Чётко, быстро и спокойно — с уважением к вашему времени.",

    p1_t: "Обсуждаем идею и цель",
    p1_x: "Кому продаём, какой образ создаём, какой результат нужен.",
    p2_t: "Подбираем стиль и референсы",
    p2_x: "Vogue-эстетика, брендинг, цвет, настроение, фактуры.",
    p3_t: "Создаю визуал через AI",
    p3_x: "Собираю образы, сцены, композиции и атмосферу под вас.",
    p4_t: "Вносим правки",
    p4_x: "Тонкие корректировки — чтобы было «вау», а не «почти».",
    p5_t: "Вы получаете готовый контент",
    p5_x: "Файлы для соцсетей/сайта, обложки и гайды по использованию.",

    faq_h2: "Частые вопросы",
    faq_intro:
      "Коротко о формате, сроках и результате. Ответы можно править в админке — текст подставляется на страницу.",
    faq1_q: "Это замена фотографу и студии?",
    faq1_a:
      "Это другой инструмент: по ощущению результат может быть очень близок к студийной съёмке, но путь другой — через генерацию и пост-обработку. Для задач «портрет / обложка / серия для соцсетей» это часто быстрее и гибче по правкам. Для задач, где критичны физика ткани, сложный репортаж или ювелирный макро-свет, всё ещё может быть уместна классическая съёмка.",
    faq2_q: "Как передаются файлы и в каком качестве?",
    faq2_a:
      "По договорённости: обычно это PNG или JPEG высокого разрешения под площадку (пост, обложка, печать). Для видео — файл в удобном для вас формате и длительности. Если вам нужны особые пропорции или безопасные поля под текст на баннере — заложим это ещё на этапе брифа.",
    faq3_q: "Сколько раундов правок входит в работу?",
    faq3_a:
      "На практике большинство кадров доводится за 1–2 раунда точечных правок: свет, детали, фон, кроп. Сложные композиции или «почти как в референсе, но не копия» могут занять больше итераций — это нормально; заранее проговорим ожидания и сроки.",
    faq4_q: "Можно ли использовать результат в рекламе и на обложках курсов?",
    faq4_a:
      "Да, если это заранее зафиксировано как цель проекта: подготовлю кадры с запасом по кропу и подскажу, какие варианты лучше для узкой обложки, квадрата профиля и горизонтального баннера. Юридические нюансы платформ (правила рекламных кабинетов, музыка в видео и т.д.) остаются на стороне площадки и вашего сценария — визуал я довожу до «готово к публикации» с точки зрения картинки.",
    faq5_q: "Конфиденциальность и исходные данные",
    faq5_a_before: "Рабочие материалы и переписка обычно остаются между нами; на сайте есть страница ",
    faq_privacy_label: "политики конфиденциальности",
    faq_privacy_href: "./privacy.html",
    faq5_a_after:
      ". Если нужен отдельный режим (NDA, удаление промежуточных файлов после сдачи) — обсудим до старта.",
    faq6_q: "Можно заказать песню на день рождения или праздник?",
    faq6_a:
      "Да. Авторская песня — отдельная услуга от 1000 ₽: персональный текст и атмосфера под ваш повод. Примеры — в блоке «Песни» на сайте; напишите в Telegram — обсудим сюжет и сроки.",

    pricing_kicker: "прайс-лист",
    pricing_h2: "Услуги и цены",
    pricing_intro:
      "Стартовые позиции от 150 ₽. Можно начать с одного фото — без обязательств и пакетов.",
    order_step1: "Напишите в Telegram — опишите задачу или приложите референс",
    order_step2: "Согласуем образ, стиль и срок (обычно 1–3 дня)",
    order_step3: "Получите готовые файлы — можно сразу публиковать",
    pricing_cta: "Написать в Telegram",
    pricing_note:
      "Финальная стоимость зависит от объёма и сроков — обсудим в переписке.",

    svc1_name: "Нейрофотосессия",
    svc1_r1_name: "1 фото",            svc1_r1_price: "150 ₽",
    svc1_r2_name: "Парная фотография", svc1_r2_price: "200 ₽",
    svc1_r3_name: "Фото с 4 людьми",   svc1_r3_price: "400 ₽",
    svc1_r4_name: "Каждый дополнительный человек", svc1_r4_price: "+50 ₽",

    svc2_name: "Нейровидео",
    svc2_r1_name: "Видео от 1 минуты", svc2_r1_price: "2000 ₽",

    svc3_name: "Реставрация фото",
    svc3_r1_name: "1 фото",            svc3_r1_price: "150 ₽",

    svc4_name: "Оживление фото",
    svc4_r1_name: "1 фото",            svc4_r1_price: "300 ₽",

    svc5_name: "Песня на заказ",
    svc5_r1_name: "Индивидуальная песня", svc5_r1_price: "1000 ₽",

    test_h2: "Отзывы",
    test_intro:
      "Реальные сообщения клиентов из VK и Telegram — после нейрофотосессий и заказов.",
    test_shot1_src: "ВКонтакте",
    test_shot2_src: "Telegram",
    test_shot3_src: "Telegram",
    test_shot4_src: "Telegram",
    test_shot5_src: "Telegram",
    test_shot6_src: "Отзыв клиента",
    test_shot1_img: "./testimonials/review-01.webp",
    test_shot1_alt: "Отзывы клиентов во ВКонтакте — Зинаида, нейрофотосессии",
    test_shot2_img: "./testimonials/review-02.webp",
    test_shot2_alt: "Отзыв в Telegram — «Вау», «Круто» после семейной нейрофотосессии",
    test_shot3_img: "./testimonials/review-03.webp",
    test_shot3_alt: "Отзыв в Telegram — про нейрофотосессию без студии",
    test_shot4_img: "./testimonials/review-04.webp",
    test_shot4_alt: "Отзыв в Telegram — «Вам спасибо, такие милые»",
    test_shot5_img: "./testimonials/review-05.webp",
    test_shot5_alt: "Отзыв в Telegram — «Спасибо большое»",
    test_shot6_img: "./testimonials/review-06.webp",
    test_shot6_alt: "Отзыв — «Спасибочки большое», Галина",

    cta_h2: "Готовы выглядеть дороже уже сегодня?",
    cta_body:
      "Напишите мне — и я покажу, каким может быть ваш визуал с помощью AI.",
    cta_btn_primary: "Написать в Telegram",
    cta_btn_secondary: "На главную",
    cta_note:
      "Ответ в Telegram обычно в течение 24 часов. Можем начать с мини-аудита профиля и идеи для образа.",

    cta_mail_href: "https://t.me/zinaida_ai",
    contact_tg_label: "Telegram",
    contact_tg_href: "https://t.me/zinaida_ai",
    contact_tg_text: "@zinaida_ai",
    contact_vk_label: "VK",
    contact_vk_href: "https://vk.com/zinaida_ai",
    contact_vk_text: "vk.com/zinaida_ai",
    contact_phone_label: "MAX",
    contact_phone_href: "tel:+79216680215",
    contact_phone_text: "+7 (921) 668-02-15",
    contact_note:
      "Ответ в течение 24 часов. Можем начать с мини-аудита профиля и идеи для образа.",

    footer_copy:
      "© 2026 Зинаида | Фото мечты без камеры. Заполярный, Мурманская область.",
    footer_top: "На главную",
    footer_policy: "Политика",

    lb_dialog_aria: "Альбом",
    lb_title: "Альбом",
    lb_img_alt: "Фото из альбома портфолио Зинаида",
  };

  const schema = [
    { section: "SEO, соцсети и вкладка", fields: [
      { key: "site_url", label: "Базовый URL сайта (https://… без слэша в конце; пусто = авто)", type: "text", wide: true },
      { key: "page_title", label: "Заголовок вкладки (title)", type: "text" },
      { key: "meta_description", label: "Meta description (name=description)", type: "textarea", rows: 3, wide: true },
      { key: "canonical_href", label: "Canonical (./ или полный URL)", type: "text", wide: true },
      { key: "og_title", label: "Open Graph — og:title", type: "text" },
      { key: "og_description", label: "Open Graph — og:description", type: "textarea", rows: 3 },
      { key: "og_url", label: "Open Graph — og:url (./ = главная)", type: "text", wide: true },
      { key: "og_image", label: "Open Graph — og:image (URL/путь)", type: "text", wide: true },
      { key: "twitter_title", label: "Twitter — title", type: "text" },
      { key: "twitter_description", label: "Twitter — description", type: "textarea", rows: 3 },
      { key: "twitter_image", label: "Twitter — image (URL/путь)", type: "text", wide: true },
    ]},
    { section: "Шапка и меню", fields: [
      { key: "brand_name", label: "Имя в шапке (ссылка на блок «Обо мне»)", type: "text" },
      { key: "nav_home", label: "Пункт: Главная", type: "text" },
      { key: "nav_about", label: "Пункт: Обо мне", type: "text" },
      { key: "nav_services", label: "Пункт: Услуги", type: "text" },
      { key: "nav_portfolio", label: "Пункт: Портфолио", type: "text" },
      { key: "nav_songs", label: "Пункт: Песни", type: "text" },
      { key: "nav_testimonials", label: "Пункт: Отзывы", type: "text" },
      { key: "nav_pricing", label: "Пункт: Тарифы", type: "text" },
      { key: "nav_contacts", label: "Пункт: Контакты", type: "text" },
      { key: "header_portfolio_btn", label: "Кнопка Портфолио", type: "text" },
      { key: "header_consult_btn", label: "Кнопка Консультация", type: "text" },
    ]},
    { section: "Главный экран", fields: [
      { key: "kicker", label: "Подзаголовок (kicker)", type: "text" },
      { key: "hero_h1", label: "Заголовок H1", type: "text" },
      { key: "hero_lead", label: "Лид-абзац", type: "textarea" },
      { key: "hero_price_hook", label: "Строка «от 150 ₽»", type: "text", wide: true },
      { key: "hero_btn_primary", label: "Кнопка 1", type: "text" },
      { key: "order_tg_msg", label: "Текст заявки в Telegram (общий)", type: "textarea", wide: true },
      { key: "order_tg_msg_photo", label: "Текст заявки — 1 фото", type: "textarea", wide: true },
      { key: "order_tg_msg_song", label: "Текст заявки — песня", type: "textarea", wide: true },
      { key: "hero_btn_secondary", label: "Кнопка 2", type: "text" },
      { key: "meta1_title", label: "Карточка 1 — заголовок", type: "text" },
      { key: "meta1_text", label: "Карточка 1 — текст", type: "textarea" },
      { key: "meta2_title", label: "Карточка 2 — заголовок", type: "text" },
      { key: "meta2_text", label: "Карточка 2 — текст", type: "textarea" },
      { key: "meta3_title", label: "Карточка 3 — заголовок", type: "text" },
      { key: "meta3_text", label: "Карточка 3 — текст", type: "textarea" },
      { key: "portrait_img", label: "URL/путь главного фото", type: "text" },
      { key: "portrait_alt", label: "Alt главного фото", type: "text" },
      { key: "caption_title", label: "Подпись фото — заголовок", type: "text" },
      { key: "caption_text", label: "Подпись фото — строка", type: "text" },
    ]},
    { section: "Обо мне", fields: [
      { key: "about_h2", label: "Заголовок секции", type: "text" },
      { key: "about_p1", label: "Абзац 1 (вступление)", type: "textarea", rows: 2 },
      { key: "about_p2", label: "Абзац 2", type: "textarea", rows: 4, wide: true },
      { key: "about_p3", label: "Абзац 3", type: "textarea", rows: 4, wide: true },
      { key: "about_p4", label: "Абзац 4", type: "textarea", rows: 3 },
      { key: "about_p5", label: "Текст перед цитатой", type: "textarea", rows: 2 },
      { key: "about_quote", label: "Цитата (блок)", type: "textarea", rows: 2, wide: true },
      { key: "about_p6", label: "Абзац после цитаты", type: "textarea", rows: 2 },
      { key: "about_p7", label: "Финальный абзац", type: "textarea", rows: 2 },
      { key: "about_badge_city", label: "Бейдж — город", type: "text" },
      { key: "about_badge_lat", label: "Бейдж — широта", type: "text" },
      { key: "about_origin_h", label: "Блок «Север» — заголовок", type: "text" },
      { key: "about_origin_p", label: "Блок «Север» — текст", type: "textarea", rows: 4, wide: true },
    ]},
    { section: "Блок «боль»", fields: [
      { key: "pain_h2", label: "Заголовок", type: "text" },
      { key: "pain_body", label: "Текст", type: "textarea", rows: 4, wide: true },
      { key: "pain_callout", label: "Выделенная фраза", type: "textarea", rows: 3 },
      { key: "pain_col1_h", label: "Подблок 1 — заголовок колонки", type: "text", wide: true },
      { key: "pain_col1_li1", label: "Подблок 1 — пункт 1", type: "textarea", rows: 3 },
      { key: "pain_col1_li2", label: "Подблок 1 — пункт 2", type: "textarea", rows: 3 },
      { key: "pain_col1_li3", label: "Подблок 1 — пункт 3", type: "textarea", rows: 3 },
      { key: "pain_col2_h", label: "Подблок 2 — заголовок колонки", type: "text", wide: true },
      { key: "pain_col2_li1", label: "Подблок 2 — пункт 1", type: "textarea", rows: 3 },
      { key: "pain_col2_li2", label: "Подблок 2 — пункт 2", type: "textarea", rows: 3 },
      { key: "pain_col2_li3", label: "Подблок 2 — пункт 3", type: "textarea", rows: 3 },
    ]},
    { section: "Услуги (6 карточек + текст снизу)", fields: [
      { key: "services_h2", label: "Заголовок секции", type: "text" },
      { key: "services_intro", label: "Вводный текст", type: "textarea", rows: 3, wide: true },
      { key: "s1_t", label: "1 — заголовок", type: "text" }, { key: "s1_d", label: "1 — описание", type: "textarea", rows: 2 },
      { key: "s2_t", label: "2 — заголовок", type: "text" }, { key: "s2_d", label: "2 — описание", type: "textarea", rows: 2 },
      { key: "s3_t", label: "3 — заголовок", type: "text" }, { key: "s3_d", label: "3 — описание", type: "textarea", rows: 2 },
      { key: "s4_t", label: "4 — заголовок", type: "text" }, { key: "s4_d", label: "4 — описание", type: "textarea", rows: 2 },
      { key: "s5_t", label: "5 — заголовок", type: "text" }, { key: "s5_d", label: "5 — описание", type: "textarea", rows: 2 },
      { key: "s6_t", label: "6 — заголовок", type: "text" }, { key: "s6_d", label: "6 — описание", type: "textarea", rows: 2 },
      { key: "svc_detail_h", label: "Под карточками — заголовок", type: "text", wide: true },
      { key: "svc_detail_p1", label: "Под карточками — левая колонка", type: "textarea", rows: 4, wide: true },
      { key: "svc_detail_p2", label: "Под карточками — правая колонка", type: "textarea", rows: 4, wide: true },
    ]},
    { section: "Портфолио (4 альбома)", fields: [
      { key: "portfolio_h2", label: "Заголовок секции", type: "text" },
      { key: "portfolio_intro", label: "Вводный текст", type: "textarea" },

      { key: "work_arctic_img", label: "Север — превью (путь)", type: "text" },
      { key: "work_arctic_alt", label: "Север — alt превью", type: "text", wide: true },
      { key: "work_arctic_title", label: "Север — название", type: "text" },
      { key: "work_arctic_tag", label: "Север — подпись", type: "text" },
      { key: "work_arctic_btn", label: "Север — текст кнопки", type: "text" },
      { key: "work_arctic_aria", label: "Север — aria-label кнопки", type: "text" },

      { key: "work_women_img", label: "Женский портрет — превью (путь)", type: "text" },
      { key: "work_women_alt", label: "Женский портрет — alt превью", type: "text", wide: true },
      { key: "work_women_title", label: "Женский портрет — название", type: "text" },
      { key: "work_women_tag", label: "Женский портрет — подпись (альбом • N фото)", type: "text" },
      { key: "work_women_btn", label: "Женский портрет — текст кнопки", type: "text" },
      { key: "work_women_aria", label: "Женский портрет — aria-label кнопки", type: "text" },

      { key: "work_kids_img", label: "Дети — превью (путь)", type: "text" },
      { key: "work_kids_alt", label: "Дети — alt превью", type: "text", wide: true },
      { key: "work_kids_title", label: "Дети — название", type: "text" },
      { key: "work_kids_tag", label: "Дети — подпись", type: "text" },
      { key: "work_kids_btn", label: "Дети — текст кнопки", type: "text" },
      { key: "work_kids_aria", label: "Дети — aria-label кнопки", type: "text" },

      { key: "work_family_img", label: "Семейная — превью (путь)", type: "text" },
      { key: "work_family_alt", label: "Семейная — alt превью", type: "text", wide: true },
      { key: "work_family_title", label: "Семейная — название", type: "text" },
      { key: "work_family_tag", label: "Семейная — подпись", type: "text" },
      { key: "work_family_btn", label: "Семейная — текст кнопки", type: "text" },
      { key: "work_family_aria", label: "Семейная — aria-label кнопки", type: "text" },

      { key: "lb_dialog_aria", label: "Лайтбокс — запасной aria-label диалога", type: "text" },
      { key: "lb_title", label: "Лайтбокс — запасной заголовок", type: "text" },
      { key: "lb_img_alt", label: "Лайтбокс — запасной alt (до открытия альбома)", type: "text" },
    ]},
    { section: "Авторские песни (7 примеров)", fields: [
      { key: "songs_kicker", label: "Kicker", type: "text" },
      { key: "songs_h2", label: "Заголовок", type: "text" },
      { key: "songs_intro", label: "Вводный текст", type: "textarea", rows: 3, wide: true },
      { key: "song1_cover", label: "1 — обложка (путь)", type: "text" },
      { key: "song1_cover_alt", label: "1 — alt обложки", type: "text" },
      { key: "song1_badge", label: "1 — бейдж", type: "text" },
      { key: "song1_title", label: "1 — название", type: "text" },
      { key: "song1_tag", label: "1 — подпись", type: "text" },
      { key: "song1_desc", label: "1 — описание", type: "textarea", rows: 3, wide: true },
      { key: "song1_audio", label: "1 — аудио (путь .mp3, пусто = без плеера)", type: "text", wide: true },
      { key: "song1_demo", label: "1 — подпись под плеером", type: "text", wide: true },
      { key: "song2_cover", label: "2 — обложка (путь)", type: "text" },
      { key: "song2_cover_alt", label: "2 — alt обложки", type: "text" },
      { key: "song2_badge", label: "2 — бейдж", type: "text" },
      { key: "song2_title", label: "2 — название", type: "text" },
      { key: "song2_tag", label: "2 — подпись", type: "text" },
      { key: "song2_desc", label: "2 — описание", type: "textarea", rows: 3, wide: true },
      { key: "song2_audio", label: "2 — аудио (путь)", type: "text", wide: true },
      { key: "song2_demo", label: "2 — подпись под плеером", type: "text", wide: true },
      { key: "song3_cover", label: "3 — обложка (путь)", type: "text" },
      { key: "song3_cover_alt", label: "3 — alt обложки", type: "text" },
      { key: "song3_badge", label: "3 — бейдж", type: "text" },
      { key: "song3_title", label: "3 — название", type: "text" },
      { key: "song3_tag", label: "3 — подпись", type: "text" },
      { key: "song3_desc", label: "3 — описание", type: "textarea", rows: 3, wide: true },
      { key: "song3_audio", label: "3 — аудио (путь)", type: "text", wide: true },
      { key: "song3_demo", label: "3 — подпись под плеером", type: "text", wide: true },
      { key: "song4_cover", label: "4 — обложка (путь)", type: "text" },
      { key: "song4_cover_alt", label: "4 — alt обложки", type: "text" },
      { key: "song4_badge", label: "4 — бейдж", type: "text" },
      { key: "song4_title", label: "4 — название", type: "text" },
      { key: "song4_tag", label: "4 — подпись", type: "text" },
      { key: "song4_desc", label: "4 — описание", type: "textarea", rows: 3, wide: true },
      { key: "song4_audio", label: "4 — аудио (путь)", type: "text", wide: true },
      { key: "song4_demo", label: "4 — подпись под плеером", type: "text", wide: true },
      { key: "song5_cover", label: "5 — обложка (путь)", type: "text" },
      { key: "song5_cover_alt", label: "5 — alt обложки", type: "text" },
      { key: "song5_badge", label: "5 — бейдж", type: "text" },
      { key: "song5_title", label: "5 — название", type: "text" },
      { key: "song5_tag", label: "5 — подпись", type: "text" },
      { key: "song5_desc", label: "5 — описание", type: "textarea", rows: 3, wide: true },
      { key: "song5_audio", label: "5 — аудио (путь)", type: "text", wide: true },
      { key: "song5_demo", label: "5 — подпись под плеером", type: "text", wide: true },
      { key: "song6_cover", label: "6 — обложка (путь)", type: "text" },
      { key: "song6_cover_alt", label: "6 — alt обложки", type: "text" },
      { key: "song6_badge", label: "6 — бейдж", type: "text" },
      { key: "song6_title", label: "6 — название", type: "text" },
      { key: "song6_tag", label: "6 — подпись", type: "text" },
      { key: "song6_desc", label: "6 — описание", type: "textarea", rows: 3, wide: true },
      { key: "song6_audio", label: "6 — аудио (путь)", type: "text", wide: true },
      { key: "song6_demo", label: "6 — подпись под плеером", type: "text", wide: true },
      { key: "song7_cover", label: "7 — обложка (путь)", type: "text" },
      { key: "song7_cover_alt", label: "7 — alt обложки", type: "text" },
      { key: "song7_badge", label: "7 — бейдж", type: "text" },
      { key: "song7_title", label: "7 — название", type: "text" },
      { key: "song7_tag", label: "7 — подпись", type: "text" },
      { key: "song7_desc", label: "7 — описание", type: "textarea", rows: 3, wide: true },
      { key: "song7_audio", label: "7 — аудио (путь)", type: "text", wide: true },
      { key: "song7_demo", label: "7 — подпись под плеером", type: "text", wide: true },
      { key: "songs_cta_text", label: "CTA — текст", type: "textarea", rows: 3, wide: true },
      { key: "songs_cta_btn", label: "CTA — кнопка заказа", type: "text" },
      { key: "songs_cta_price", label: "CTA — кнопка прайса", type: "text" },
    ]},
    { section: "Аудитория (чипы + список)", fields: [
      { key: "audience_h2", label: "Заголовок", type: "text" },
      { key: "audience_intro", label: "Вводный текст", type: "text" },
      { key: "chip1", label: "Чип 1", type: "text" },
      { key: "chip2", label: "Чип 2", type: "text" },
      { key: "chip3", label: "Чип 3", type: "text" },
      { key: "chip4", label: "Чип 4", type: "text" },
      { key: "chip5", label: "Чип 5", type: "text" },
      { key: "chip6", label: "Чип 6", type: "text" },
      { key: "audience_detail_h", label: "Под чипами — заголовок", type: "text", wide: true },
      { key: "audience_detail_li1", label: "Под чипами — пункт 1", type: "textarea", rows: 3, wide: true },
      { key: "audience_detail_li2", label: "Под чипами — пункт 2", type: "textarea", rows: 3, wide: true },
      { key: "audience_detail_li3", label: "Под чипами — пункт 3", type: "textarea", rows: 3, wide: true },
      { key: "audience_detail_li4", label: "Под чипами — пункт 4", type: "textarea", rows: 3, wide: true },
    ]},
    { section: "Процесс (5 шагов)", fields: [
      { key: "process_h2", label: "Заголовок", type: "text" },
      { key: "process_intro", label: "Вводный текст", type: "text" },
      ...[1, 2, 3, 4, 5].flatMap((n) => [
        { key: `p${n}_t`, label: `Шаг ${n} — заголовок`, type: "text" },
        { key: `p${n}_x`, label: `Шаг ${n} — текст`, type: "textarea", rows: 2 },
      ]),
    ]},
    { section: "Частые вопросы (FAQ)", fields: [
      { key: "faq_h2", label: "Заголовок секции", type: "text" },
      { key: "faq_intro", label: "Вводный текст под заголовком", type: "textarea", rows: 2, wide: true },
      { key: "faq1_q", label: "Вопрос 1", type: "text", wide: true },
      { key: "faq1_a", label: "Ответ 1", type: "textarea", rows: 4, wide: true },
      { key: "faq2_q", label: "Вопрос 2", type: "text", wide: true },
      { key: "faq2_a", label: "Ответ 2", type: "textarea", rows: 4, wide: true },
      { key: "faq3_q", label: "Вопрос 3", type: "text", wide: true },
      { key: "faq3_a", label: "Ответ 3", type: "textarea", rows: 4, wide: true },
      { key: "faq4_q", label: "Вопрос 4", type: "text", wide: true },
      { key: "faq4_a", label: "Ответ 4", type: "textarea", rows: 4, wide: true },
      { key: "faq5_q", label: "Вопрос 5", type: "text", wide: true },
      { key: "faq5_a_before", label: "Ответ 5 — текст до ссылки", type: "textarea", rows: 2, wide: true },
      { key: "faq_privacy_label", label: "Ответ 5 — текст ссылки", type: "text" },
      { key: "faq_privacy_href", label: "Ответ 5 — URL ссылки (privacy)", type: "text" },
      { key: "faq5_a_after", label: "Ответ 5 — текст после ссылки", type: "textarea", rows: 2, wide: true },
      { key: "faq6_q", label: "Вопрос 6 — песни", type: "text", wide: true },
      { key: "faq6_a", label: "Ответ 6 — песни", type: "textarea", rows: 4, wide: true },
    ]},
    { section: "Прайс-лист", fields: [
      { key: "pricing_kicker", label: "Надзаголовок", type: "text" },
      { key: "pricing_h2", label: "Заголовок секции", type: "text" },
      { key: "pricing_intro", label: "Вводный текст", type: "textarea" },
      { key: "order_step1", label: "Как заказать — шаг 1", type: "text", wide: true },
      { key: "order_step2", label: "Как заказать — шаг 2", type: "text", wide: true },
      { key: "order_step3", label: "Как заказать — шаг 3", type: "text", wide: true },
      { key: "pricing_cta", label: "Кнопка заказа", type: "text" },
      { key: "pricing_note", label: "Подпись под кнопкой", type: "textarea" },

      { key: "svc1_name", label: "Услуга 1 — название", type: "text" },
      { key: "svc1_r1_name", label: "1.1 — пункт", type: "text" }, { key: "svc1_r1_price", label: "1.1 — цена", type: "text" },
      { key: "svc1_r2_name", label: "1.2 — пункт", type: "text" }, { key: "svc1_r2_price", label: "1.2 — цена", type: "text" },
      { key: "svc1_r3_name", label: "1.3 — пункт", type: "text" }, { key: "svc1_r3_price", label: "1.3 — цена", type: "text" },
      { key: "svc1_r4_name", label: "1.4 — пункт", type: "text" }, { key: "svc1_r4_price", label: "1.4 — цена", type: "text" },

      { key: "svc2_name", label: "Услуга 2 — название", type: "text" },
      { key: "svc2_r1_name", label: "2.1 — пункт", type: "text" }, { key: "svc2_r1_price", label: "2.1 — цена", type: "text" },

      { key: "svc3_name", label: "Услуга 3 — название", type: "text" },
      { key: "svc3_r1_name", label: "3.1 — пункт", type: "text" }, { key: "svc3_r1_price", label: "3.1 — цена", type: "text" },

      { key: "svc4_name", label: "Услуга 4 — название", type: "text" },
      { key: "svc4_r1_name", label: "4.1 — пункт", type: "text" }, { key: "svc4_r1_price", label: "4.1 — цена", type: "text" },

      { key: "svc5_name", label: "Услуга 5 — название", type: "text" },
      { key: "svc5_r1_name", label: "5.1 — пункт", type: "text" }, { key: "svc5_r1_price", label: "5.1 — цена", type: "text" },
    ]},
    { section: "Отзывы", fields: [
      { key: "test_h2", label: "Заголовок", type: "text" },
      { key: "test_intro", label: "Вводный текст", type: "text", wide: true },
      ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
        { key: `test_shot${n}_img`, label: `Скрин ${n} — путь`, type: "text" },
        { key: `test_shot${n}_alt`, label: `Скрин ${n} — alt`, type: "text", wide: true },
        { key: `test_shot${n}_src`, label: `Скрин ${n} — подпись (VK/TG)`, type: "text" },
      ]),
    ]},
    { section: "Контакты", fields: [
      { key: "cta_h2", label: "Заголовок CTA", type: "text" },
      { key: "cta_body", label: "Текст", type: "textarea" },
      { key: "cta_btn_primary", label: "Кнопка «Связаться»", type: "text" },
      { key: "cta_btn_secondary", label: "Кнопка «На главную»", type: "text" },
      { key: "cta_mail_href", label: "Ссылка почты (mailto:...)", type: "text" },
      { key: "cta_note", label: "Мелкая подпись под кнопками", type: "textarea" },
      { key: "contact_tg_label", label: "Подпись Telegram", type: "text" },
      { key: "contact_tg_href", label: "Ссылка Telegram", type: "text" },
      { key: "contact_tg_text", label: "Текст Telegram", type: "text" },
      { key: "contact_vk_label", label: "Подпись VK", type: "text" },
      { key: "contact_vk_href", label: "Ссылка VK", type: "text" },
      { key: "contact_vk_text", label: "Текст VK", type: "text" },
      { key: "contact_phone_label", label: "Подпись телефона", type: "text" },
      { key: "contact_phone_href", label: "Ссылка tel:", type: "text" },
      { key: "contact_phone_text", label: "Номер (отображение)", type: "text" },
      { key: "contact_note", label: "Примечание в карточке", type: "textarea" },
    ]},
    { section: "Подвал", fields: [
      { key: "footer_copy", label: "Копирайт", type: "textarea" },
      { key: "footer_top", label: "Ссылка на главную (страница политики)", type: "text" },
      { key: "footer_policy", label: "Ссылка «Политика»", type: "text" },
    ]},
  ];

  function mergeData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return { ...defaults };
      const out = { ...defaults };
      Object.keys(parsed).forEach((k) => {
        const v = parsed[k];
        if (v != null && String(v).trim() !== "") out[k] = v;
      });
      if (out.portrait_img === LEGACY_PORTRAIT_IMG || out.portrait_img === LEGACY_HERO_PORTRAIT) {
        out.portrait_img = defaults.portrait_img;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
        } catch (_) {
          /* ignore quota / private mode */
        }
      } else {
        const pi = String(out.portrait_img || "");
        if (pi.includes("ChatGPT Image") && pi.includes("15_11_42")) {
          out.portrait_img = defaults.portrait_img;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
          } catch (_) {}
        }
      }
      [
        "portrait_img",
        "og_image",
        "twitter_image",
        "work_arctic_img",
        "work_women_img",
        "work_kids_img",
        "work_family_img",
      ].forEach((k) => {
        if (out[k] && /\.(png|jpe?g)$/i.test(String(out[k]))) {
          out[k] = String(out[k]).replace(/\.(png|jpe?g)$/i, ".webp");
        }
      });
      let portfolioMigrated = false;
      ["work_arctic_img", "work_women_img", "work_kids_img", "work_family_img"].forEach((key) => {
        const v = String(out[key] || "");
        if (!v || !v.includes("/portfolio/")) {
          out[key] = defaults[key];
          portfolioMigrated = true;
        }
      });
      if (portfolioMigrated) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
        } catch (_) {}
      }
      return out;
    } catch {
      return { ...defaults };
    }
  }

  /* Разрешаем только безопасные URL-схемы и относительные пути.
     Блокирует javascript:, data:, vbscript: и т. п. */
  function safeUrl(val) {
    const v = String(val).trim();
    if (!v) return null;
    if (/^\s*(javascript|data|vbscript|file):/i.test(v)) return null;
    return v;
  }
  function safeSrc(val) {
    const v = String(val).trim();
    if (!v) return null;
    if (/^\s*(javascript|vbscript|file):/i.test(v)) return null;
    return v;
  }

  /** WebP рядом с PNG/JPG (см. scripts/optimize-images.ps1). */
  function displaySrc(val) {
    const u = safeSrc(val);
    if (!u) return null;
    if (window.SiteImg && typeof window.SiteImg.toWebp === "function") {
      return window.SiteImg.toWebp(u);
    }
    return u.replace(/\.(png|jpe?g)(\?.*)?$/i, ".webp$2");
  }

  function applyWorkCover(el, url) {
    if (!url) return;
    el.setAttribute("data-cover", url);
    el.style.backgroundImage = `url("${String(url).replace(/\\/g, "/").replace(/"/g, "%22")}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "50% 35%";
    el.style.backgroundRepeat = "no-repeat";
  }

  function getSiteBase(data) {
    const custom = String(data.site_url || "").trim().replace(/\/$/, "");
    if (/^https?:\/\//i.test(custom)) return custom;
    if (typeof window !== "undefined" && window.SiteSEO) return window.SiteSEO.siteBase();
    return "";
  }

  function applySchema(data, base) {
    const el = document.getElementById("schemaOrg");
    if (!el || !base) return;
    const name = String(data.brand_name || defaults.brand_name);
    const desc = String(data.meta_description || defaults.meta_description);
    const img = window.SiteSEO
      ? window.SiteSEO.abs(String(data.og_image || defaults.og_image), base)
      : String(data.og_image || defaults.og_image);
    const graph = [
      {
        "@type": "ProfessionalService",
        "@id": `${base}/#business`,
        name: `${name} — нейрофотосессии`,
        description: desc,
        url: base + "/",
        image: img,
        telephone: "+7-921-668-02-15",
        areaServed: {
          "@type": "City",
          name: "Заполярный",
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: "Мурманская область",
          },
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Заполярный",
          addressRegion: "Мурманская область",
          addressCountry: "RU",
        },
        sameAs: [
          String(data.contact_tg_href || defaults.contact_tg_href),
          String(data.contact_vk_href || defaults.contact_vk_href),
        ].filter((u) => /^https?:\/\//i.test(u)),
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: String(data.page_title || defaults.page_title),
        url: base + "/",
        inLanguage: "ru-RU",
        publisher: { "@id": `${base}/#business` },
      },
    ];
    el.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }

  function applySeoHead(data) {
    const base = getSiteBase(data);
    if (base) document.documentElement.setAttribute("data-site-base", base);

    if (window.SiteSEO) {
      window.SiteSEO.patchHead({
        base,
        canonical: data.canonical_href,
        ogUrl: data.og_url || data.canonical_href,
      });
    }

    applySchema(data, base);
  }

  function apply(data) {
    document.querySelectorAll("[data-cms]").forEach((el) => {
      const key = el.getAttribute("data-cms");
      if (!key || data[key] == null || String(data[key]).trim() === "") return;
      const val = String(data[key]);
      const bind = el.getAttribute("data-cms-bind");
      if (bind === "href") {
        const u = safeUrl(val);
        if (u) el.setAttribute("href", u);
      } else if (bind === "src") {
        const u = displaySrc(val);
        if (u) el.setAttribute("src", u);
      } else if (bind === "content") el.setAttribute("content", val);
      else if (bind === "aria-label") el.setAttribute("aria-label", val);
      else if (bind === "alt") el.setAttribute("alt", val);
      else el.textContent = val;
    });

    /* Вторичные ключи href/src без второго атрибута на том же элементе */
    document.querySelectorAll("[data-cms-href]").forEach((el) => {
      const key = el.getAttribute("data-cms-href");
      if (!key || !data[key]) return;
      const u = safeUrl(data[key]);
      if (u) el.setAttribute("href", u);
    });
    document.querySelectorAll("[data-cms-src]").forEach((el) => {
      const key = el.getAttribute("data-cms-src");
      if (!key || !data[key]) return;
      const raw = String(data[key]).trim();
      if (!raw) return;
      const u = displaySrc(raw);
      if (!u) return;
      if (el.tagName === "AUDIO") {
        el.setAttribute("data-lazy-src", u);
        el.removeAttribute("src");
        el.preload = "none";
        el.hidden = false;
        el.closest(".songCard")?.querySelector(".songCard__demoNote")?.classList.add("is-hidden");
      } else {
        el.setAttribute("src", u);
      }
    });

    document.querySelectorAll("[data-cms-cover]").forEach((el) => {
      const key = el.getAttribute("data-cms-cover");
      if (!key || !data[key]) return;
      const raw = String(data[key]).trim();
      if (!raw) return;
      const u = displaySrc(raw);
      if (u) applyWorkCover(el, u);
    });

    const meta = document.getElementById("metaDescription");
    if (meta && data.meta_description) meta.setAttribute("content", String(data.meta_description));

    if (data.page_title) document.title = String(data.page_title);

    applySeoHead(data);
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.SiteCMS = {
    STORAGE_KEY,
    ADMIN_PIN: "2026",
    SESSION_KEY: "zin_admin_ok",
    defaults,
    schema,
    mergeData,
    apply,
    save,
    resetToDefaults,
  };

  document.addEventListener("DOMContentLoaded", () => apply(mergeData()));
})();
