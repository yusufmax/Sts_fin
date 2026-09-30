"""Build the multilingual informational pages for Strategic Security Systems."""
from pathlib import Path
from html import escape
import json

OUT = Path(__file__).resolve().parents[1] / 'dist'
UZ = json.loads((Path(__file__).resolve().parent / 'uz-translations.json').read_text())


def t(en, ru, tag='span', cls='', extra=''):
    attrs = f' class="{cls}"' if cls else ''
    return f'<{tag}{attrs} data-ru="{escape(ru, quote=True)}" data-uz="{escape(UZ[en], quote=True)}" {extra}>{en}</{tag}>'


def link(label_en, label_ru, href, cls='text-link', extra=''):
    return f'<a class="{cls}" href="{href}" {extra}>{t(label_en, label_ru)} <span aria-hidden="true">↗</span></a>'


NAV = [
    ('About Us', 'О компании', 'about.html'),
    ('Solutions', 'Решения', 'solutions.html'),
    ('Systems Integration', 'Системная интеграция', 'systems-integration.html'),
    ('Training & Knowledge Transfer', 'Обучение и передача знаний', 'training.html'),
    ('Support & FSR Services', 'Поддержка и FSR', 'support.html'),
    ('Technology Partners', 'Технологические партнёры', 'partners.html'),
]


def shell(slug, title_en, title_ru, description, body):
    links = ''.join(f'<a href="{href}" class="{"active" if href == slug else ""}">{t(en, ru)}</a>' for en, ru, href in NAV)
    mobile = links + f'<a href="contact.html">{t("Contact", "Контакты")}</a>'
    header = f'''<header class="site-header"><nav class="nav wrap" aria-label="Main navigation"><a class="brand" href="index.html" aria-label="Strategic Security Systems home"><span class="brand-mark"><img src="assets/strategic-logo.svg" alt=""></span><span class="brand-text">STRATEGIC<br>SECURITY SYSTEMS</span></a><div class="nav-links">{links}</div><div class="nav-right"><div class="lang" aria-label="Language"><button type="button" data-lang="en" class="active" aria-pressed="true">EN</button><button type="button" data-lang="ru" aria-pressed="false">RU</button><button type="button" data-lang="uz" aria-pressed="false">UZ</button></div><a class="nav-contact" href="contact.html">{t("Contact", "Контакты")} <span aria-hidden="true">↗</span></a><button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button></div></nav></header><div class="mobile-menu" aria-hidden="true">{mobile}</div>'''
    footer = f'''<footer class="footer"><div class="wrap"><a href="index.html" class="footer-brand">STRATEGIC<br>SECURITY SYSTEMS</a><div class="footer-links"><a href="for-partners.html">{t("For Technology Partners", "Технологическим партнёрам")}</a><a href="expertise.html">{t("Careers & Expertise", "Карьера и экспертиза")}</a><a href="news.html">{t("News", "Новости")}</a><a href="contact.html">{t("Contact", "Контакты")}</a></div><small>{t("Uzbekistan · Established 2024", "Узбекистан · Основана в 2024 году")}</small><a href="mailto:info@stsec.uz">info@stsec.uz ↗</a></div></footer>'''
    title_uz = {'Technology Partners':'Texnologik hamkorlar', 'About S3':'S3 haqida', 'Local Capability':'Mahalliy salohiyat', 'Careers & Expertise':'Karyera va ekspertiza', 'News & Publications':'Yangiliklar va maqolalar', 'Contact':'Aloqa'}.get(title_en, UZ.get(title_en, title_en))
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c1813"><title>{escape(title_en)} | Strategic Security Systems</title><meta name="description" content="{escape(description, quote=True)}"><link rel="stylesheet" href="assets/styles.css"><link rel="stylesheet" href="assets/pages.css"><script defer src="assets/pages.js"></script></head><body data-title-en="{escape(title_en, quote=True)}" data-title-ru="{escape(title_ru, quote=True)}" data-title-uz="{escape(title_uz, quote=True)}">{header}<main class="subpage">{body}</main>{footer}</body></html>'''


def hero(kicker_en, kicker_ru, title_en, title_ru, lead_en, lead_ru, image=None, actions=''):
    media = f'<div class="subhero-media"><img src="assets/{image}" alt="" fetchpriority="high"></div>' if image else ''
    return f'''<section class="subhero section-pad"><div class="wrap subhero-grid"><div class="subhero-copy"><div class="kicker">{t(kicker_en,kicker_ru)}</div>{t(title_en,title_ru,'h1','subhero-title')}{t(lead_en,lead_ru,'p','subhero-lead')}{actions}</div>{media}</div></section>'''


