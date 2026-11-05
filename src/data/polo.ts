import type { MaintenanceType } from '@/types'

/* ──────────────────────────────────────────────────────────────
   Справочная база VW Polo Sedan (2010–2020) и Polo Liftback (2020–2022)
   Источники — в конце файла (SOURCES)
   ────────────────────────────────────────────────────────────── */

export interface AnalogPart {
  brand: string
  number: string
  /** цена/качество */
  tag: 'оптимум' | 'бюджет' | 'премиум'
}

export interface PartInfo {
  name: string
  oem: string
  interval: string
  analogs: AnalogPart[]
}

export interface EngineInfo {
  code: string
  name: string
  family: string
  power: string
  torque: string
  years: string
  timing: string
  fuel: string
  compression: string
  oilSpec: string
  oilViscosity: string
  oilVolume: string
  gearboxes: string[] // коды из GEARBOXES
  features: string[]
  issues: { title: string; text: string }[]
  parts: PartInfo[]
}

export interface GearboxInfo {
  code: string
  name: string
  kind: 'Механика' | 'Автомат'
  years: string
  fluid: string
  fluidOem: string
  volume: string
  interval: string
  notes: string[]
}

export interface TrimInfo {
  name: string
  body: 'Седан' | 'Лифтбэк'
  years: string
  features: string[]
}

/* ── Двигатели ─────────────────────────────────────────────── */

