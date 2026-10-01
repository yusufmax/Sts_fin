"""Build the multilingual informational pages for Strategic Security Systems."""
from pathlib import Path
from html import escape
import json
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from site_content import about, solutions, systems_integration, training, support, partners

OUT = Path(__file__).resolve().parents[1] / 'dist'
UZ = json.loads((Path(__file__).resolve().parent / 'uz-translations.json').read_text())
CONTENT_PAGES = [about, solutions, systems_integration, training, support, partners]


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


def shell(slug, title_en, title_ru, description, body, title_uz=None):
    links = ''.join(f'<a href="{href}" class="{"active" if href == slug else ""}">{t(en, ru)}</a>' for en, ru, href in NAV)
    mobile = links + f'<a href="contact.html">{t("Contact", "Контакты")}</a>'
    header = f'''<header class="site-header"><nav class="nav wrap" aria-label="Main navigation"><a class="brand" href="index.html" aria-label="Strategic Security Systems home"><span class="brand-mark"><img src="assets/strategic-logo.svg" alt=""></span><span class="brand-text">STRATEGIC<br>SECURITY SYSTEMS</span></a><div class="nav-links">{links}</div><div class="nav-right"><div class="lang" aria-label="Language"><button type="button" data-lang="en" class="active" aria-pressed="true">EN</button><button type="button" data-lang="ru" aria-pressed="false">RU</button><button type="button" data-lang="uz" aria-pressed="false">UZ</button></div><a class="nav-contact" href="contact.html">{t("Contact", "Контакты")} <span aria-hidden="true">↗</span></a><button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button></div></nav></header><div class="mobile-menu" aria-hidden="true">{mobile}</div>'''
    footer = f'''<footer class="footer"><div class="wrap"><a href="index.html" class="footer-brand">STRATEGIC<br>SECURITY SYSTEMS</a><div class="footer-links"><a href="for-partners.html">{t("For Technology Partners", "Технологическим партнёрам")}</a><a href="expertise.html">{t("Careers & Expertise", "Карьера и экспертиза")}</a><a href="news.html">{t("News", "Новости")}</a><a href="contact.html">{t("Contact", "Контакты")}</a></div><small>{t("Uzbekistan · Established 2024", "Узбекистан · Основана в 2024 году")}</small><a href="mailto:info@stsec.uz">info@stsec.uz ↗</a></div></footer>'''
    title_uz = title_uz or {'Technology Partners':'Texnologik hamkorlar', 'About S3':'S3 haqida', 'Local Capability':'Mahalliy salohiyat', 'Careers & Expertise':'Karyera va ekspertiza', 'News & Publications':'Yangiliklar va maqolalar', 'Contact':'Aloqa'}.get(title_en, UZ.get(title_en, title_en))
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c1813"><title>{escape(title_en)} | Strategic Security Systems</title><meta name="description" content="{escape(description, quote=True)}"><link rel="stylesheet" href="assets/styles.css?v=19"><link rel="stylesheet" href="assets/pages.css?v=19"><script defer src="assets/pages.js?v=19"></script></head><body data-title-en="{escape(title_en, quote=True)}" data-title-ru="{escape(title_ru, quote=True)}" data-title-uz="{escape(title_uz, quote=True)}">{header}<main class="subpage">{body}</main>{footer}</body></html>'''


def hero(kicker_en, kicker_ru, title_en, title_ru, lead_en, lead_ru, image=None, actions=''):
    media = f'<div class="subhero-media"><img src="assets/{image}" alt="" fetchpriority="high"></div>' if image else ''
    return f'''<section class="subhero section-pad"><div class="wrap subhero-grid"><div class="subhero-copy"><div class="kicker">{t(kicker_en,kicker_ru)}</div>{t(title_en,title_ru,'h1','subhero-title')}{t(lead_en,lead_ru,'p','subhero-lead')}{actions}</div>{media}</div></section>'''


def section_head(kicker_en,kicker_ru,title_en,title_ru,lead_en='',lead_ru=''):
    lead = t(lead_en,lead_ru,'p','section-intro') if lead_en else ''
    return f'<div class="subsection-head"><div class="kicker">{t(kicker_en,kicker_ru)}</div>{t(title_en,title_ru,"h2","subsection-title")}{lead}</div>'


def card(num,title_en,title_ru,body_en,body_ru,link_html=''):
    return f'<article class="info-card"><span class="card-no">{num}</span>{t(title_en,title_ru,"h3")}{t(body_en,body_ru,"p")}{link_html}</article>'


pages = {}

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


# Pages written from the "Content of Website" document. Each text is an (en, ru, uz) triple.
def tx(text, tag='span', cls=''):
    en, ru, uz = text
    attrs = f' class="{cls}"' if cls else ''
    return f'<{tag}{attrs} data-ru="{escape(ru, quote=True)}" data-uz="{escape(uz, quote=True)}">{en}</{tag}>'


def button(label, href, cls='primary-link'):
    external = ' target="_blank" rel="noopener noreferrer"' if href.startswith('http') else ''
    return f'<a class="{cls}" href="{href}"{external}>{tx(label)} <span aria-hidden="true">↗</span></a>'


def items_html(items):
    html = ''
    for kind, value in items:
        if kind == 'p': html += tx(value, 'p')
        elif kind == 'emphasis': html += tx(value, 'p', 'prose-emphasis')
        elif kind == 'h3': html += tx(value, 'h3', 'prose-subhead')
        elif kind == 'list': html += '<ul class="clean-list">' + ''.join(tx(item, 'li') for item in value) + '</ul>'
        elif kind == 'questions': html += '<ol class="question-list">' + ''.join(tx(item, 'li') for item in value) + '</ol>'
        elif kind == 'flow': html += '<ol class="flow-line">' + ''.join(tx(item, 'li') for item in value) + '</ol>'
        elif kind == 'buttons': html += '<div class="prose-actions">' + ''.join(button(*item) for item in value) + '</div>'
        else: raise ValueError(f'Unknown content item: {kind}')
    return html