def section_head(kicker_en,kicker_ru,title_en,title_ru,lead_en='',lead_ru=''):
    lead = t(lead_en,lead_ru,'p','section-intro') if lead_en else ''
    return f'<div class="subsection-head"><div class="kicker">{t(kicker_en,kicker_ru)}</div>{t(title_en,title_ru,"h2","subsection-title")}{lead}</div>'


def card(num,title_en,title_ru,body_en,body_ru,link_html=''):
    return f'<article class="info-card"><span class="card-no">{num}</span>{t(title_en,title_ru,"h3")}{t(body_en,body_ru,"p")}{link_html}</article>'


pages = {}

# About
body = hero('About S3','О компании','Your Local Partner for Global Technology.','Местный партнёр для международных технологий.',
    'Strategic Security Systems is an Uzbekistan-based systems integrator focused on advanced communications, observation, software and security-related technologies.',
    'Strategic Security Systems — системный интегратор из Узбекистана. Мы работаем с передовыми технологиями связи, наблюдения, программного обеспечения и безопасности.',
    'engineering-workshop.webp', link('Discuss a requirement','Обсудить задачу','contact.html?interest=requirement','primary-link'))
body += '<section class="content-section section-pad"><div class="wrap editorial-grid">'
body += section_head('Our role','Наша роль','The bridge between global technology and local needs.','Связь между международными технологиями и местными задачами.')
body += '<div class="prose-stack">' + ''.join([
    t('We work with international technology providers to identify suitable solutions, coordinate technical integration and support implementation in line with customer requirements.','Мы сотрудничаем с международными поставщиками технологий: подбираем подходящие решения, координируем техническую интеграцию и поддерживаем внедрение в соответствии с требованиями заказчика.','p'),
    t('We bring together technology providers, customers and technical expertise to help organizations access, implement and sustain advanced capabilities.','Мы объединяем поставщиков, заказчиков и техническую экспертизу, чтобы организации могли внедрять и поддерживать передовые технологии.','p'),
    t('Successful adoption involves more than equipment delivery. It also requires practical knowledge, technical support and cooperation with local specialists.','Успешное внедрение требует практических знаний, технической поддержки и сотрудничества с местными специалистами.','p'),
    t('Our long-term ambition is to contribute to sustainable technical capability in Uzbekistan through responsible international cooperation and systems integration.','Наша долгосрочная цель — содействовать устойчивому развитию технических компетенций в Узбекистане через ответственное международное сотрудничество и системную интеграцию.','p'),
]) + '</div></div></section>'
body += '<section class="fact-band"><div class="wrap fact-grid"><div><strong>2024</strong>'+t('Established in Uzbekistan','Основана в Узбекистане','span')+'</div><div><strong>S3</strong>'+t('Local systems integrator','Местный системный интегратор','span')+'</div><div><strong>01</strong>'+t('Connected approach, from requirement to support','Единый подход: от задачи до поддержки','span')+'</div></div></section>'
body += '<section class="cta-section section-pad"><div class="wrap">'+section_head('Next step','Следующий шаг','A requirement is where integration begins.','Интеграция начинается с задачи.')+link('Get in touch','Связаться','contact.html','primary-link')+'</div></section>'
pages['about.html']=shell('about.html','About S3','О компании','About Strategic Security Systems, an Uzbekistan-based systems integrator.',body)

# Solutions
solutions=[
('secure-communications','Secure Communications','Защищённая связь','Selection and integration of advanced communications technologies tailored to customer requirements.','Подбор и интеграция передовых технологий связи под требования заказчика.','We assess the communications requirement, select relevant partner technologies and coordinate their integration into the wider system.','Мы изучаем требования к связи, подбираем технологии партнёров и координируем их интеграцию в общую систему.'),
('situational-awareness','Situational Awareness','Ситуационная осведомлённость','Integration of observation, monitoring and information-gathering technologies to support operational awareness.','Интеграция технологий наблюдения, мониторинга и сбора информации для лучшего понимания обстановки.','S3 focuses on how information moves between devices, operators and decision makers.','Мы выстраиваем обмен информацией между устройствами, операторами и теми, кто принимает решения.'),
('command-control','Command & Control Integration','Интеграция систем управления','Connecting equipment, software and supporting systems into coordinated operational solutions.','Объединение оборудования, программного обеспечения и вспомогательных систем в согласованные решения.','We coordinate interfaces, workflows and implementation activities across the components selected for a project.','Мы координируем взаимодействие компонентов, рабочие процессы и технические работы в рамках проекта.'),
('technical-training','Technical Training','Техническое обучение','Facilitating technical training and knowledge exchange in cooperation with international technology partners.','Содействие техническому обучению и обмену знаниями совместно с международными технологическими партнёрами.','Training scope and availability depend on the project and agreements with relevant providers.','Объём и доступность обучения зависят от проекта и договорённостей с соответствующими поставщиками.'),
('implementation-support','Implementation Support','Поддержка внедрения','Coordinating technical activities and supporting the implementation of integrated technology solutions.','Координация технических работ и поддержка внедрения интегрированных технологических решений.','S3 helps align providers, local specialists and customer teams around the implementation plan.','S3 помогает согласовать работу поставщиков, местных специалистов и команды заказчика в ходе внедрения.'),
('lifecycle-support','Lifecycle Support','Поддержка жизненного цикла','Supporting technical assistance, maintenance coordination and long-term technology sustainment in cooperation with relevant partners.','Содействие технической помощи, координации обслуживания и долгосрочной поддержке технологий вместе с партнёрами.','Support arrangements are defined individually according to the technology, contract and available partner services.','Условия поддержки определяются индивидуально с учётом технологии, договора и услуг партнёра.'),
]
body=hero('Solutions','Решения','Integrated around the requirement.','Интеграция под конкретную задачу.',
    'Our services connect international technology, local implementation and practical support. S3 coordinates integration; manufacturers remain responsible for their own products and product-specific commitments.',
    'Мы соединяем международные технологии, местное внедрение и практическую поддержку. S3 координирует интеграцию; производители отвечают за собственную продукцию и связанные с ней обязательства.',
    'radio-detail.webp',link('Discuss a technology requirement','Обсудить технологическую задачу','contact.html?interest=requirement','primary-link'))