export const ENGINES: EngineInfo[] = [
  {
    code: 'CFNA',
    name: '1.6 MPI',
    family: 'EA111',
    power: '105 л.с. (77 кВт) при 5250 об/мин',
    torque: '153 Н·м при 3800 об/мин',
    years: '2010–2015',
    timing: 'Цепь ГРМ (ресурс ~150–180 ткм, гидронатяжитель)',
    fuel: 'АИ-95 (допускается АИ-92)',
    compression: '10,5',
    oilSpec: 'VW 502 00 / 505 00',
    oilViscosity: '5W-30 или 5W-40',
    oilVolume: '~4,0 л с фильтром (заливать по щупу)',
    gearboxes: ['MQ200-5', '09G'],
    features: [
      'Чугунный блок, алюминиевая ГБЦ, 16 клапанов',
      'Распределённый впрыск, без гидрокомпенсаторов — регулировка клапанов шайбами',
      'Простая конструкция, огромный выбор запчастей и контрактных моторов',
    ],
    issues: [
      { title: 'Цокот поршней на холодную', text: 'Конструктивная особенность: стук юбок поршней до прогрева. Не критично, но контролируйте масляный аппетит.' },
      { title: 'Растяжение цепи ГРМ', text: 'После 100–150 ткм возможны растяжение цепи и треск при запуске. Меняется комплектом с натяжителем и успокоителями.' },
      { title: 'Масложор после 100 ткм', text: 'Залегание маслосъёмных колец. Помогает раскоксовка или переход на 5W-40 и сокращение интервала замены.' },
    ],
    parts: [
      {
        name: 'Масляный фильтр',
        oem: 'VAG 03C115561H',
        interval: 'каждые 15 000 км',
        analogs: [
          { brand: 'Mann', number: 'W 712/90', tag: 'оптимум' },
          { brand: 'Mahle', number: 'OC 593/3', tag: 'оптимум' },
          { brand: 'Bosch', number: 'F 026 407 080', tag: 'бюджет' },
        ],
      },
      {
        name: 'Воздушный фильтр',
        oem: 'VAG 6R0129620A',
        interval: 'каждые 30 000 км',
        analogs: [
          { brand: 'Mann', number: 'C 27 009', tag: 'оптимум' },
          { brand: 'Mahle', number: 'LX 1566', tag: 'оптимум' },
          { brand: 'Filtron', number: 'AP 185/2', tag: 'бюджет' },
        ],
      },
      {
        name: 'Свечи зажигания (4 шт.)',
        oem: 'VAG 101905601F (Bosch) / 101905617C (NGK)',
        interval: 'каждые 60 000 км',
        analogs: [
          { brand: 'NGK', number: '5960 (ZFR6T-11G)', tag: 'оптимум' },
          { brand: 'Bosch', number: '0 242 236 530 (FR7HE02)', tag: 'бюджет' },
          { brand: 'Denso', number: 'KJ20DR-M11', tag: 'бюджет' },
          { brand: 'NGK', number: '3764 (BKR6EIX-11) иридий', tag: 'премиум' },
        ],
      },
    ],
  },
  {
    code: 'CFNB',
    name: '1.6 MPI',
    family: 'EA111',
    power: '85 л.с. (63 кВт) при 5200 об/мин',
    torque: '140 Н·м при 3800 об/мин',
    years: '2010–2015',
    timing: 'Цепь ГРМ',
    fuel: 'АИ-95 (допускается АИ-92)',
    compression: '10,5',
    oilSpec: 'VW 502 00 / 505 00',
    oilViscosity: '5W-30 или 5W-40',
    oilVolume: '~4,0 л с фильтром',
    gearboxes: ['MQ200-5'],
    features: [
      'Дефорсированная версия CFNA, только с 5-ступенчатой механикой',
      'Конструктивно идентичен CFNA — те же расходники и регламент',
    ],
    issues: [
      { title: 'Те же особенности, что у CFNA', text: 'Цокот поршней на холодную и контроль цепи ГРМ после 100 ткм актуальны и здесь.' },
    ],
    parts: [
      {
        name: 'Масляный фильтр',
        oem: 'VAG 03C115561H',
        interval: 'каждые 15 000 км',
        analogs: [
          { brand: 'Mann', number: 'W 712/90', tag: 'оптимум' },
          { brand: 'Mahle', number: 'OC 593/3', tag: 'оптимум' },
        ],
      },
      {
        name: 'Свечи зажигания (4 шт.)',
        oem: 'VAG 101905601F',
        interval: 'каждые 60 000 км',
        analogs: [
          { brand: 'NGK', number: '5960 (ZFR6T-11G)', tag: 'оптимум' },
          { brand: 'Bosch', number: '0 242 236 530', tag: 'бюджет' },
        ],
      },
    ],
  },
  {
    code: 'CLSA',
    name: '1.6 MPI',
    family: 'EA111',
    power: '105 л.с. (77 кВт)',
    torque: '153 Н·м',
    years: '2016–2017',
    timing: 'Цепь ГРМ',
    fuel: 'АИ-95',
    compression: '10,5',
    oilSpec: 'VW 502 00 / 505 00',
    oilViscosity: '5W-30 или 5W-40',
    oilVolume: '~4,0 л с фильтром',
    gearboxes: ['MQ200-5', '09G'],
    features: [
      'Переходная версия EA111 для норм Евро-5, ставилась недолго',
      'Обслуживание и расходники — как у CFNA',
    ],
    issues: [
      { title: 'Наследие EA111', text: 'Те же типичные особенности семейства: контроль цепи ГРМ и масляного аппетита после 100 ткм.' },
    ],
    parts: [
      {
        name: 'Масляный фильтр',
        oem: 'VAG 03C115561H',
        interval: 'каждые 15 000 км',
        analogs: [{ brand: 'Mann', number: 'W 712/90', tag: 'оптимум' }],
      },
      {
        name: 'Свечи зажигания (4 шт.)',
        oem: 'VAG 101905601F',
        interval: 'каждые 60 000 км',
        analogs: [{ brand: 'NGK', number: '5960 (ZFR6T-11G)', tag: 'оптимум' }],
      },
    ],
  },
  {
    code: 'CWVB',
    name: '1.6 MPI',
    family: 'EA211',
    power: '90 л.с. (66 кВт) при 4250 об/мин',
    torque: '155 Н·м при 3800–4000 об/мин',
    years: '2015–2022',
    timing: 'Ремень ГРМ (проверка с 60 ткм, замена 90–120 ткм)',
    fuel: 'АИ-95',
    compression: '10,8',
    oilSpec: 'VW 502 00 / 505 00 (для MY2021+ подтверждён 5W-40)',
    oilViscosity: '5W-40 (ранние — по VW 502 00: 5W-30/5W-40)',
    oilVolume: '~4,0 л с фильтром',
    gearboxes: ['MQ200-5'],
    features: [
      'Семейство EA211: алюминиевый блок, ГРМ ременём, выпускной коллектор в ГБЦ',
      'Гидрокомпенсаторы — регулировка клапанов не нужна',
      'Собирался в Калуге, ставился также на Škoda Rapid',
    ],
    issues: [
      { title: 'Помпа и термостат', text: 'Потёки помпы и подклинивание термостата — самая частая жалоба EA211. Следите за уровнем антифриза.' },
      { title: 'Свист ремня ГРМ на морозе', text: 'Обычно ролик или сам ремень — повод проверить комплект вне очередного интервала.' },
    ],
    parts: [
      {
        name: 'Масляный фильтр',
        oem: 'VAG 04E115561H',
        interval: 'каждые 15 000 км',
        analogs: [
          { brand: 'Mann', number: 'W 712/95', tag: 'оптимум' },
          { brand: 'Mahle', number: 'OC 977/1', tag: 'оптимум' },
          { brand: 'Hengst', number: 'H317W01', tag: 'оптимум' },
          { brand: 'Bosch', number: 'F 026 407 143', tag: 'бюджет' },
        ],
      },
      {
        name: 'Воздушный фильтр',
        oem: 'VAG 04E129620A',
        interval: 'каждые 30 000 км',
        analogs: [
          { brand: 'Mann', number: 'C 27 125', tag: 'оптимум' },
          { brand: 'Filtron', number: 'AP 197/6', tag: 'бюджет' },
        ],
      },
      {
        name: 'Свечи зажигания (4 шт.)',
        oem: 'VAG 04C905616 / 04C905616D (после 08.2017)',
        interval: 'каждые 60 000 км',
        analogs: [
          { brand: 'Bosch', number: '0 241 135 520', tag: 'оптимум' },
          { brand: 'Champion', number: 'OE247', tag: 'бюджет' },
        ],
      },
      {
        name: 'Ремень ГРМ',
        oem: 'VAG 04E109119F + ролики 04E109479A',
        interval: 'замена 90–120 000 км',
        analogs: [
          { brand: 'Contitech', number: 'CT1221 (комплект)', tag: 'оптимум' },
          { brand: 'INA', number: '530 0601 10 (ролики)', tag: 'оптимум' },
        ],
      },
    ],
  },
  {
    code: 'CWVA',
    name: '1.6 MPI',
    family: 'EA211',
    power: '110 л.с. (81 кВт) при 5800 об/мин',
    torque: '155 Н·м при 3800–4000 об/мин',
    years: '2015–2022',
    timing: 'Ремень ГРМ (проверка с 60 ткм, замена 90–120 ткм)',
    fuel: 'АИ-95',
    compression: '10,8',
    oilSpec: 'VW 502 00 / 505 00 (для MY2021+ подтверждён 5W-40)',
    oilViscosity: '5W-40 (ранние — по VW 502 00: 5W-30/5W-40)',
    oilVolume: '~4,0 л с фильтром',
    gearboxes: ['MQ200-5', '09G'],
    features: [
      'Самая массовая версия: EA211 с фазовращателем на впуске',
      'Алюминиевый блок, ремень ГРМ, гидрокомпенсаторы',
      'Задние дисковые тормоза (у версий на 90 л.с. — барабанные)',
    ],
    issues: [
      { title: 'Помпа и термостат', text: 'Потёки помпы и подклинивание термостата — слабое место EA211. Контролируйте уровень антифриза и следы подтёков.' },
      { title: 'Форсунки омывателя', text: 'На морозе отказывают обогреваемые форсунки — недорогая, но частая замена.' },
      { title: 'Опора двигателя', text: 'Правая гидроопора ходит 80–120 ткм: вибрация и глухой стук при трогании.' },
    ],
    parts: [
      {
        name: 'Масляный фильтр',
        oem: 'VAG 04E115561H',
        interval: 'каждые 15 000 км',
        analogs: [
          { brand: 'Mann', number: 'W 712/95', tag: 'оптимум' },
          { brand: 'Mahle', number: 'OC 977/1', tag: 'оптимум' },
          { brand: 'Hengst', number: 'H317W01', tag: 'оптимум' },
          { brand: 'Bosch', number: 'F 026 407 143', tag: 'бюджет' },
        ],
      },
      {
        name: 'Воздушный фильтр',
        oem: 'VAG 04E129620A',
        interval: 'каждые 30 000 км',
        analogs: [
          { brand: 'Mann', number: 'C 27 125', tag: 'оптимум' },
          { brand: 'Filtron', number: 'AP 197/6', tag: 'бюджет' },
        ],
      },
      {
        name: 'Свечи зажигания (4 шт.)',
        oem: 'VAG 04C905616 / 04C905616D (после 08.2017)',
        interval: 'каждые 60 000 км',
        analogs: [
          { brand: 'Bosch', number: '0 241 135 520', tag: 'оптимум' },
          { brand: 'Champion', number: 'OE247', tag: 'бюджет' },
        ],
      },
      {
        name: 'Ремень ГРМ',
        oem: 'VAG 04E109119F + ролики 04E109479A',
        interval: 'замена 90–120 000 км',
        analogs: [
          { brand: 'Contitech', number: 'CT1221 (комплект)', tag: 'оптимум' },
          { brand: 'INA', number: '530 0601 10 (ролики)', tag: 'оптимум' },
        ],
      },
    ],
  },
  {
    code: 'CZCA',
    name: '1.4 TSI',
    family: 'EA211',
    power: '125 л.с. (92 кВт) при 5000–6000 об/мин',
    torque: '200 Н·м при 1400–4000 об/мин',
    years: '2016–2022',
    timing: 'Ремень ГРМ (замена 90–120 ткм)',
    fuel: 'АИ-95 (рекомендован АИ-98)',
    compression: '10,5',
    oilSpec: 'VW 502 00 / 505 00 (фикс. сервис) или VW 504 00 / 507 00 (LongLife)',
    oilViscosity: '5W-30 / 5W-40 по допуску конкретного авто',
    oilVolume: '~4,0 л с фильтром',
    gearboxes: ['MQ200-6', 'DQ200'],
    features: [
      'Турбированный EA211: турбина с электронным управлением перепускной заслонкой',
      'Версия для Polo GT (6МКПП) и топовых комплектаций (7-DSG DQ200)',
      'Лучшая динамика в гамме: 9,0–9,3 с до 100 км/ч',
    ],
    issues: [
      { title: 'Турбина и актуатор', text: 'Редко, но встречается подклинивание актуатора перепускной заслонки — ошибка P0299. Лечится чисткой или заменой актуатора.' },
      { title: 'Помпа-термостат', text: 'Общая болячка EA211: модуль помпы с термостатом течёт к 60–100 ткм.' },
      { title: 'Требователен к топливу', text: 'Низкосортный бензин быстро вызывает детонацию и ошибки по пропускам — лейте АИ-95/98 проверенных сетей.' },
    ],
    parts: [
      {
        name: 'Масляный фильтр',
        oem: 'VAG 04E115561H',
        interval: 'каждые 15 000 км (лучше 7 500–10 000)',
        analogs: [
          { brand: 'Mann', number: 'W 712/95', tag: 'оптимум' },
          { brand: 'Mahle', number: 'OC 977/1', tag: 'оптимум' },
        ],
      },
      {
        name: 'Воздушный фильтр',
        oem: 'VAG 04E129620A',
        interval: 'каждые 30 000 км',
        analogs: [{ brand: 'Mann', number: 'C 27 125', tag: 'оптимум' }],
      },
      {
        name: 'Свечи зажигания (4 шт.)',
        oem: 'VAG 04E905601B',
        interval: 'каждые 60 000 км',
        analogs: [
          { brand: 'NGK', number: '93231', tag: 'оптимум' },
          { brand: 'Bosch', number: '0 241 145 523', tag: 'оптимум' },
          { brand: 'Beru', number: 'Z365', tag: 'бюджет' },
        ],
      },
    ],
  },
]

