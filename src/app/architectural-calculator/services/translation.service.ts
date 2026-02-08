import { Injectable } from '@angular/core';

export type Language = 'en' | 'ru' | 'hy';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
    hy: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage: Language = 'ru';
  
  private translations: Translations = {
    // Header
    'title': {
      en: '🏗️ Architectural Calculator',
      ru: '🏗️ Архитектурный Калькулятор',
      hy: '🏗️ Ճարտարապետական Հաշվիչ'
    },
    'subtitle': {
      en: 'Calculation of second-order curves for building structures',
      ru: 'Расчет кривых второго порядка для строительных конструкций',
      hy: 'Երկրորդ կարգի կորերի հաշվարկ շինարարական կոնստրուկցիաների համար'
    },
    
    // Curve selection
    'selectCurveType': {
      en: 'Select structure type:',
      ru: 'Выберите тип конструкции:',
      hy: 'Ընտրեք կոնստրուկցիայի տեսակը:'
    },
    'parabola': {
      en: 'Parabola',
      ru: 'Парабола',
      hy: 'Պարաբոլա'
    },
    'parabolaDesc': {
      en: 'Arches, bridges',
      ru: 'Арки, мосты',
      hy: 'Արջեր, կամուրջներ'
    },
    'ellipse': {
      en: 'Ellipse',
      ru: 'Эллипс',
      hy: 'Էլիպս'
    },
    'ellipseDesc': {
      en: 'Domes, vaults',
      ru: 'Купола, своды',
      hy: 'Գմբեթներ, թաղեր'
    },
    'hyperbola': {
      en: 'Hyperbola',
      ru: 'Гипербола',
      hy: 'Հիպերբոլա'
    },
    'hyperbolaDesc': {
      en: 'Towers, shells',
      ru: 'Башни, оболочки',
      hy: 'Աշտարակներ, պատյաններ'
    },
    'typicalObjects': {
      en: 'Typical objects:',
      ru: 'Типичные объекты:',
      hy: 'Տիպիկ օբյեկտներ:'
    },
    
    // Parameters
    'parameters': {
      en: 'Structure parameters:',
      ru: 'Параметры конструкции:',
      hy: 'Կոնստրուկցիայի պարամետրեր:'
    },
    'span': {
      en: 'Span (L), m:',
      ru: 'Пролёт (L), м:',
      hy: 'Բացվածք (L), մ:'
    },
    'spanHelp': {
      en: 'Distance between supports',
      ru: 'Расстояние между опорами',
      hy: 'Հեռավորությունը հենարանների միջև'
    },
    'height': {
      en: 'Height (H), m:',
      ru: 'Высота (H), м:',
      hy: 'Բարձրություն (H), մ:'
    },
    'heightHelp': {
      en: 'Maximum height at center',
      ru: 'Максимальная высота в центре',
      hy: 'Առավելագույն բարձրությունը կենտրոնում'
    },
    'thickness': {
      en: 'Thickness, m:',
      ru: 'Толщина, м:',
      hy: 'Հաստություն, մ:'
    },
    'thicknessHelp': {
      en: 'Structure thickness',
      ru: 'Толщина конструкции',
      hy: 'Կոնստրուկցիայի հաստությունը'
    },
    'semiMajorAxis': {
      en: 'Semi-major axis (a), m:',
      ru: 'Большая полуось (a), м:',
      hy: 'Մեծ կիսաառանցք (a), մ:'
    },
    'semiMajorAxisHelp': {
      en: 'Half length horizontally',
      ru: 'Половина длины по горизонтали',
      hy: 'Կես երկարությունը հորիզոնական'
    },
    'semiMinorAxis': {
      en: 'Semi-minor axis (b), m:',
      ru: 'Малая полуось (b), м:',
      hy: 'Փոքր կիսաառանցք (b), մ:'
    },
    'semiMinorAxisHelp': {
      en: 'Half height vertically',
      ru: 'Половина высоты по вертикали',
      hy: 'Կես բարձրությունը ուղղահայաց'
    },
    'paramA': {
      en: 'Parameter a, m:',
      ru: 'Параметр a, м:',
      hy: 'Պարամետր a, մ:'
    },
    'paramAHelp': {
      en: 'Distance from center to vertex',
      ru: 'Расстояние от центра до вершины',
      hy: 'Հեռավորությունը կենտրոնից գագաթին'
    },
    'paramB': {
      en: 'Parameter b, m:',
      ru: 'Параметр b, м:',
      hy: 'Պարամետր b, մ:'
    },
    'paramBHelp': {
      en: 'Opening angle parameter',
      ru: 'Отвечает за угол раскрытия',
      hy: 'Պատասխանատու է բացման անկյան համար'
    },
    
    // Material selection
    'selectMaterial': {
      en: 'Select material:',
      ru: 'Выберите материал:',
      hy: 'Ընտրեք նյութ:'
    },
    'density': {
      en: 'Density:',
      ru: 'Плотность:',
      hy: 'Խտություն:'
    },
    'cost': {
      en: 'Cost:',
      ru: 'Стоимость:',
      hy: 'Արժեք:'
    },
    'perCubicMeter': {
      en: 'USD/m³',
      ru: 'руб/м³',
      hy: 'դրամ/մ³'
    },
    'currency': {
      en: 'USD',
      ru: 'руб',
      hy: 'դրամ'
    },
    'unitKgPerM3': {
      en: 'kg/m³',
      ru: 'кг/м³',
      hy: 'կգ/մ³'
    },
    'unitPerM3': {
      en: '/m³',
      ru: '/м³',
      hy: '/մ³'
    },
    'unitKg': {
      en: 'kg',
      ru: 'кг',
      hy: 'կգ'
    },
    'unitM3': {
      en: 'm³',
      ru: 'м³',
      hy: 'մ³'
    },
    'unitM2': {
      en: 'm²',
      ru: 'м²',
      hy: 'մ²'
    },
    'unitM': {
      en: 'm',
      ru: 'м',
      hy: 'մ'
    },
    'unitMPa': {
      en: 'MPa',
      ru: 'МПа',
      hy: 'ՄՊա'
    },
    'unitMm': {
      en: 'mm',
      ru: 'мм',
      hy: 'մմ'
    },
    'unitKN': {
      en: 'kN',
      ru: 'кН',
      hy: 'կՆ'
    },
    'unitHz': {
      en: 'Hz',
      ru: 'Гц',
      hy: 'Հց'
    },
    
    // Buttons
    'calculate': {
      en: 'Calculate',
      ru: 'Рассчитать',
      hy: 'Հաշվել'
    },
    'reset': {
      en: 'Reset',
      ru: 'Сбросить',
      hy: 'Վերակայել'
    },
    
    // Results
    'results': {
      en: 'Calculation results:',
      ru: 'Результаты расчета:',
      hy: 'Հաշվարկի արդյունքներ:'
    },
    'equation': {
      en: 'Equation',
      ru: 'Уравнение',
      hy: 'Հավասարում'
    },
    'measurements': {
      en: 'Measurements',
      ru: 'Измерения',
      hy: 'Չափումներ'
    },
    'area': {
      en: 'Area:',
      ru: 'Площадь:',
      hy: 'Մակերես:'
    },
    'arcLength': {
      en: 'Arc length:',
      ru: 'Длина дуги:',
      hy: 'Աղեղի երկարություն:'
    },
    'volume': {
      en: 'Volume:',
      ru: 'Объем:',
      hy: 'Ծավալ:'
    },
    'materials': {
      en: 'Materials',
      ru: 'Материалы',
      hy: 'Նյութեր'
    },
    'material': {
      en: 'Material:',
      ru: 'Материал:',
      hy: 'Նյութ:'
    },
    'quantity': {
      en: 'Quantity:',
      ru: 'Количество:',
      hy: 'Քանակ:'
    },
    'weight': {
      en: 'Weight:',
      ru: 'Вес:',
      hy: 'Քաշ:'
    },
    'totalCost': {
      en: 'Cost:',
      ru: 'Стоимость:',
      hy: 'Արժեք:'
    },
    'properties': {
      en: 'Properties',
      ru: 'Свойства',
      hy: 'Հատկություններ'
    },
    'foci': {
      en: 'Foci:',
      ru: 'Фокусы:',
      hy: 'Ֆոկուսներ:'
    },
    'eccentricity': {
      en: 'Eccentricity:',
      ru: 'Эксцентриситет:',
      hy: 'Էքսցենտրիսիտետ:'
    },
    'asymptotes': {
      en: 'Asymptotes:',
      ru: 'Асимптоты:',
      hy: 'Ասիմպտոտներ:'
    },
    'structuralAnalysis': {
      en: 'Structural Analysis',
      ru: 'Структурный анализ',
      hy: 'Կառուցվածքային վերլուծություն'
    },
    'maxStress': {
      en: 'Max stress:',
      ru: 'Макс. напряжение:',
      hy: 'Առավելագույն լարվածություն:'
    },
    'safetyFactor': {
      en: 'Safety factor:',
      ru: 'Коэф. безопасности:',
      hy: 'Անվտանգության գործակից:'
    },
    'deflection': {
      en: 'Deflection:',
      ru: 'Прогиб:',
      hy: 'Շեղում:'
    },
    'bucklingLoad': {
      en: 'Critical load:',
      ru: 'Критическая нагрузка:',
      hy: 'Կրիտիկական բեռ:'
    },
    'naturalFrequency': {
      en: 'Natural frequency:',
      ru: 'Собственная частота:',
      hy: 'Բնական հաճախականություն:'
    },
    'recommendations': {
      en: 'Structure recommendations',
      ru: 'Рекомендации по конструкции',
      hy: 'Կոնստրուկցիայի առաջարկություններ'
    },
    'currentValue': {
      en: 'Current value:',
      ru: 'Текущее значение:',
      hy: 'Ընթացիկ արժեք:'
    },
    'recommended': {
      en: 'Recommended:',
      ru: 'Рекомендуемое:',
      hy: 'Առաջարկվող:'
    },
    'recommendation': {
      en: 'Recommendation:',
      ru: 'Рекомендация:',
      hy: 'Առաջարկություն:'
    },
    'critical': {
      en: 'Critical',
      ru: 'Критично',
      hy: 'Կրիտիկական'
    },
    'high': {
      en: 'High',
      ru: 'Высокая',
      hy: 'Բարձր'
    },
    'medium': {
      en: 'Medium',
      ru: 'Средняя',
      hy: 'Միջին'
    },
    'low': {
      en: 'Low',
      ru: 'Низкая',
      hy: 'Ցածր'
    },
    
    // Export
    'export': {
      en: 'Export results',
      ru: 'Экспорт результатов',
      hy: 'Արդյունքների արտահանում'
    },
    
    // Export labels
    'export.curveType': {
      en: 'Curve type:',
      ru: 'Тип кривой:',
      hy: 'Կորի տեսակ:'
    },
    'export.equation': {
      en: 'Equation:',
      ru: 'Уравнение:',
      hy: 'Հավասարում:'
    },
    'export.measurements': {
      en: 'Measurements:',
      ru: 'Измерения:',
      hy: 'Չափումներ:'
    },
    'export.materialEstimate': {
      en: 'Material estimate:',
      ru: 'Оценка материалов:',
      hy: 'Նյութերի գնահատում:'
    },
    'export.material': {
      en: 'Material:',
      ru: 'Материал:',
      hy: 'Նյութ:'
    },
    'export.quantity': {
      en: 'Quantity:',
      ru: 'Количество:',
      hy: 'Քանակ:'
    },
    'export.weight': {
      en: 'Weight:',
      ru: 'Вес:',
      hy: 'Քաշ:'
    },
    'export.cost': {
      en: 'Cost:',
      ru: 'Стоимость:',
      hy: 'Արժեք:'
    },
    'export.structuralAnalysis': {
      en: 'Structural analysis',
      ru: 'Структурный анализ',
      hy: 'Կառուցվածքային վերլուծություն'
    },
    'export.parameter': {
      en: 'Parameter',
      ru: 'Параметр',
      hy: 'Պարամետր'
    },
    'export.value': {
      en: 'Value',
      ru: 'Значение',
      hy: 'Արժեք'
    },
    'export.unknown': {
      en: 'unknown',
      ru: 'неизвестно',
      hy: 'անհայտ'
    },
    'export.recommendations': {
      en: 'Recommendations',
      ru: 'Рекомендации',
      hy: 'Առաջարկություններ'
    },
    'export.type': {
      en: 'Type',
      ru: 'Тип',
      hy: 'Տեսակ'
    },
    'export.title': {
      en: 'Title',
      ru: 'Заголовок',
      hy: 'Վերնագիր'
    },
    'export.description': {
      en: 'Description',
      ru: 'Описание',
      hy: 'Նկարագրություն'
    },
    'export.current': {
      en: 'Current',
      ru: 'Текущее',
      hy: 'Ընթացիկ'
    },
    'export.recommended': {
      en: 'Recommended',
      ru: 'Рекомендуемое',
      hy: 'Առաջարկվող'
    },
    
    // Errors
    'selectMaterialError': {
      en: 'Select material!',
      ru: 'Выберите материал!',
      hy: 'Ընտրեք նյութ:'
    },
    'calculationError': {
      en: 'Calculation error. Check the entered parameters.',
      ru: 'Ошибка при расчете. Проверьте введенные параметры.',
      hy: 'Հաշվարկի սխալ: Ստուգեք մուտքագրված պարամետրերը:'
    },
    
    // Language names
    'langEn': {
      en: 'English',
      ru: 'Английский',
      hy: 'Անգլերեն'
    },
    'langRu': {
      en: 'Russian',
      ru: 'Русский',
      hy: 'Ռուսերեն'
    },
    'langHy': {
      en: 'Armenian',
      ru: 'Армянский',
      hy: 'Հայերեն'
    },
    
    // Material names
    'material.concrete': {
      en: 'Concrete',
      ru: 'Бетон',
      hy: 'Բետոն'
    },
    'material.steel': {
      en: 'Steel',
      ru: 'Сталь',
      hy: 'Պողպատ'
    },
    'material.aluminum': {
      en: 'Aluminum',
      ru: 'Алюминий',
      hy: 'Ալյումին'
    },
    'material.glass': {
      en: 'Glass',
      ru: 'Стекло',
      hy: 'Ապակի'
    },
    'material.wood': {
      en: 'Wood',
      ru: 'Дерево',
      hy: 'Փայտ'
    },
    'material.brick': {
      en: 'Brick',
      ru: 'Кирпич',
      hy: 'Աղյուս'
    },
    'material.polycarbonate': {
      en: 'Polycarbonate',
      ru: 'Поликарбонат',
      hy: 'Պոլիկարբոնատ'
    },
    'material.composite': {
      en: 'Composite materials',
      ru: 'Композитные материалы',
      hy: 'Կոմպոզիտային նյութեր'
    },
    
    // Recommendation titles
    'rec.stressExceeded': {
      en: 'Material strength exceeded!',
      ru: 'Превышена прочность материала!',
      hy: 'Նյութի ամրությունը գերազանցվել է!'
    },
    'rec.highStress': {
      en: 'High stress level',
      ru: 'Высокий уровень напряжения',
      hy: 'Բարձր լարվածության մակարդակ'
    },
    'rec.criticalSafety': {
      en: 'Critical safety factor!',
      ru: 'Критический запас прочности!',
      hy: 'Կրիտիկական անվտանգության գործակից!'
    },
    'rec.insufficientSafety': {
      en: 'Insufficient safety factor',
      ru: 'Недостаточный запас прочности',
      hy: 'Անբավարար անվտանգության գործակից'
    },
    'rec.goodSafety': {
      en: 'Excellent safety factor',
      ru: 'Отличный запас прочности',
      hy: 'Գերազանց անվտանգության գործակից'
    },
    'rec.deflectionExceeded': {
      en: 'Deflection exceeds norm',
      ru: 'Прогиб превышает норму',
      hy: 'Շեղումը գերազանցում է նորման'
    },
    'rec.insufficientThickness': {
      en: 'Insufficient thickness',
      ru: 'Недостаточная толщина',
      hy: 'Անբավարար հաստություն'
    },
    'rec.insufficientThicknessForHeight': {
      en: 'Insufficient thickness for large height',
      ru: 'Недостаточная толщина для большой высоты',
      hy: 'Անբավարար հաստություն մեծ բարձրության համար'
    },
    'rec.heightExceeded': {
      en: 'Height exceeds recommended',
      ru: 'Высота превышает рекомендуемую',
      hy: 'Բարձրությունը գերազանցում է առաջարկվողը'
    },
    'rec.largeSpanRatio': {
      en: 'Large span to height ratio',
      ru: 'Большое соотношение пролета к высоте',
      hy: 'Բացվածքի և բարձրության մեծ հարաբերակցություն'
    },
    'rec.highArch': {
      en: 'High arch',
      ru: 'Высокая дуга',
      hy: 'Բարձր աղեղ'
    },
    'rec.thinConcrete': {
      en: 'Thin concrete structure with large span',
      ru: 'Тонкая бетонная конструкция при большом пролете',
      hy: 'Բարակ բետոնե կոնստրուկցիա մեծ բացվածքով'
    },
    'rec.thinSteel': {
      en: 'Thin steel structure',
      ru: 'Тонкая стальная конструкция',
      hy: 'Բարակ պողպատե կոնստրուկցիա'
    },
    
    // Recommendation descriptions patterns
    'rec.immediatelyIncrease': {
      en: 'Immediately increase',
      ru: 'Немедленно увеличьте',
      hy: 'Անմիջապես ավելացրեք'
    },
    'rec.recommendedIncrease': {
      en: 'Recommended to increase',
      ru: 'Рекомендуется увеличить',
      hy: 'Առաջարկվում է ավելացնել'
    },
    'rec.increaseThickness': {
      en: 'increase thickness',
      ru: 'увеличьте толщину',
      hy: 'ավելացրեք հաստությունը'
    },
    'rec.selectStrongerMaterial': {
      en: 'or select a stronger material',
      ru: 'или выберите более прочный материал',
      hy: 'կամ ընտրեք ավելի ամուր նյութ'
    },
    'rec.forSafety': {
      en: 'for safety',
      ru: 'для безопасности',
      hy: 'անվտանգության համար'
    },
    'rec.structureHas': {
      en: 'Structure has',
      ru: 'Конструкция имеет',
      hy: 'Կոնստրուկցիան ունի'
    },
    'rec.sufficientStrength': {
      en: 'sufficient strength reserve',
      ru: 'достаточный запас прочности',
      hy: 'բավարար ամրության պահուստ'
    },
    
    // Recommendation description patterns
    'rec.maxStressExceeds': {
      en: 'Maximum stress ({0} MPa) exceeds material strength ({1} MPa)',
      ru: 'Максимальное напряжение ({0} МПа) превышает прочность материала ({1} МПа)',
      hy: 'Առավելագույն լարումը ({0} ՄՊա) գերազանցում է նյութի ամրությունը ({1} ՄՊա)'
    },
    'rec.stressUsesPercent': {
      en: 'Stress ({0} MPa) uses {1}% of material strength',
      ru: 'Напряжение ({0} МПа) использует {1}% прочности материала',
      hy: 'Լարումը ({0} ՄՊա) օգտագործում է նյութի ամրության {1}%'
    },
    'rec.safetyFactorTooLow': {
      en: 'Safety factor ({0}) is too low',
      ru: 'Коэффициент запаса ({0}) слишком мал',
      hy: 'Անվտանգության գործակիցը ({0}) շատ ցածր է'
    },
    'rec.safetyFactorBelowMin': {
      en: 'Safety factor ({0}) is below recommended minimum ({1})',
      ru: 'Коэффициент запаса ({0}) ниже рекомендуемого минимума ({1})',
      hy: 'Անվտանգության գործակիցը ({0}) ցածր է առաջարկվող նվազագույնից ({1})'
    },
    'rec.safetyFactorMeets': {
      en: 'Safety factor ({0}) meets standards',
      ru: 'Коэффициент запаса ({0}) соответствует нормам',
      hy: 'Անվտանգության գործակիցը ({0}) համապատասխանում է նորմերին'
    },
    'rec.deflectionExceeds': {
      en: 'Deflection ({0} mm) exceeds allowable value ({1} mm) by {2} times',
      ru: 'Прогиб ({0} мм) превышает допустимое значение ({1} мм) в {2} раз',
      hy: 'Շեղումը ({0} մմ) գերազանցում է թույլատրելի արժեքը ({1} մմ) {2} անգամ'
    },
    'rec.thicknessLessThanMin': {
      en: 'Thickness ({0} cm) is less than minimum allowable ({1} cm)',
      ru: 'Толщина ({0} см) меньше минимально допустимой ({1} см)',
      hy: 'Հաստությունը ({0} սմ) ցածր է նվազագույն թույլատրելիից ({1} սմ)'
    },
    'rec.heightRequiresThickness': {
      en: 'At height {0}m, minimum thickness of {1}cm is required',
      ru: 'При высоте {0}м требуется минимальная толщина {1}см',
      hy: '{0}մ բարձրության դեպքում պահանջվում է նվազագույն {1}սմ հաստություն'
    },
    'rec.heightExceedsMax': {
      en: 'Structure height ({0}m) exceeds recommended maximum ({1}m)',
      ru: 'Высота конструкции ({0}м) превышает рекомендуемый максимум ({1}м)',
      hy: 'Կոնստրուկցիայի բարձրությունը ({0}մ) գերազանցում է առաջարկվող առավելագույնը ({1}մ)'
    },
    'rec.spanRatioTooLarge': {
      en: 'Span to height ratio ({0}) is too large',
      ru: 'Соотношение пролета к высоте ({0}) слишком большое',
      hy: 'Բացվածքի և բարձրության հարաբերակցությունը ({0}) շատ մեծ է'
    },
    'rec.highArchRecommendation': {
      en: 'At this height ({0}m), it is recommended to increase thickness for stability',
      ru: 'При такой высоте ({0}м) рекомендуется увеличить толщину для устойчивости',
      hy: 'Այս բարձրության ({0}մ) դեպքում առաջարկվում է ավելացնել հաստությունը կայունության համար'
    },
    'rec.concreteThicknessInsufficient': {
      en: 'For concrete arch with span {0}m, thickness {1}cm may be insufficient',
      ru: 'Для бетонной арки с пролетом {0}м толщина {1}см может быть недостаточной',
      hy: '{0}մ բացվածքով բետոնե աղեղի համար {1}սմ հաստությունը կարող է անբավարար լինել'
    },
    'rec.steelRequiresCheck': {
      en: 'Steel structures require additional check for local buckling',
      ru: 'Стальные конструкции требуют дополнительной проверки на местное выпучивание',
      hy: 'Պողպատե կոնստրուկցիաները պահանջում են լրացուցիչ ստուգում տեղական կորության համար'
    },
    
    // Recommendation suggestion patterns
    'rec.suggestion.increaseThickness30': {
      en: 'Immediately increase structure thickness by at least 30% or select a stronger material (strength > {0} MPa)',
      ru: 'Немедленно увеличьте толщину конструкции минимум на 30% или выберите более прочный материал (прочность > {0} МПа)',
      hy: 'Անմիջապես ավելացրեք կոնստրուկցիայի հաստությունը առնվազն 30%-ով կամ ընտրեք ավելի ամուր նյութ (ամրություն > {0} ՄՊա)'
    },
    'rec.suggestion.increaseThicknessPercent': {
      en: 'It is recommended to increase thickness by {0}% for safety',
      ru: 'Рекомендуется увеличить толщину на {0}% для безопасности',
      hy: 'Առաջարկվում է ավելացնել հաստությունը {0}%-ով անվտանգության համար'
    },
    'rec.suggestion.increaseThickness50': {
      en: 'Increase structure thickness by at least 50% or reduce load',
      ru: 'Увеличьте толщину конструкции минимум на 50% или снизьте нагрузку',
      hy: 'Ավելացրեք կոնստրուկցիայի հաստությունը առնվազն 50%-ով կամ նվազեցրեք բեռը'
    },
    'rec.suggestion.increaseThicknessForNorms': {
      en: 'Increase thickness by {0}% to meet standards',
      ru: 'Увеличьте толщину на {0}% для соответствия нормам',
      hy: 'Ավելացրեք հաստությունը {0}%-ով նորմերին համապատասխանելու համար'
    },
    'rec.suggestion.structureHasStrength': {
      en: 'Structure has sufficient strength reserve',
      ru: 'Конструкция имеет достаточный запас прочности',
      hy: 'Կոնստրուկցիան ունի բավարար ամրության պահուստ'
    },
    'rec.suggestion.increaseThicknessTimes': {
      en: 'Increase thickness by {0} times or increase material stiffness to reduce deflection by {1}%',
      ru: 'Увеличьте толщину в {0} раза или увеличьте жесткость материала для уменьшения прогиба на {1}%',
      hy: 'Ավելացրեք հաստությունը {0} անգամ կամ ավելացրեք նյութի կոշտությունը շեղումը {1}%-ով նվազեցնելու համար'
    },
    'rec.suggestion.increaseThicknessToMin': {
      en: 'Increase thickness to at least {0} cm to ensure safety',
      ru: 'Увеличьте толщину минимум до {0} см для обеспечения безопасности',
      hy: 'Ավելացրեք հաստությունը առնվազն {0} սմ անվտանգություն ապահովելու համար'
    },
    'rec.suggestion.increaseThicknessForHeight': {
      en: 'For height {0}m, it is necessary to increase thickness to {1}cm or more for stability',
      ru: 'Для высоты {0}м необходимо увеличить толщину до {1}см и более для устойчивости',
      hy: '{0}մ բարձրության համար անհրաժեշտ է ավելացնել հաստությունը մինչև {1}սմ և ավելի կայունության համար'
    },
    'rec.suggestion.reduceHeightOrIncreaseThickness': {
      en: 'It is recommended to reduce height or significantly increase thickness (minimum {0}cm)',
      ru: 'Рекомендуется снизить высоту или значительно увеличить толщину (минимум {0}см)',
      hy: 'Առաջարկվում է նվազեցնել բարձրությունը կամ զգալիորեն ավելացնել հաստությունը (նվազագույնը {0}սմ)'
    },
    'rec.suggestion.increaseHeightOrAddSupports': {
      en: 'It is recommended to increase arch height or add additional supports',
      ru: 'Рекомендуется увеличить высоту дуги или добавить дополнительные опоры',
      hy: 'Առաջարկվում է ավելացնել աղեղի բարձրությունը կամ ավելացնել լրացուցիչ հենարաններ'
    },
    'rec.suggestion.recommendedThicknessForHeight': {
      en: 'At height {0}m, it is recommended to have thickness of at least {1}m',
      ru: 'При высоте {0}м рекомендуется толщина не менее {1}м',
      hy: '{0}մ բարձրության դեպքում առաջարկվում է առնվազն {1}մ հաստություն'
    },
    'rec.suggestion.increaseThicknessOrReinforce': {
      en: 'It is recommended to increase thickness to {0}cm or use reinforcement',
      ru: 'Рекомендуется увеличить толщину до {0}см или использовать армирование',
      hy: 'Առաջարկվում է ավելացնել հաստությունը մինչև {0}սմ կամ օգտագործել ամրացում'
    },
    'rec.suggestion.ensureTransverseReinforcement': {
      en: 'Make sure the structure has sufficient transverse reinforcement',
      ru: 'Убедитесь, что конструкция имеет достаточное поперечное армирование',
      hy: 'Համոզվեք, որ կոնստրուկցիան ունի բավարար լայնակի ամրացում'
    }
  };

  setLanguage(lang: Language): void {
    this.currentLanguage = lang;
    localStorage.setItem('architectural-calculator-lang', lang);
  }

  getLanguage(): Language {
    const saved = localStorage.getItem('architectural-calculator-lang') as Language;
    if (saved && ['en', 'ru', 'hy'].includes(saved)) {
      this.currentLanguage = saved;
    }
    return this.currentLanguage;
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLanguage] || translation['ru'];
  }

  getCurveTypeDescription(curveType: string): string {
    const descriptions: Translations = {
      'parabola': {
        en: 'Arches, bridges, stadium roofs, canopies',
        ru: 'Арки, мосты, крыши стадионов, навесы',
        hy: 'Արջեր, կամուրջներ, մարզադաշտերի տանիքներ, հովանոցներ'
      },
      'ellipse': {
        en: 'Domes, vaults, arched roofs, amphitheaters',
        ru: 'Купола, своды, арочные крыши, амфитеатры',
        hy: 'Գմբեթներ, թաղեր, կամարավոր տանիքներ, ամֆիթատրոններ'
      },
      'hyperbola': {
        en: 'Towers, shells, cable structures, funnel-shaped roofs',
        ru: 'Башни, оболочки, вантовые конструкции, воронкообразные крыши',
        hy: 'Աշտարակներ, պատյաններ, մալուխային կոնստրուկցիաներ, ձագարաձև տանիքներ'
      }
    };
    
    const desc = descriptions[curveType as keyof typeof descriptions];
    if (!desc) return '';
    return desc[this.currentLanguage] || desc['ru'];
  }

  getMaterialName(materialName: string): string {
    const materialMap: { [key: string]: string } = {
      'Бетон': 'material.concrete',
      'Сталь': 'material.steel',
      'Алюминий': 'material.aluminum',
      'Стекло': 'material.glass',
      'Дерево': 'material.wood',
      'Кирпич': 'material.brick',
      'Поликарбонат': 'material.polycarbonate',
      'Композитные материалы': 'material.composite'
    };
    
    const key = materialMap[materialName];
    if (key) {
      return this.translate(key);
    }
    return materialName; // Если материал не найден, возвращаем оригинальное название
  }
}