body+='<section class="content-section section-pad"><div class="wrap">'+section_head('Six areas of work','Шесть направлений','From selection to long-term use.','От выбора до долгосрочного применения.')+'<div class="card-grid three">'
for i,(key,en,ru,desc_en,desc_ru,more_en,more_ru) in enumerate(solutions,1): body+=card(f'0{i}',en,ru,desc_en,desc_ru,link('Learn More','Подробнее','#'+key,'card-link'))
body+='</div></div></section><section class="detail-section section-pad"><div class="wrap">'+section_head('How we work','Как мы работаем','Integration is a coordinated process.','Интеграция — согласованный процесс.')
for key,en,ru,desc_en,desc_ru,more_en,more_ru in solutions:
    body+=f'<article id="{key}" class="detail-row"><div><span class="detail-line"></span>{t(en,ru,"h3")}</div><div>{t(desc_en,desc_ru,"p")}{t(more_en,more_ru,"p","detail-muted")}{link("Discuss this area","Обсудить направление","contact.html?interest=consultation","text-link")}</div></article>'
body+='</div></section>'
pages['solutions.html']=shell('solutions.html','Solutions','Решения','S3 systems integration services across communications, observation, implementation and support.',body)

# Local Capability
body=hero('Local Capability Development','Развитие местных компетенций','Building Local Capability Through Global Technology.','Местные компетенции. Глобальные технологии.',
    'Advanced technology creates lasting value when people have the knowledge and skills to use, maintain and develop it.',
    'Передовые технологии приносят устойчивую пользу, когда люди умеют применять, поддерживать и развивать их.',
    'technical-team.webp',link('Discuss training and support','Обсудить обучение и поддержку','contact.html?interest=training','primary-link'))