/* ── Коробки передач ───────────────────────────────────────── */

export const GEARBOXES: GearboxInfo[] = [
  {
    code: 'MQ200-5',
    name: '5-ступенчатая механика (MQ200)',
    kind: 'Механика',
    years: '2010–2022',
    fluid: 'Трансмиссионное масло 75W-90, допуск GL-4',
    fluidOem: 'VAG G 052 512 A2 / G 052 171 A2',
    volume: '~1,9–2,0 л',
    interval: 'Пожизненная заправка; на практике — замена каждые 90–100 ткм',
    notes: [
      'Очень надёжный агрегат: из навесного — выжимной подшипник (80–120 ткм) и сцепление в сборе (100–150 ткм)',
      'Затруднённое включение задней передачи на холодную — конструктивная особенность, не неисправность',
      'Аналоги масла: Motul Motylgear 75W-80, Liqui Moly Hochleistungs-Getriebeoil 75W-80, Castrol Syntrans Multivehicle 75W-90',
    ],
  },
  {
    code: 'MQ200-6',
    name: '6-ступенчатая механика (MQ200, для 1.4 TSI GT)',
    kind: 'Механика',
    years: '2016–2022',
    fluid: 'Трансмиссионное масло 75W-90, допуск GL-4',
    fluidOem: 'VAG G 052 512 A2 / G 052 171 A2',
    volume: '~2,0 л',
    interval: 'Пожизненная заправка; рекомендуется замена к 100 ткм',
    notes: [
      'Усиленная версия MQ200 под момент 200 Н·м',
      'Ресурс сцепления зависит от стиля: с турбомотором берегите старты с пробуксовкой',
    ],
  },
  {
    code: '09G',
    name: '6-ступенчатый автомат (Aisin 09G / TF-60SN)',
    kind: 'Автомат',
    years: '2010–2022',
    fluid: 'ATF по допуску VW G 055 025 A2 (до ~2014) или G 055 540 A2 = Toyota WS (после 2014)',
    fluidOem: 'VAG G 055 025 A2 / G 055 540 A2',
    volume: 'частичная замена ~3–4 л, полная (аппаратная) ~7–8 л',
    interval: 'Официально «на весь срок»; по факту — каждые 60 ткм или 5 лет (Aisin рекомендует чаще)',
    notes: [
      'Классический гидротрансформатор Aisin — ресурс 250–300+ ткм при регулярной замене масла',
      'Слабое место — гидроблок: пинки на горячую лечатся заменой масла и адаптацией, запущенный случай — ремонт гидроблока',
      'До ~2014 — металлический фильтр и допуск G 055 025 A2 (аналог Toyota Type T-IV, напр. Motul Multi ATF); после — пластиковый фильтр и G 055 540 A2 (аналог Toyota WS, напр. Motul ATF 6)',
      'При частичной замене меняйте фильтр и прокладку поддона, уровень выставляется по температуре 35–45 °C',
    ],
  },
  {
    code: 'DQ200',
    name: '7-ступенчатый робот DSG (DQ200 / 0AM, сухое сцепление)',
    kind: 'Автомат',
    years: '2016–2022',
    fluid: 'Два контура: механическая часть — масло КП, гидроблок мехатроника — отдельная жидкость',
    fluidOem: 'VAG G 052 512 A2 (мехчасть) + VAG G 004 000 M2 (мехатроник)',
    volume: 'мехчасть ~1,7–1,9 л, мехатроник ~1,0 л',
    interval: 'По регламенту пожизненно; на практике масло мехчасти — каждые 60 ткм',
    notes: [
      '«Сухая» DSG-7: лёгкая и экономичная, но не любит пробки и ползучий режим — перегрев сцепления',
      'В пробках переводите селектор в N при долгих остановках и избегайте «ползучего» режима',
      'Типичные болячки: износ подшипников первичного вала (гул) и отказы мехатроника (мигание «гайки» на приборке)',
    ],
  },
]

