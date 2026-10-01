from . import X, BRAND_STATEMENT, CONTACT_S3

PAGE = {
    'slug': 'about.html',
    'title': X('About Us', 'О компании', 'Kompaniya haqida'),
    'image': 'engineering-workshop.webp',
    'hero': {
        'buttons': [(CONTACT_S3, 'contact.html', 'primary-link')],
        'title': X('Who We Are', 'Кто мы', 'Biz kimmiz'),
        'lead': X('Strategic Security Systems (S3) is an Uzbekistan-based systems integrator established in 2024 to provide advanced technology solutions to government and defense customers.',
                  'Strategic Security Systems (S3) — системный интегратор из Узбекистана, основанный в 2024 году для предоставления передовых технологических решений государственным и оборонным заказчикам.',
                  'Strategic Security Systems (S3) — davlat va mudofaa sohasidagi buyurtmachilarga ilg‘or texnologik yechimlarni taqdim etish maqsadida 2024-yilda tashkil etilgan O‘zbekistondagi tizim integratori.'),
    },
    'blocks': [
        ('intro', {'items': [
            ('p', X('We work in cooperation with leading international technology partners to bring combat-proven technologies to our customers and integrate them into complete solutions designed around real operational requirements.',
                    'Мы сотрудничаем с ведущими международными технологическими партнёрами, чтобы предоставлять заказчикам технологии, проверенные в боевых условиях, и интегрировать их в комплексные решения, построенные вокруг реальных операционных требований.',
                    'Biz yetakchi xalqaro texnologik hamkorlar bilan hamkorlikda jangovar sharoitda sinovdan o‘tgan texnologiyalarni buyurtmachilarimizga yetkazamiz va ularni real operatsion talablar asosida ishlab chiqilgan yaxlit yechimlarga integratsiya qilamiz.')),
            ('p', X('Our role goes beyond supplying equipment. We support our customers in identifying their requirements, selecting appropriate technologies, integrating new capabilities with existing systems and infrastructure, deploying solutions, developing personnel, and maintaining effective operation throughout the solution lifecycle.',
                    'Наша роль не ограничивается поставкой оборудования. Мы помогаем заказчикам определять требования, выбирать подходящие технологии, интегрировать новые возможности с существующими системами и инфраструктурой, развёртывать решения, развивать персонал и поддерживать эффективную эксплуатацию на протяжении всего жизненного цикла решения.',
                    'Bizning vazifamiz uskunalarni yetkazib berish bilan cheklanmaydi. Biz buyurtmachilarga talablarni aniqlash, mos texnologiyalarni tanlash, yangi imkoniyatlarni mavjud tizimlar va infratuzilma bilan integratsiya qilish, yechimlarni joriy etish, xodimlarni tayyorlash hamda yechimning butun hayotiy sikli davomida samarali ishlashini ta’minlashda yordam beramiz.')),
            ('p', X('Our objective is simple: to transform advanced technology into sustainable operational capability.',
                           'Наша цель проста: превращать передовые технологии в устойчивые операционные возможности.',
                           'Maqsadimiz oddiy: ilg‘or texnologiyalarni barqaror operatsion imkoniyatlarga aylantirish.')),
        ]}),
        ('facts', {'facts': [
            ('2024', X('Established in Uzbekistan', 'Основана в Узбекистане', 'O‘zbekistonda tashkil etilgan')),
            ('S3', X('Uzbekistan-based systems integrator', 'Системный интегратор из Узбекистана', 'O‘zbekistondagi tizim integratori')),
            ('01', X('End-to-end approach, from requirements to lifecycle support', 'Сквозной подход: от требований до поддержки жизненного цикла', 'Yaxlit yondashuv: talablardan hayotiy sikl davomida qo‘llab-quvvatlashgacha')),
        ]}),
        ('prose', {'title': X('What We Do', 'Чем мы занимаемся', 'Biz nima qilamiz'), 'soft': True, 'items': [
            ('p', X('S3 specializes in the integration of secure, mission-critical technologies for demanding operational environments.',
                    'S3 специализируется на интеграции защищённых технологий для критически важных задач в сложных операционных условиях.',
                    'S3 murakkab operatsion sharoitlar uchun himoyalangan, o‘ta muhim texnologiyalarni integratsiya qilishga ixtisoslashgan.')),
            ('p', X('Our core expertise includes secure tactical communications, Command and Control (C2), Fire Support and Targeting Systems, and tactical networking, supported by a broader portfolio of technologies including SATCOM, ISR, UAV integration, electronic warfare, cybersecurity, command-post infrastructure, and deployable communication systems.',
                    'Наша ключевая экспертиза — защищённая тактическая связь, командование и управление (C2), системы огневой поддержки и целеуказания, а также тактические сети. Её дополняет более широкий портфель технологий: спутниковая связь (SATCOM), ISR, интеграция БПЛА, радиоэлектронная борьба, кибербезопасность, инфраструктура командных пунктов и развёртываемые системы связи.',
                    'Asosiy ekspertizamiz — himoyalangan taktik aloqa, qo‘mondonlik va boshqaruv (C2), o‘t bilan qo‘llab-quvvatlash va nishon ko‘rsatish tizimlari hamda taktik tarmoqlar. Uni kengroq texnologiyalar portfeli to‘ldiradi: sun’iy yo‘ldosh aloqasi (SATCOM), ISR, uchuvchisiz uchish apparatlarini (UAV) integratsiya qilish, radioelektron kurash, kiberxavfsizlik, qo‘mondonlik punktlari infratuzilmasi va joylashtiriladigan aloqa tizimlari.')),
            ('p', X('Rather than approaching these technologies as isolated products, we focus on how they can work together as part of an integrated operational environment.',
                    'Мы рассматриваем эти технологии не как отдельные продукты, а как элементы единой интегрированной операционной среды, которые должны работать вместе.',
                    'Biz bu texnologiyalarga alohida mahsulotlar sifatida emas, balki yagona integratsiyalashgan operatsion muhitning birgalikda ishlaydigan qismlari sifatida yondashamiz.')),
            ('p', X('This allows S3 to develop solutions that address specific customer requirements while supporting interoperability, security, reliability, scalability, and future development.',
                    'Это позволяет S3 создавать решения под конкретные требования заказчика, обеспечивая совместимость, безопасность, надёжность, масштабируемость и возможность дальнейшего развития.',
                    'Bu S3 ga buyurtmachining aniq talablariga javob beradigan, shu bilan birga o‘zaro moslik, xavfsizlik, ishonchlilik, kengaytiriluvchanlik va kelgusidagi rivojlanishni ta’minlaydigan yechimlar yaratish imkonini beradi.')),
        ]}),
        ('cards', {
            'title': X('Our Approach', 'Наш подход', 'Bizning yondashuvimiz'),
            'subtitle': X('Delivering Capabilities, Not Simply Equipment', 'Мы создаём возможности, а не просто поставляем оборудование', 'Shunchaki uskuna emas — imkoniyat yetkazib beramiz'),
            'intro': [
                ('p', X('We believe that successful technology implementation requires much more than the delivery of hardware and software.',
                        'Мы убеждены, что успешное внедрение технологий требует гораздо большего, чем поставка аппаратного и программного обеспечения.',
                        'Texnologiyalarni muvaffaqiyatli joriy etish uchun apparat va dasturiy ta’minotni yetkazib berishning o‘zi yetarli emas, deb hisoblaymiz.')),
                ('p', X('A solution must be properly designed, integrated, configured, deployed, understood by its users, and supported throughout its operational lifecycle.',
                        'Решение должно быть грамотно спроектировано, интегрировано, настроено и развёрнуто, понятно пользователям и поддерживаться на протяжении всего жизненного цикла эксплуатации.',
                        'Yechim to‘g‘ri loyihalanishi, integratsiya qilinishi, sozlanishi va joriy etilishi, foydalanuvchilarga tushunarli bo‘lishi hamda butun foydalanish davri mobaynida qo‘llab-quvvatlanishi lozim.')),
                ('p', X('For this reason, S3 follows an end-to-end approach that brings together:',
                        'Поэтому S3 придерживается сквозного подхода, который объединяет:',
                        'Shu sababli S3 quyidagilarni birlashtiradigan yaxlit yondashuvga amal qiladi:')),
            ],
            'cards': [
                (X('Requirements Analysis', 'Анализ требований', 'Talablarni tahlil qilish'), [
                    X('Understanding operational objectives, existing capabilities, technical constraints, and future requirements.',
                      'Понимание операционных целей, существующих возможностей, технических ограничений и будущих потребностей.',
                      'Operatsion maqsadlar, mavjud imkoniyatlar, texnik cheklovlar va kelajakdagi talablarni tushunish.')]),
                (X('Solution Design', 'Проектирование решения', 'Yechimni loyihalash'), [
                    X('Identifying suitable technologies and developing an integrated solution architecture.',
                      'Подбор подходящих технологий и разработка архитектуры интегрированного решения.',
                      'Mos texnologiyalarni aniqlash va integratsiyalashgan yechim arxitekturasini ishlab chiqish.')]),
                (X('Systems Integration', 'Системная интеграция', 'Tizim integratsiyasi'), [
                    X('Bringing together new and existing technologies, networks, applications, platforms, and infrastructure.',
                      'Объединение новых и существующих технологий, сетей, приложений, платформ и инфраструктуры.',
                      'Yangi va mavjud texnologiyalar, tarmoqlar, ilovalar, platformalar va infratuzilmani birlashtirish.')]),
                (X('Deployment & Implementation', 'Развёртывание и внедрение', 'Joriy etish va tatbiq qilish'), [
                    X('Supporting installation, configuration, testing, commissioning, and introduction into operation.',
                      'Поддержка установки, настройки, испытаний, пусконаладки и ввода в эксплуатацию.',
                      'O‘rnatish, sozlash, sinovdan o‘tkazish, ishga tushirish va foydalanishga topshirishda ko‘maklashish.')]),
                (X('Training & Knowledge Transfer', 'Обучение и передача знаний', 'O‘qitish va bilim uzatish'), [
                    X('Developing the knowledge and practical skills required to operate, administer, maintain, and support deployed systems.',
                      'Развитие знаний и практических навыков, необходимых для эксплуатации, администрирования, обслуживания и поддержки развёрнутых систем.',
                      'Joriy etilgan tizimlardan foydalanish, ularni boshqarish, ularga xizmat ko‘rsatish va qo‘llab-quvvatlash uchun zarur bilim va amaliy ko‘nikmalarni rivojlantirish.')]),
                (X('Lifecycle Support', 'Поддержка жизненного цикла', 'Hayotiy sikl davomida qo‘llab-quvvatlash'), [
                    X('Providing ongoing technical assistance, troubleshooting, knowledge sharing, and access to local and international expertise.',
                      'Постоянная техническая помощь, устранение неисправностей, обмен знаниями и доступ к местной и международной экспертизе.',
                      'Doimiy texnik yordam, nosozliklarni bartaraf etish, bilim almashish hamda mahalliy va xalqaro ekspertizadan foydalanish imkoniyati.')]),
            ],
            'outro': [
                ('p', X('This approach helps ensure that the technology we provide becomes a usable and sustainable operational capability.',
                        'Такой подход помогает сделать так, чтобы предоставляемые нами технологии стали применимыми и устойчивыми операционными возможностями.',
                        'Bu yondashuv biz taqdim etayotgan texnologiyalarning amalda qo‘llaniladigan va barqaror operatsion imkoniyatga aylanishiga yordam beradi.')),
            ],
        }),
        ('prose', {'title': X('Local Presence. International Expertise.', 'Местное присутствие. Международная экспертиза.', 'Mahalliy vakillik. Xalqaro ekspertiza.'), 'soft': True, 'items': [
            ('p', X('Being based in Uzbekistan allows S3 to remain close to our customers and better understand their operational environment, requirements, and support needs.',
                    'Расположение в Узбекистане позволяет S3 оставаться рядом с заказчиками и лучше понимать их операционную среду, требования и потребности в поддержке.',
                    'O‘zbekistonda joylashganimiz S3 ga buyurtmachilarga yaqin bo‘lish va ularning operatsion muhiti, talablari hamda qo‘llab-quvvatlashga bo‘lgan ehtiyojlarini yaxshiroq tushunish imkonini beradi.')),
            ('p', X('At the same time, our cooperation with international technology manufacturers, integration partners, and experienced specialists provides access to global expertise and advanced technologies.',
                    'В то же время сотрудничество с международными производителями технологий, партнёрами по интеграции и опытными специалистами открывает доступ к мировой экспертизе и передовым технологиям.',
                    'Shu bilan birga, xalqaro texnologiya ishlab chiqaruvchilari, integratsiya bo‘yicha hamkorlar va tajribali mutaxassislar bilan hamkorligimiz global ekspertiza va ilg‘or texnologiyalardan foydalanish imkonini beradi.')),
            ('p', X('This combination of local presence and international expertise enables S3 to act as a bridge between technology manufacturers and end users — helping translate customer requirements into technical solutions and advanced technologies into operational capabilities.',
                    'Сочетание местного присутствия и международной экспертизы позволяет S3 выступать связующим звеном между производителями технологий и конечными пользователями — помогая превращать требования заказчиков в технические решения, а передовые технологии — в операционные возможности.',
                    'Mahalliy vakillik va xalqaro ekspertizaning uyg‘unligi S3 ga texnologiya ishlab chiqaruvchilari va oxirgi foydalanuvchilar o‘rtasida ko‘prik vazifasini bajarish imkonini beradi — buyurtmachi talablarini texnik yechimlarga, ilg‘or texnologiyalarni esa operatsion imkoniyatlarga aylantirishga yordam beradi.')),
            ('p', X('Where required, this support can include locally based Field Service Representatives (FSRs) who work alongside customer personnel, providing technical assistance, troubleshooting, training support, and continuous knowledge transfer.',
                    'При необходимости такая поддержка может включать работу местных выездных технических специалистов (FSR): они работают вместе с персоналом заказчика, оказывают техническую помощь, устраняют неисправности, поддерживают обучение и обеспечивают непрерывную передачу знаний.',
                    'Zarur hollarda bu yordam buyurtmachi xodimlari bilan birga ishlaydigan, texnik yordam ko‘rsatadigan, nosozliklarni bartaraf etadigan, o‘qitishni qo‘llab-quvvatlaydigan va bilimlarni uzluksiz uzatadigan mahalliy texnik vakillarni (FSR) o‘z ichiga olishi mumkin.')),
        ]}),
        ('prose', {'title': X('Building Local Capability', 'Развитие местных компетенций', 'Mahalliy salohiyatni rivojlantirish'), 'items': [
            ('p', X('One of our priorities is to help customers develop the knowledge and expertise required to operate and support their systems independently and effectively.',
                    'Один из наших приоритетов — помогать заказчикам развивать знания и экспертизу, необходимые для самостоятельной и эффективной эксплуатации и поддержки своих систем.',
                    'Ustuvor vazifalarimizdan biri — buyurtmachilarga o‘z tizimlaridan mustaqil va samarali foydalanish hamda ularni qo‘llab-quvvatlash uchun zarur bilim va tajribani rivojlantirishda yordam berish.')),
            ('p', X('For this reason, training and knowledge transfer are integral to our approach.',
                    'Поэтому обучение и передача знаний — неотъемлемая часть нашего подхода.',
                    'Shu sababli o‘qitish va bilim uzatish yondashuvimizning ajralmas qismidir.')),
            ('p', X('We support the development of operators, system administrators, technical and maintenance personnel, and customer instructors through structured training and Train-the-Trainer programs.',
                    'Мы содействуем подготовке операторов, системных администраторов, технического и обслуживающего персонала, а также инструкторов заказчика с помощью структурированного обучения и программ подготовки инструкторов (Train-the-Trainer).',
                    'Biz tizimli o‘qitish va trenerlarni tayyorlash (Train-the-Trainer) dasturlari orqali operatorlar, tizim administratorlari, texnik va xizmat ko‘rsatuvchi xodimlar hamda buyurtmachi instruktorlarini tayyorlashga ko‘maklashamiz.')),
            ('p', X('By combining technology with knowledge transfer and ongoing support, we aim to create sustainable capabilities that remain effective long after initial deployment.',
                    'Сочетая технологии с передачей знаний и постоянной поддержкой, мы стремимся создавать устойчивые возможности, которые остаются эффективными ещё долго после первоначального развёртывания.',
                    'Texnologiyalarni bilim uzatish va doimiy qo‘llab-quvvatlash bilan uyg‘unlashtirib, dastlabki joriy etishdan keyin ham uzoq vaqt samarali bo‘lib qoladigan barqaror imkoniyatlar yaratishga intilamiz.')),
        ]}),
        ('cards', {'columns': 'two', 'soft': True, 'cards': [
            (X('Our Mission', 'Наша миссия', 'Bizning missiyamiz'), [
                X('Our mission is to provide government and defense customers with secure, reliable, and integrated mission-critical solutions by combining combat-proven technologies, professional systems integration, knowledge transfer, and responsive local support.',
                  'Наша миссия — предоставлять государственным и оборонным заказчикам защищённые, надёжные и интегрированные решения для критически важных задач, объединяя проверенные в боевых условиях технологии, профессиональную системную интеграцию, передачу знаний и оперативную местную поддержку.',
                  'Bizning missiyamiz — jangovar sharoitda sinovdan o‘tgan texnologiyalar, professional tizim integratsiyasi, bilim uzatish va tezkor mahalliy qo‘llab-quvvatlashni birlashtirib, davlat va mudofaa sohasidagi buyurtmachilarga himoyalangan, ishonchli va integratsiyalashgan yechimlarni taqdim etish.')]),
            (X('Our Vision', 'Наше видение', 'Bizning istiqbolimiz'), [
                X('Our vision is to become a trusted systems integration partner in Uzbekistan, recognized for technical expertise, reliability, strong international partnerships, and the ability to transform advanced technologies into effective operational capabilities.',
                  'Наше видение — стать надёжным партнёром по системной интеграции в Узбекистане, известным своей технической экспертизой, надёжностью, прочными международными партнёрствами и способностью превращать передовые технологии в эффективные операционные возможности.',
                  'Istiqboldagi maqsadimiz — texnik ekspertizasi, ishonchliligi, mustahkam xalqaro hamkorliklari va ilg‘or texnologiyalarni samarali operatsion imkoniyatlarga aylantira olishi bilan tan olingan, O‘zbekistondagi ishonchli tizim integratsiyasi hamkoriga aylanish.'),
                X('As S3 grows, we aim to continuously expand our expertise, technology partnerships, and local capabilities while maintaining a long-term commitment to the customers and organizations we support.',
                  'По мере роста S3 мы стремимся постоянно расширять нашу экспертизу, технологические партнёрства и местные возможности, сохраняя долгосрочную приверженность заказчикам и организациям, которых мы поддерживаем.',
                  'S3 rivojlangani sari biz ekspertizamiz, texnologik hamkorliklarimiz va mahalliy imkoniyatlarimizni doimiy kengaytirib borishga, shu bilan birga qo‘llab-quvvatlayotgan buyurtmachilar va tashkilotlarga uzoq muddatli sodiqligimizni saqlashga intilamiz.')]),
        ]}),
        ('cards', {'title': X('Our Principles', 'Наши принципы', 'Bizning tamoyillarimiz'), 'cards': [
            (X('Customer Focus', 'Ориентация на заказчика', 'Buyurtmachiga yo‘naltirilganlik'), [
                X('We begin with the customer\'s operational requirements and build solutions around their actual needs.',
                  'Мы начинаем с операционных требований заказчика и строим решения вокруг его реальных потребностей.',
                  'Biz buyurtmachining operatsion talablaridan boshlaymiz va yechimlarni uning haqiqiy ehtiyojlari asosida quramiz.')]),
            (X('Integration', 'Интеграция', 'Integratsiya'), [
                X('We focus on complete capabilities and interoperability rather than isolated products.',
                  'Мы делаем ставку на комплексные возможности и совместимость, а не на отдельные продукты.',
                  'Biz alohida mahsulotlarga emas, balki yaxlit imkoniyatlar va o‘zaro moslikka e’tibor qaratamiz.')]),
            (X('Professionalism', 'Профессионализм', 'Professionallik'), [
                X('We apply technical expertise, operational understanding, and disciplined project execution throughout every engagement.',
                  'В каждом проекте мы применяем техническую экспертизу, понимание операционной специфики и дисциплинированный подход к реализации.',
                  'Har bir loyihada texnik ekspertiza, operatsion jarayonlarni tushunish va intizomli ijroni qo‘llaymiz.')]),
            (X('Reliability', 'Надёжность', 'Ishonchlilik'), [
                X('Mission-critical environments require solutions and support that customers can depend on.',
                  'Критически важные задачи требуют решений и поддержки, на которые заказчик может положиться.',
                  'O‘ta muhim vazifalar buyurtmachi ishonishi mumkin bo‘lgan yechimlar va qo‘llab-quvvatlashni talab qiladi.')]),
            (X('Knowledge Transfer', 'Передача знаний', 'Bilim uzatish'), [
                X('We believe sustainable capability requires developing customer personnel alongside technology.',
                  'Мы убеждены, что устойчивые возможности требуют развития персонала заказчика наряду с технологиями.',
                  'Barqaror imkoniyat texnologiyalar bilan bir qatorda buyurtmachi xodimlarini ham rivojlantirishni talab qiladi, deb hisoblaymiz.')]),
            (X('Long-Term Partnership', 'Долгосрочное партнёрство', 'Uzoq muddatli hamkorlik'), [
                X('Our involvement does not end with delivery. We aim to support our customers throughout the operational lifecycle of the solutions we provide.',
                  'Наше участие не заканчивается поставкой. Мы стремимся поддерживать заказчиков на протяжении всего жизненного цикла эксплуатации предоставленных нами решений.',
                  'Ishtirokimiz yetkazib berish bilan tugamaydi. Biz taqdim etgan yechimlarning butun foydalanish davri mobaynida buyurtmachilarimizni qo‘llab-quvvatlashga intilamiz.')]),
            (X('Confidentiality', 'Конфиденциальность', 'Maxfiylik'), [
                X('We recognize the sensitive nature of the environments in which our customers operate and treat customer information and requirements with appropriate care and discretion.',
                  'Мы понимаем деликатный характер среды, в которой работают наши заказчики, и обращаемся с их информацией и требованиями с должной осторожностью и сдержанностью.',
                  'Buyurtmachilarimiz faoliyat yuritadigan muhitning nozik xususiyatini tushunamiz va ularning ma’lumotlari hamda talablariga tegishli ehtiyotkorlik va maxfiylik bilan munosabatda bo‘lamiz.')]),
        ]}),
        ('closing', {'statement': BRAND_STATEMENT, 'buttons': [(CONTACT_S3, 'contact.html', 'primary-link')], 'lines': [
            X('From requirements to integration.', 'От требований — к интеграции.', 'Talablardan — integratsiyagacha.'),
            X('From deployment to knowledge transfer.', 'От развёртывания — к передаче знаний.', 'Joriy etishdan — bilim uzatishgacha.'),
            X('From technology to operational capability.', 'От технологий — к операционным возможностям.', 'Texnologiyadan — operatsion imkoniyatgacha.'),
        ]}),
    ],
}