body+='<section class="content-section section-pad"><div class="wrap editorial-grid">'+section_head('The approach','Наш подход','Global expertise, grounded locally.','Международная экспертиза с местной опорой.')+'<div class="prose-stack">'+t('Strategic Security Systems works to connect international technology expertise with local requirements and technical talent in Uzbekistan.','Strategic Security Systems стремится соединять международную технологическую экспертизу с местными задачами и техническими специалистами Узбекистана.','p')+t('Through cooperation with technology partners, we seek to support practical skills, technical knowledge and sustainable support capabilities. The scope of any training or localization activity depends on specific partner and project agreements.','В сотрудничестве с технологическими партнёрами мы стремимся поддерживать развитие практических навыков, технических знаний и устойчивой поддержки. Объём обучения или локализации зависит от конкретных договорённостей и проекта.','p')+'</div></div></section>'
cap=[('Knowledge & Technical Training','Знания и техническое обучение','We seek to facilitate access to technical expertise and training opportunities for local personnel.','Мы стремимся содействовать доступу местных специалистов к технической экспертизе и возможностям обучения.'),('Integration & Implementation','Интеграция и внедрение','We coordinate technical activities to bring equipment, software and supporting components into a functional solution.','Мы координируем технические работы, объединяя оборудование, программное обеспечение и другие компоненты в работающую систему.'),('Maintenance & Technical Support','Обслуживание и техническая поддержка','We support arrangements for technical assistance, maintenance and lifecycle support with relevant technology partners.','Мы содействуем организации технической помощи, обслуживания и долгосрочной поддержки вместе с соответствующими партнёрами.'),('Local Industry Cooperation','Сотрудничество с местной индустрией','We seek opportunities to involve qualified local companies and specialists in implementation and support.','Мы ищем возможности привлечения квалифицированных местных компаний и специалистов к внедрению и поддержке.')]
body+='<section class="content-section soft section-pad"><div class="wrap">'+section_head('Development directions','Направления развития','Practical capability is built together.','Практические компетенции создаются совместно.')+'<div class="card-grid two">'
for i,(en,ru,desc_en,desc_ru) in enumerate(cap,1): body+=card(f'0{i}',en,ru,desc_en,desc_ru)
body+='</div></div></section><section class="statement-section section-pad"><div class="wrap"><span class="kicker">'+t('Our long-term objective','Наша долгосрочная цель')+'</span>'+t('Turn access to international technology into practical knowledge, stronger local expertise and sustainable technical capability in Uzbekistan.','Превращать доступ к международным технологиям в практические знания, сильную местную экспертизу и устойчивые технические компетенции в Узбекистане.','p','statement')+'</div></section>'
body+='<section class="cta-section section-pad"><div class="wrap">'+section_head('People and expertise','Люди и экспертиза','Where we hope to grow.','Направления будущего развития.')+t('Explore our development directions for technical training, engineering, knowledge exchange, careers and cooperation with local specialists.','Узнайте о направлениях развития: техническое обучение, инженерная экспертиза, обмен знаниями, карьера и сотрудничество с местными специалистами.','p','section-intro')+link('Careers & Expertise','Карьера и экспертиза','expertise.html','primary-link')+'</div></section>'
pages['local-capability.html']=shell('local-capability.html','Local Capability','Местные компетенции','How S3 seeks to connect global technology expertise with local technical capability in Uzbekistan.',body)

# Partners
body=hero('Technology Partners & Solutions','Технологические партнёры и решения','Global Technology. Integrated Locally.','Международные технологии. Местная интеграция.',
    'We work with international technology providers to identify, evaluate and integrate solutions for organizations in Uzbekistan. Our role is to connect requirements with relevant technologies and coordinate their practical adoption.',
    'Мы работаем с международными поставщиками: изучаем, оцениваем и интегрируем решения для организаций Узбекистана. Наша роль — связать задачу с подходящей технологией и координировать её внедрение.',
    'radio-detail.webp',link('Partner With Us','Сотрудничать с S3','for-partners.html','primary-link'))
body+='<section class="content-section section-pad"><div class="wrap">'+section_head('Technology providers','Поставщики технологий','International expertise in the mix.','Международная экспертиза в единой системе.')+'<div class="partner-grid">'
partners=[('L3Harris','l3harris-logo.svg','Communications technology','Технологии связи','https://www.l3harris.com/'),('DTECH','dtech-logo-v2.svg','Technology portfolio','Технологический портфель','https://www.dtech.ge/en/'),('BuckEye Cam','buckeye-logo.svg','Wireless observation','Беспроводное наблюдение','https://www.buckeyecam.com/'),('N-ear','near-logo.svg','Professional audio','Профессиональная аудиосвязь','https://n-ear.com/')]
for name,img,en,ru,url in partners:
    body+=f'<article class="partner-card"><div class="partner-card-logo {"light" if name=="DTECH" else ""}"><img src="assets/{img}" alt="{name}"></div><div><span class="card-no">{t(en,ru)}</span><h3>{name}</h3>{link("Visit provider website","Сайт поставщика",url,"card-link", "target=\"_blank\" rel=\"noopener noreferrer\"")}</div></article>'
body+='</div></div></section>'
work=[('Technology identification and solution selection','Поиск технологий и выбор решений'),('Coordination with international manufacturers and providers','Координация с международными производителями и поставщиками'),('Systems integration and implementation support','Системная интеграция и поддержка внедрения'),('Technical training and knowledge exchange, where arranged','Техническое обучение и обмен знаниями при наличии договорённостей'),('Maintenance coordination and lifecycle support, where arranged','Координация обслуживания и поддержки жизненного цикла при наличии договорённостей')]
body+='<section class="content-section soft section-pad"><div class="wrap editorial-grid">'+section_head('Our role','Наша роль','The right technology. The right integration.','Подходящая технология. Грамотная интеграция.')+'<div><p class="prose-lead">'+t('Depending on project and partner arrangements, our work may include:','В зависимости от проекта и договорённостей с партнёром наша работа может включать:')+'</p><ul class="clean-list">'
for en,ru in work: body+=f'<li>{t(en,ru)}</li>'
body+='</ul><p class="boundary">'+t('S3 does not manufacture the technologies represented by international providers. Product specifications, warranties and provider-specific services remain with the relevant company and are governed by its agreements.','S3 не производит технологии международных поставщиков. Характеристики продукции, гарантии и услуги производителя определяются соответствующей компанией и её договорённостями.')+'</p></div></div></section>'
pages['partners.html']=shell('partners.html','Technology Partners','Технологические партнёры','International technology providers and S3 systems integration role in Uzbekistan.',body)