/* ── Комплектации ──────────────────────────────────────────── */

export const TRIMS: TrimInfo[] = [
  {
    name: 'Conceptline',
    body: 'Седан',
    years: '2015–2020',
    features: [
      'Базовая версия: ABS, 2 подушки, дневные ходовые огни',
      'Стальные диски 14″, аудиоподготовка, тканевый салон Grip',
      'Электростеклоподъёмники всех дверей, центральный замок',
    ],
  },
  {
    name: 'Trendline',
    body: 'Седан',
    years: '2010–2020',
    features: [
      'Кондиционер Climatic, обогрев передних сидений и зеркал',
      'Стальные диски 15″, многофункциональный дисплей',
      'Только 5МКПП в ранние годы, позже доступен автомат',
    ],
  },
  {
    name: 'Comfortline',
    body: 'Седан',
    years: '2010–2020',
    features: [
      'Диски R15, электропривод и обогрев зеркал, обогрев форсунок омывателя',
      'Заднее сиденье 40:60, задние дисковые тормоза (для 110 л.с.)',
      'Радио RCD 230 / R140 (CD/MP3/USB/Bluetooth)',
    ],
  },
  {
    name: 'Highline',
    body: 'Седан',
    years: '2010–2020',
    features: [
      'Климат-контроль, кожаный руль, противотуманки с подсветкой поворота',
      'Легкосплавные диски 15″ Tosa, хром-пакет экстерьера',
      'Доступен 1.4 TSI 125 л.с., ESP в базе для версий с DSG',
    ],
  },
  {
    name: 'GT',
    body: 'Седан',
    years: '2016–2020',
    features: [
      'Спортивная версия: только 1.4 TSI 125 л.с. с 6МКПП или 7-DSG',
      'Спортивные бамперы и решётка, двойная выхлопная труба, спойлер',
      'Спортивные сиденья с эксклюзивной обивкой, чёрный потолок',
    ],
  },
  {
    name: 'Allstar / Life / Drive / Joy / Connect / Football Edition',
    body: 'Седан',
    years: '2016–2020',
    features: [
      'Спецсерии на базе Trendline–Highline с расширенным оснащением «в цене»',
      'Allstar: легкосплавные диски, обогрев лобового стекла',
      'Life/Drive/Joy/Connect: мультимедиа с App-Connect, камера заднего вида в топе',
    ],
  },
  {
    name: 'Origin',
    body: 'Лифтбэк',
    years: '2020–2022',
    features: [
      'Базовая версия Polo VI: 1.6 MPI 90/110 л.с., 5МКПП',
      '2 подушки, ABS, ЭРА-ГЛОНАСС, дневные ходовые огни',
      'Простая аудиоподготовка, регулировка сиденья водителя по высоте',
    ],
  },
  {
    name: 'Respect',
    body: 'Лифтбэк',
    years: '2020–2022',
    features: [
      'Кондиционер, обогрев сидений и зеркал, мультимедиа 6,5″ с App-Connect',
      'Доступны 90 л.с. (МКПП) и 110 л.с. (МКПП/АКПП)',
    ],
  },
  {
    name: 'Status',
    body: 'Лифтбэк',
    years: '2020–2022',
    features: [
      'Климат-контроль, мультимедиа 8,25″, кожаный руль, парктроник',
      'Диски R16, светодиодные фары, доступен 1.4 TSI с DSG',
    ],
  },
  {
    name: 'Exclusive',
    body: 'Лифтбэк',
    years: '2020–2022',
    features: [
      'Максимальная версия: 110 л.с. (АКПП) или 1.4 TSI 125 л.с. (DSG)',
      'Задние дисковые тормоза, контроль давления в шинах, передний парктроник',
      'Самозатемняющееся зеркало, датчики света и дождя, динамическая подсветка поворота',
    ],
  },
]