def numbered_head(number, title, subtitle=None):
    sub = tx(subtitle, 'p', 'section-intro') if subtitle else ''
    return f'<div class="subsection-head"><span class="kicker">{number:02d} / S3</span>{tx(title, "h2", "subsection-title")}{sub}</div>'


def render_page(page):
    hero_data = page['hero']
    media = f'<div class="subhero-media"><img src="assets/{page["image"]}" alt="" fetchpriority="high"></div>'
    actions = ''.join(button(*item) for item in hero_data.get('buttons', []))
    body = f'<section class="subhero section-pad"><div class="wrap subhero-grid"><div class="subhero-copy"><div class="kicker">{tx(page["title"])}</div>{tx(hero_data["title"], "h1", "subhero-title")}{tx(hero_data["lead"], "p", "subhero-lead")}{actions}</div>{media}</div></section>'
    number = 0
    for kind, block in page['blocks']:
        soft = ' soft' if block.get('soft') else ''
        if kind == 'continuation':
            body += f'<section class="content-section continuation section-pad"><div class="wrap"><div class="prose-stack prose-wide">{items_html(block["items"])}</div></div></section>'
        elif kind == 'prose':
            number += 1
            body += f'<section class="content-section{soft} section-pad"><div class="wrap editorial-grid">{numbered_head(number, block["title"], block.get("subtitle"))}<div class="prose-stack">{items_html(block["items"])}</div></div></section>'
        elif kind == 'cards':
            head = ''
            if block.get('title'):
                number += 1
                head = numbered_head(number, block['title'], block.get('subtitle'))
            intro = f'<div class="prose-stack prose-wide card-intro">{items_html(block["intro"])}</div>' if block.get('intro') else ''
            outro = f'<div class="prose-stack prose-wide card-outro">{items_html(block["outro"])}</div>' if block.get('outro') else ''
            cards = ''.join(f'<article class="info-card"><span class="card-no">{index:02d}</span>{tx(title, "h3")}{"".join(tx(text, "p") for text in texts)}</article>' for index, (title, texts) in enumerate(block['cards'], 1))
            body += f'<section class="content-section{soft} section-pad"><div class="wrap">{head}{intro}<div class="card-grid {block.get("columns", "three")}">{cards}</div>{outro}</div></section>'
        elif kind == 'details':
            head = ''
            if block.get('title'):
                number += 1
                head = numbered_head(number, block['title'], block.get('subtitle'))
            rows = ''
            for row in block['rows']:
                anchor = f' id="{row["id"]}"' if row.get('id') else ''
                lead = tx(row['subtitle'], 'p', 'detail-lead') if row.get('subtitle') else ''
                rows += f'<article{anchor} class="detail-row"><div><span class="detail-line"></span>{tx(row["title"], "h3")}</div><div>{lead}{items_html(row.get("items", []))}</div></article>'
            outro = f'<div class="detail-outro">{items_html(block["outro"])}</div>' if block.get('outro') else ''
            body += f'<section class="detail-section section-pad"><div class="wrap">{head}{rows}{outro}</div></section>'
        elif kind == 'anchors':
            links = ''.join(f'<a href="#{anchor}">{tx(label)}</a>' for anchor, label in block['links'])
            body += f'<section class="content-section anchor-section"><div class="wrap"><nav class="anchor-nav" aria-label="Page sections">{links}</nav></div></section>'
        elif kind == 'facts':
            facts = ''.join(f'<div><strong>{value}</strong>{tx(label)}</div>' for value, label in block['facts'])
            body += f'<section class="fact-band"><div class="wrap fact-grid">{facts}</div></section>'
        elif kind == 'partner':
            number += 1
            light = ' light' if block.get('light') else ''
            logo = f'<div class="partner-feature-logo{light}"><img src="assets/{block["logo"]}" alt="{escape(block["title"][0], quote=True)}"></div>'
            sub = tx(block['subtitle'], 'p', 'section-intro') if block.get('subtitle') else ''
            body += f'<section class="content-section partner-feature{soft} section-pad"><div class="wrap editorial-grid"><div class="subsection-head">{logo}<span class="kicker">{number:02d} / S3</span>{tx(block["title"], "h2", "subsection-title")}{sub}</div><div class="prose-stack">{items_html(block["items"])}</div></div></section>'
        elif kind == 'closing':
            lines = ''.join(tx(line, 'p', 'statement-line') for line in block.get('lines', []))
            actions = ''.join(button(*item) for item in block.get('buttons', []))
            actions = f'<div class="closing-actions">{actions}</div>' if actions else ''
            body += f'<section class="statement-section closing-section section-pad"><div class="wrap"><span class="kicker">Strategic Security Systems</span>{tx(block["statement"], "p", "statement")}{lines}{actions}</div></section>'
        else:
            raise ValueError(f'Unknown block: {kind}')
    return body


for content in CONTENT_PAGES:
    title_en, title_ru, title_uz = content.PAGE['title']
    description = re.sub(r'<[^>]+>', '', content.PAGE['hero']['lead'][0])
    pages[content.PAGE['slug']] = shell(content.PAGE['slug'], title_en, title_ru, description, render_page(content.PAGE), title_uz)

for name,content in pages.items():
    (OUT/name).write_text(content)
print('Generated',len(pages),'pages')