# For partners
body=hero('For Technology Partners','Технологическим партнёрам','Partner With S3 in Uzbekistan.','Сотрудничайте с S3 в Узбекистане.',
    'S3 helps international technology providers understand local requirements and coordinate the activities needed to bring suitable technologies into practical use.',
    'S3 помогает международным поставщикам понять местные требования и координировать внедрение подходящих технологий.',
    'engineering-workshop.webp',link('Explore Partnership Opportunities','Обсудить сотрудничество','contact.html?interest=partnership','primary-link'))
partner_activities=[('Understanding local customer requirements','Изучение местных требований заказчиков'),('Coordination with potential customers','Координация взаимодействия с потенциальными заказчиками'),('Technical meetings and demonstrations','Организация технических встреч и демонстраций'),('Implementation and integration support','Поддержка внедрения и интеграции'),('Technical training and knowledge exchange','Техническое обучение и обмен знаниями'),('Exploration of long-term cooperation','Изучение возможностей долгосрочного сотрудничества')]
body+='<section class="content-section section-pad"><div class="wrap">'+section_head('Areas of cooperation','Направления сотрудничества','A local counterpart for practical work.','Местный партнёр для практической работы.')+'<div class="card-grid three">'
for i,(en,ru) in enumerate(partner_activities,1): body+=card(f'0{i}',en,ru,'Scope is defined around the specific project and partner agreement.','Объём работ определяется конкретным проектом и договорённостями с партнёром.')
body+='</div></div></section><section class="statement-section section-pad"><div class="wrap"><span class="kicker">'+t('Working together','Совместная работа')+'</span>'+t('The form of cooperation is agreed individually with each technology provider. S3 does not promise exclusive access, guaranteed contracts or outcomes.','Формат сотрудничества согласовывается индивидуально с каждым технологическим поставщиком. S3 не обещает эксклюзивный доступ, гарантированные контракты или результаты.','p','statement')+'</div></section>'
pages['for-partners.html']=shell('for-partners.html','For Technology Partners','Технологическим партнёрам','Cooperation opportunities for international technology providers in Uzbekistan.',body)

# Careers & Expertise
body=hero('Careers & Expertise','Карьера и экспертиза','People make technology work.','Технологии работают благодаря людям.',
    'We see professional development and cooperation with local specialists as important directions for the future of systems integration in Uzbekistan.',
    'Мы рассматриваем профессиональное развитие и сотрудничество с местными специалистами как важные направления для будущего системной интеграции в Узбекистане.',
    'technical-team.webp',link('Discuss training and support','Обсудить обучение и поддержку','contact.html?interest=training','primary-link'))
body+='<section class="content-section section-pad"><div class="wrap">'+section_head('Development directions','Направления развития','Expertise grows through collaboration.','Экспертиза растёт через сотрудничество.', 'The directions below express our aims. They are not announcements of active programs or vacancies.','Направления ниже отражают наши цели. Они не являются объявлениями о действующих программах или вакансиях.')+'<div class="card-grid three">'
expertise=[('Technical Training Opportunities','Возможности технического обучения','Explore training opportunities with relevant technology partners when projects and agreements allow.','Изучать возможности обучения с технологическими партнёрами, когда это позволяют проекты и договорённости.'),('Engineering Expertise','Инженерная экспертиза','Strengthen practical knowledge in integration, implementation and support.','Развивать практические знания в интеграции, внедрении и поддержке.'),('Knowledge Exchange','Обмен знаниями','Create opportunities for technical dialogue between international providers and local specialists.','Создавать возможности для технического обмена между международными поставщиками и местными специалистами.'),('Career Opportunities','Карьерные возможности','Future openings, if available, will be announced with clear role descriptions.','Будущие вакансии, если появятся, будут опубликованы с чётким описанием ролей.'),('Cooperation With Local Specialists','Сотрудничество с местными специалистами','Seek qualified local expertise for implementation and technical support as projects require.','Привлекать квалифицированных местных специалистов к внедрению и поддержке по мере появления проектов.')]
for i,(en,ru,desc_en,desc_ru) in enumerate(expertise,1): body+=card(f'0{i}',en,ru,desc_en,desc_ru)
body+='</div></div></section>'
pages['expertise.html']=shell('expertise.html','Careers & Expertise','Карьера и экспертиза','Future directions for technical training, engineering and local specialist cooperation.',body)