/* ── Общие жидкости (не зависят от мотора) ────────────────── */

export const FLUIDS = [
  { name: 'Тормозная жидкость', spec: 'DOT 4 (VAG B 000 750 M3)', volume: '~1,0 л', interval: 'каждые 2 года' },
  { name: 'Антифриз', spec: 'G13 (VAG G 013 A8J M1) / G12evo — фиолетовый', volume: '~6,0 л', interval: '90 ткм или 5 лет' },
  { name: 'Омывайка', spec: 'По сезону, зимой незамерзайка до −20…−30 °C', volume: 'бачок ~5,5 л', interval: 'по расходу' },
  { name: 'Масло МКПП', spec: '75W-90 GL-4 (VAG G 052 512 A2)', volume: '~2,0 л', interval: 'пожизненно / 90–100 ткм' },
  { name: 'ATF АКПП 09G', spec: 'VAG G 055 025 A2 (до ~2014) / G 055 540 A2 (после)', volume: 'частично 3–4 л, полностью 7–8 л', interval: '60 ткм или 5 лет' },
  { name: 'Масло DSG DQ200', spec: 'G 052 512 A2 (мехчасть) + G 004 000 M2 (мехатроник)', volume: '~1,9 л + ~1,0 л', interval: 'по регламенту пожизненно' },
]