# News
body=hero('News & Publications','Новости и публикации','Ideas behind integrated systems.','Идеи, стоящие за интегрированными системами.',
    'Technology notes and perspectives on integration. We publish company news only when there is a confirmed update to share.',
    'Материалы о технологиях и интеграции. Новости компании публикуются при наличии подтверждённой информации.',
    'engineering-workshop.webp')
body+='<section class="content-section section-pad"><div class="wrap">'+section_head('Publications','Публикации','Technology, explained.','О технологиях — понятно.')+'<div class="publication-grid">'
pubs=[('01','BuckEye Cam X80: a connected camera network','BuckEye Cam X80: сеть подключённых камер','illustrative-camera.webp','The supplied X80 materials describe wireless cameras, receivers and network software designed to work together. S3 can evaluate how such technology fits a customer requirement.','Предоставленные материалы X80 описывают беспроводные камеры, приёмники и сетевое программное обеспечение. S3 может оценить применимость технологии к задаче заказчика.'),('02','Integration is a lifecycle, not a handover','Интеграция — процесс, а не передача оборудования','radio-detail.webp','Technology adoption spans selection, interfaces, implementation, knowledge transfer and support arrangements. Each element needs a clear owner and practical plan.','Внедрение охватывает выбор решения, взаимодействие компонентов, внедрение, передачу знаний и поддержку. Для каждого этапа нужны ответственность и практический план.'),('03','Building local technical capability','Развитие местных технических компетенций','technical-team.webp','Long-term value comes from people who can use, maintain and develop systems. Cooperation with partners and local specialists can help build that capability.','Долгосрочная ценность зависит от людей, которые умеют использовать, поддерживать и развивать системы. Сотрудничество с партнёрами и местными специалистами помогает развивать эти компетенции.')]
for num,en,ru,img,desc_en,desc_ru in pubs:
    body+=f'<article class="publication"><img src="assets/{img}" alt="" loading="lazy"><div><span class="card-no">{num} / '+t('Publication','Публикация')+'</span>'+t(en,ru,'h3')+t(desc_en,desc_ru,'p')+'</div></article>'
body+='</div></div></section>'
pages['news.html']=shell('news.html','News & Publications','Новости и публикации','S3 publications on technology integration and local technical capability.',body)

# Contact
body=hero('Contact S3','Связаться с S3','Let’s discuss your requirement.','Обсудим вашу задачу.',
    'Choose the purpose of your enquiry and describe the requirement. We will review it and identify the relevant next conversation.',
    'Выберите тему обращения и кратко опишите задачу. Мы изучим запрос и определим следующий шаг.',
    None)
options=[('requirement','Discuss a Technology Requirement','Обсудить технологическую задачу'),('consultation','Request Technical Consultation','Запросить техническую консультацию'),('partnership','Explore Partnership Opportunities','Обсудить партнёрство'),('training','Discuss Training and Technical Support','Обсудить обучение и техническую поддержку')]
body+='<section class="content-section contact-page-section section-pad"><div class="wrap contact-page-grid"><div>'+section_head('Enquiry types','Темы обращения','A clear starting point.','Начнём с конкретной темы.')+'<div class="contact-options">'
for key,en,ru in options: body+=f'<a href="contact.html?interest={key}#enquiry"><span class="option-dot"></span>{t(en,ru)}<span aria-hidden="true">↗</span></a>'
body+='</div><p class="direct-email">'+t('Prefer email?','Удобнее написать напрямую?')+' <a href="mailto:info@stsec.uz">info@stsec.uz</a></p></div>'
body+='''<form id="enquiry" class="enquiry-form"><div class="form-head"><span class="card-no">01 / '''+t('ENQUIRY','ЗАПРОС')+'''</span>'''+t('Contact our team.','Напишите нашей команде.','h2')+'''</div>'''
fields=[('name','Your name','Ваше имя','text','name'),('organization','Organization','Организация','text','organization'),('email','Work email','Рабочая почта','email','email'),('phone','Phone (optional)','Телефон (необязательно)','tel','tel')]
for name,en,ru,typ,auto in fields:
    required='' if name=='phone' else 'required'
    body+=f'<label class="form-field">{t(en,ru)}<input name="{name}" type="{typ}" autocomplete="{auto}" {required}></label>'
body+='<label class="form-field">'+t('Area of interest','Интересующее направление')+f'<select name="interest" required><option value="" disabled selected data-ru="Выберите тему обращения" data-uz="{escape(UZ["Select an enquiry type"], quote=True)}">Select an enquiry type</option>'
for key,en,ru in options: body+=f'<option value="{key}" data-ru="{escape(ru, quote=True)}" data-uz="{escape(UZ[en], quote=True)}">{en}</option>'
body+='</select></label><label class="form-field">'+t('Brief description of the requirement','Краткое описание задачи')+'<textarea name="message" rows="5" minlength="10" required></textarea></label><label class="form-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><button class="primary-link" type="submit">'+t('Send enquiry','Отправить запрос')+' <span aria-hidden="true">↗</span></button><p class="form-note">'+t('Your enquiry is sent securely to our team.','Ваш запрос будет безопасно отправлен нашей команде.')+'</p><p class="form-status" role="status" aria-live="polite"></p></form></div></section>'
pages['contact.html']=shell('contact.html','Contact','Контакты','Contact S3 about a technology requirement, consultation, partnership, training or technical support.',body)


def t3(en, ru, uz, tag='p', cls=''):
    return f'<{tag} class="{cls}" data-ru="{escape(ru, quote=True)}" data-uz="{escape(uz, quote=True)}">{escape(en)}</{tag}>'


def new_page(slug, title, title_ru, title_uz, lead, lead_ru, lead_uz, image, sections):
    body = '<section class="subhero section-pad"><div class="wrap subhero-grid"><div class="subhero-copy"><div class="kicker">STRATEGIC SECURITY SYSTEMS / S3</div>'
    body += t3(title, title_ru, title_uz, 'h1', 'subhero-title')
    body += t3(lead, lead_ru, lead_uz, 'p', 'subhero-lead')
    body += '</div><div class="subhero-media"><img src="assets/' + image + '" alt="" fetchpriority="high"></div></div></section>'
    for number, section in enumerate(sections, 1):
        heading, heading_ru, heading_uz, copy, copy_ru, copy_uz = section
        body += '<section class="content-section section-pad"><div class="wrap editorial-grid"><div class="subsection-head"><span class="kicker">' + f'{number:02d} / S3' + '</span>'
        body += t3(heading, heading_ru, heading_uz, 'h2', 'subsection-title') + '</div><div class="prose-stack">'
        body += t3(copy, copy_ru, copy_uz) + '</div></div></section>'
    body += '<section class="statement-section section-pad"><div class="wrap">' + t3('Let us discuss the operational requirement.', 'Обсудим вашу практическую задачу.', 'Amaliy ehtiyojingizni muhokama qilaylik.', 'h2', 'statement') + '<a class="primary-link" href="contact.html?interest=requirement">' + t('Contact S3', 'Связаться с S3') + ' ↗</a></div></section>'
    html = shell(slug, title, title_ru, lead, body)
    return html.replace('data-title-uz="' + escape(title, quote=True) + '"', 'data-title-uz="' + escape(title_uz, quote=True) + '"')


pages['systems-integration.html'] = new_page('systems-integration.html', 'Systems Integration', 'Системная интеграция', 'Tizim integratsiyasi',
    'Connecting equipment, software, networks and people into solutions designed around operational requirements.',
    'Объединяем оборудование, программное обеспечение, сети и людей в решения, отвечающие практическим задачам.',
    'Uskunalar, dasturiy ta’minot, tarmoqlar va mutaxassislarni amaliy talablarga mos yechimlarga birlashtiramiz.', 'engineering-workshop.webp', [
    ('Requirements & Architecture', 'Требования и архитектура', 'Talablar va arxitektura',
     'We begin with the customer’s objectives, existing infrastructure and technical constraints. S3 then coordinates solution architecture with relevant technology providers.',
     'Начинаем с целей заказчика, существующей инфраструктуры и технических ограничений. Затем S3 совместно с поставщиками координирует архитектуру решения.',
     'Buyurtmachi maqsadlari, mavjud infratuzilma va texnik cheklovlardan boshlaymiz. S3 tegishli texnologiya yetkazib beruvchilari bilan yechim arxitekturasini muvofiqlashtiradi.'),
    ('Integration & Implementation', 'Интеграция и внедрение', 'Integratsiya va joriy etish',
     'Our work brings together selected components and, where applicable, connects them with existing systems. We coordinate configuration, testing and implementation support.',
     'Объединяем выбранные компоненты и, при необходимости, подключаем их к существующим системам. Координируем настройку, испытания и поддержку внедрения.',
     'Tanlangan qismlarni birlashtiramiz va kerak bo‘lsa mavjud tizimlarga ulaymiz. Sozlash, sinov va joriy etish jarayonini muvofiqlashtiramiz.'),
    ('Lifecycle Thinking', 'Подход на весь жизненный цикл', 'Butun hayotiy siklga yondashuv',
     'An integrated system remains useful when users understand it and support is available. Training, documentation and partner-backed maintenance arrangements are planned around each engagement.',
     'Система приносит пользу, когда пользователи понимают её работу и доступна поддержка. Обучение, документация и поддержка партнёров определяются для каждого проекта.',
     'Tizim foydali bo‘lishi uchun foydalanuvchilar uni tushunishi va yordam mavjud bo‘lishi kerak. O‘qitish, hujjatlar va hamkorlar yordami har bir loyiha uchun belgilanadi.')])