/* ── Общие расходники (независимые от мотора) ──────────────── */

export const COMMON_PARTS: PartInfo[] = [
  {
    name: 'Салонный фильтр',
    oem: 'VAG 6R0819653 (седан до 2017) / 6R0820367',
    interval: 'каждые 30 000 км',
    analogs: [
      { brand: 'Mann', number: 'CUK 2545 (угольный)', tag: 'оптимум' },
      { brand: 'Mann', number: 'CU 2545 (обычный)', tag: 'бюджет' },
      { brand: 'Filtron', number: 'K 1211', tag: 'бюджет' },
    ],
  },
  {
    name: 'Топливный фильтр (в баке)',
    oem: 'VAG 6Q0201051J',
    interval: 'каждые 60 000 км',
    analogs: [
      { brand: 'Filtron', number: 'PP 836/4', tag: 'оптимум' },
      { brand: 'Mahle', number: 'KL 572', tag: 'оптимум' },
    ],
  },
  {
    name: 'Пробка поддона + кольцо',
    oem: 'VAG N 902 889 01 + N 013 815 7',
    interval: 'при каждой замене масла',
    analogs: [{ brand: 'Febi', number: '48871 (комплект)', tag: 'бюджет' }],
  },
  {
    name: 'Передние тормозные колодки',
    oem: 'VAG 6R0698151',
    interval: 'по износу, обычно 30–50 ткм',
    analogs: [
      { brand: 'TRW', number: 'GDB1939', tag: 'оптимум' },
      { brand: 'Brembo', number: 'P 85 118', tag: 'премиум' },
      { brand: 'Bosch', number: '0 986 494 336', tag: 'бюджет' },
    ],
  },
]

/* ── Регламент ТО ──────────────────────────────────────────── */

export const MAINTENANCE_SCHEDULE: MaintenanceType[] = [
  {
    id: 'oil',
    name: 'Масло двигателя + масляный фильтр',
    intervalKm: 15000,
    intervalMonths: 12,
    note: 'VW 502 00, 5W-40 (для CZCA — допуск по ПТС). Объём ~4,0 л. В тяжёлых условиях — каждые 7,5–10 ткм.',
  },
  {
    id: 'air-filter',
    name: 'Воздушный фильтр двигателя',
    intervalKm: 30000,
    intervalMonths: 24,
    note: 'EA111: VAG 6R0129620A · EA211: VAG 04E129620A.',
  },
  {
    id: 'cabin-filter',
    name: 'Салонный фильтр',
    intervalKm: 30000,
    intervalMonths: 24,
    note: 'VAG 6R0820367. Меняется из-под бардачка за 10 минут, угольный предпочтительнее.',
  },
  {
    id: 'spark-plugs',
    name: 'Свечи зажигания',
    intervalKm: 60000,
    intervalMonths: null,
    note: 'CFNA/CFNB: 101905601F · CWVA/CWVB: 04C905616D · CZCA: 04E905601B. Момент затяжки ~25 Н·м.',
  },
  {
    id: 'brake-fluid',
    name: 'Тормозная жидкость',
    intervalKm: null,
    intervalMonths: 24,
    note: 'DOT 4, ~1 л. Меняется строго по времени — жидкость гигроскопична.',
  },
  {
    id: 'coolant',
    name: 'Антифриз (G13 / G12evo)',
    intervalKm: 90000,
    intervalMonths: 60,
    note: 'Объём системы ~6 л. Контроль уровня на каждом ТО — следите за помпой EA211.',
  },
  {
    id: 'timing',
    name: 'Привод ГРМ',
    intervalKm: 90000,
    intervalMonths: null,
    note: 'EA211 (CWVA/CWVB/CZCA) — ремень: проверка с 60 ткм, замена к 90–120 ткм. EA111 (CFNA/CFNB) — цепь: контроль после 100 ткм.',
  },
  {
    id: 'atf',
    name: 'Масло АКПП (Aisin 09G)',
    intervalKm: 60000,
    intervalMonths: null,
    note: 'Частичная замена 3–4 л с фильтром. До ~2014 — G 055 025 A2, после — G 055 540 A2.',
  },
  {
    id: 'dsg',
    name: 'Масло DSG DQ200 (мехчасть)',
    intervalKm: 60000,
    intervalMonths: null,
    note: 'Только для 1.4 TSI с DSG. Мехатроник — пожизненно, масло мехчасти разумно обновлять.',
  },
  {
    id: 'fuel-filter',
    name: 'Топливный фильтр (в баке)',
    intervalKm: 60000,
    intervalMonths: null,
    note: 'VAG 6Q0201051J. Меняется вместе с сеткой насоса.',
  },
  {
    id: 'brakes',
    name: 'Тормозные колодки и диски',
    intervalKm: 30000,
    intervalMonths: null,
    note: 'Проверка износа на каждом ТО. Передние колодки обычно ходят 30–50 ткм.',
  },
]