pages['training.html'] = new_page('training.html', 'Training & Knowledge Transfer', 'Обучение и передача знаний', 'O‘qitish va bilim almashish',
    'Practical training helps teams operate, administer and maintain the systems they use.',
    'Практическое обучение помогает командам эксплуатировать, администрировать и поддерживать свои системы.',
    'Amaliy o‘qitish jamoalarga foydalanadigan tizimlarini boshqarish va ularga xizmat ko‘rsatishda yordam beradi.', 'technical-team.webp', [
    ('Operator Training', 'Обучение операторов', 'Operatorlarni o‘qitish',
     'S3 provides training focused on day-to-day use, operating procedures and the capabilities of the delivered solution.',
     'S3 проводит обучение повседневному использованию, рабочим процедурам и возможностям внедрённого решения.',
     'S3 joriy etilgan yechimdan kundalik foydalanish, ish tartibi va imkoniyatlari bo‘yicha o‘qitadi.'),
    ('Technical & Maintenance Training', 'Техническое обучение', 'Texnik va xizmat ko‘rsatish bo‘yicha o‘qitish',
     'Technical sessions address administration, basic diagnostics, maintenance practices and coordination with the relevant technology partner.',
     'Технические занятия охватывают администрирование, базовую диагностику, обслуживание и взаимодействие с соответствующим технологическим партнёром.',
     'Texnik mashg‘ulotlar boshqaruv, dastlabki diagnostika, xizmat ko‘rsatish va tegishli texnologiya hamkori bilan hamkorlikni qamrab oladi.'),
    ('Train-the-Trainer', 'Подготовка инструкторов', 'Trenerlarni tayyorlash',
     'Train-the-Trainer support helps selected customer personnel share system knowledge within their own organization. Scope and materials are agreed for each engagement.',
     'Подготовка инструкторов помогает специалистам заказчика передавать знания внутри своей организации. Объём и материалы согласовываются для каждого проекта.',
     'Trenerlarni tayyorlash buyurtmachi mutaxassislariga bilimni o‘z tashkilotida ulashishga yordam beradi. Hajm va materiallar har bir loyiha uchun kelishiladi.')])

pages['support.html'] = new_page('support.html', 'Support & FSR Services', 'Поддержка и услуги FSR', 'Yordam va FSR xizmatlari',
    'Technical assistance and local expertise help sustain integrated systems after implementation.',
    'Техническая помощь и местная экспертиза поддерживают интегрированные системы после внедрения.',
    'Texnik yordam va mahalliy tajriba integratsiyalashgan tizimlarni joriy etishdan keyin qo‘llab-quvvatlaydi.', 'radio-detail.webp', [
    ('Technical Assistance', 'Техническая помощь', 'Texnik yordam',
     'S3 supports troubleshooting, issue coordination and technical questions relating to solutions it delivers, together with relevant technology partners.',
     'S3 помогает с диагностикой, координацией вопросов и техническими консультациями по поставленным решениям совместно с соответствующими партнёрами.',
     'S3 tegishli hamkorlar bilan birga yetkazib berilgan yechimlar bo‘yicha nosozliklarni aniqlash, masalalarni muvofiqlashtirish va texnik savollarga yordam beradi.'),
    ('Field Service Representatives', 'Выездные технические специалисты', 'Joylardagi texnik mutaxassislar',
     'Where agreed, our Field Service Representative model gives customers access to specialists who provide local technical assistance, training support and knowledge exchange.',
     'По договорённости модель FSR предоставляет заказчикам доступ к специалистам для местной технической помощи, поддержки обучения и обмена знаниями.',
     'Kelishuvga ko‘ra, FSR modeli buyurtmachilarga mahalliy texnik yordam, o‘qitish va bilim almashish uchun mutaxassislardan foydalanish imkonini beradi.'),
    ('Lifecycle Coordination', 'Поддержка жизненного цикла', 'Hayotiy siklni muvofiqlashtirish',
     'Maintenance and escalation arrangements depend on the technology and partner agreements. S3 coordinates the local interface and supports continuity of service.',
     'Обслуживание и порядок эскалации зависят от технологии и договорённостей с партнёрами. S3 координирует местное взаимодействие и непрерывность поддержки.',
     'Texnik xizmat va murojaat tartibi texnologiya hamda hamkorlik shartlariga bog‘liq. S3 mahalliy aloqani va xizmat davomiyligini muvofiqlashtiradi.')])

for name,content in pages.items():
    (OUT/name).write_text(content)
print('Generated',len(pages),'pages')