/* ── Общие характеристики ──────────────────────────────────── */

export const SPECS = {
  engine: 'R4, 8/16V — см. раздел «Двигатели»',
  power: '85–125 л.с. в зависимости от мотора',
  torque: '140–200 Н·м',
  fuel: 'АИ-95 (для CFNA допускается АИ-92)',
  tank: '55 л',
  consumption: 'смешанный 6,0–8,7 л/100 км в зависимости от мотора и коробки',
  drive: 'Передний привод',
  gearbox: '5/6МКПП · 6АКПП Aisin 09G · 7-DSG DQ200',
  body: 'Седан (2010–2020) / лифтбэк (2020–2022), клиренс 163–170 мм',
  tires: '175/70 R14, 185/60 R15, 195/55 R16 · давление 2,0–2,2 бар',
  boltPattern: '5×100, ЦО 57,1 мм',
}

export const BODY_INFO = {
  sedan: 'Polo Sedan (Mk5, платформа PQ25) выпускался в Калуге с 2010 по 2020 год',
  liftback:
    'Polo Liftback (Mk6) выпускался с 2020 по 2022 год. Официальные продажи Volkswagen в РФ завершились в 2022 году, поэтому модельный ряд охватывает 2012–2022 годы',
}

/* ── Источники ─────────────────────────────────────────────── */

export const SOURCES = [
  { label: 'DAV.kz — масло и техжидкости Polo Sedan/Liftback', url: 'https://dav.kz/blog/volkswagen-polo-sedan-liftback-maslo-zhidkosti/' },
  { label: '1AK.BY — допуски и объёмы масла по кодам двигателей', url: 'https://1ak.by/blog/maslo-dlya-volkswagen-polo-16-mpi-i-14-tsi-dopusk-vyazkost-i-obem' },
  { label: 'MotorHunter — двигатель CWVA: характеристики и обслуживание', url: 'https://www.motorhunter.ru/engine/volkswagen/cwva/' },
  { label: 'AM-Parts — наборы ТО и артикулы VAG для Polo Sedan', url: 'https://am-parts.ru/katalog/volkswagen/volkswagen-polo/polo-cedan-2010-n-v-/zapchasti-dlya-to/16-cwva-cwvb-110-90-ls' },
  { label: 'AM-Parts — оригинальные свечи Polo Sedan и аналоги', url: 'https://am-parts.ru/articles/kakie-svechi-ustanovleny-na-folksvagen-polo-sedan/' },
  { label: 'Motul Team — замена масла в АКПП Aisin 09G', url: 'https://www.motulteam.ru/zamena-masla-v-akpp-tf60sn-09g' },
  { label: 'Drom — каталог модификаций и комплектаций Polo', url: 'https://www.drom.ru/catalog/volkswagen/polo/g_2015_4120/' },
  { label: 'Auto.ru — каталог Polo VI (2020–2022)', url: 'https://auto.ru/catalog/cars/volkswagen/polo/22163516/21802416/equipment/21802416_22153536_21802423/' },
]

/* ── Утилиты ───────────────────────────────────────────────── */

export function engineByCode(code: string): EngineInfo | undefined {
  return ENGINES.find((e) => e.code === code)
}

export function gearboxByCode(code: string): GearboxInfo | undefined {
  return GEARBOXES.find((g) => g.code === code)
}

/** Подпись двигателя для шапки: «CWVA 1.6 MPI · 110 л.с.» */
export function engineLabel(code: string): string {
  const e = engineByCode(code)
  if (!e) return code
  return `${e.code} ${e.name} · ${e.power.split('(')[0].trim()}`
}
