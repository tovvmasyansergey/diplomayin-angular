import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculationResult, Material, StructuralAnalysis, Recommendation } from './interfaces/architectural.interface';
import { RecommendationService } from './services/recommendation.service';
import { ArchitecturalCalculatorApiService } from './services/architectural-calculator-api.service';
import { TranslationService, Language } from './services/translation.service';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-architectural-calculator',
  templateUrl: './architectural-calculator.html',
  styleUrls: ['./architectural-calculator.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ArchitecturalCalculatorComponent implements OnInit, AfterViewInit, OnDestroy {
  
  selectedCurveType: 'parabola' | 'ellipse' | 'hyperbola' = 'parabola';
  calculationResult: CalculationResult | null = null;
  structuralAnalysis: StructuralAnalysis | null = null;
  materials: Material[] = [];
  recommendations: Recommendation[] = [];
  
  // Параметры для параболы
  parabolaParams = {
    span: 20, // пролёт в метрах
    height: 5, // высота в метрах
    thickness: 0.3 // толщина в метрах
  };
  
  // Параметры для эллипса
  ellipseParams = {
    a: 10, // большая полуось
    b: 6,  // малая полуось
    thickness: 0.3
  };
  
  // Параметры для гиперболы
  hyperbolaParams = {
    a: 5, // расстояние до вершины
    b: 3, // параметр раскрытия
    thickness: 0.2
  };
  
  selectedMaterial: Material | null = null;
  showResults = false;
  currentLanguage: Language = 'ru';

  constructor(
    private calculatorApiService: ArchitecturalCalculatorApiService,
    private recommendationService: RecommendationService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.currentLanguage = this.translationService.getLanguage();
    this.calculatorApiService.getMaterials().subscribe({
      next: (materials) => {
        this.materials = materials;
        this.selectedMaterial = this.materials[0] || null;
      },
      error: (error) => {
        console.error('Ошибка загрузки материалов:', error);
        this.materials = [];
        this.selectedMaterial = null;
      }
    });
  }

  ngAfterViewInit(): void {
    // Инициализация после загрузки view
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onCurveTypeChange(): void {
    this.showResults = false;
    this.calculationResult = null;

    this.calculatorApiService.getMaterialSuggestions(this.selectedCurveType).subscribe({
      next: (suggestedMaterials) => {
        if (suggestedMaterials.length > 0) {
          this.selectedMaterial = suggestedMaterials[0];
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки предложений материалов:', error);
      }
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
  
  /**
   * Конвертация рублей в драмы (примерный курс: 1 RUB = 5.5 AMD)
   */
  convertToDrams(rubles: number): number {
    return Math.round(rubles * 5.5);
  }
  
  /**
   * Конвертация рублей в доллары (примерный курс: 1 USD = 100 RUB)
   */
  convertToDollars(rubles: number): number {
    return Math.round((rubles / 100) * 100) / 100; // Округляем до 2 знаков после запятой
  }
  
  /**
   * Получение цены с учетом валюты
   */
  getPriceWithCurrency(price: number): string {
    if (this.currentLanguage === 'hy') {
      // Для армянского языка конвертируем в драмы
      const drams = this.convertToDrams(price);
      return `֏${drams.toLocaleString('hy-AM')}`;
    } else if (this.currentLanguage === 'en') {
      // Для английского языка конвертируем в доллары
      const dollars = this.convertToDollars(price);
      return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // Для русского языка - рубли со знаком
    return `₽${price.toLocaleString('ru-RU')}`;
  }

  setLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
    this.currentLanguage = lang;
    // Принудительно обновляем представление
    this.cdr.detectChanges();
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  calculate(): void {
    if (!this.selectedMaterial) {
      alert(this.translate('selectMaterialError'));
      return;
    }

    const request = this.buildCalculationRequest();

    this.calculatorApiService.calculate(request).subscribe({
      next: (response) => {
        this.calculationResult = response.calculationResult;
        this.structuralAnalysis = response.structuralAnalysis;
        this.recommendations = response.recommendations || [];
        this.showResults = true;
      },
      error: (error) => {
        console.error('Ошибка расчета:', error);
        alert(this.translate('calculationError'));
      }
    });
  }

  private buildCalculationRequest(): {
    curveType: 'parabola' | 'ellipse' | 'hyperbola';
    language: 'ru' | 'en' | 'hy';
    materialName: string;
    span?: number;
    height?: number;
    thickness?: number;
    a?: number;
    b?: number;
  } {
    if (this.selectedCurveType === 'parabola') {
      return {
        curveType: this.selectedCurveType,
        language: this.currentLanguage,
        materialName: this.selectedMaterial!.name,
        span: this.parabolaParams.span,
        height: this.parabolaParams.height,
        thickness: this.parabolaParams.thickness
      };
    }

    if (this.selectedCurveType === 'ellipse') {
      return {
        curveType: this.selectedCurveType,
        language: this.currentLanguage,
        materialName: this.selectedMaterial!.name,
        a: this.ellipseParams.a,
        b: this.ellipseParams.b,
        thickness: this.ellipseParams.thickness
      };
    }

    return {
      curveType: this.selectedCurveType,
      language: this.currentLanguage,
      materialName: this.selectedMaterial!.name,
      a: this.hyperbolaParams.a,
      b: this.hyperbolaParams.b,
      thickness: this.hyperbolaParams.thickness
    };
  }

  resetCalculation(): void {
    this.calculationResult = null;
    this.structuralAnalysis = null;
    this.recommendations = [];
    this.showResults = false;
  }

  getCurveTypeDescription(): string {
    return this.translationService.getCurveTypeDescription(this.selectedCurveType);
  }

  getSeverityText(severity: string): string {
    switch (severity) {
      case 'critical':
        return this.translate('critical');
      case 'high':
        return this.translate('high');
      case 'medium':
        return this.translate('medium');
      case 'low':
        return this.translate('low');
      default:
        return severity;
    }
  }

  getMaterialName(materialName: string): string {
    return this.translationService.getMaterialName(materialName);
  }

  /**
   * Структурный анализ
   */
  performStructuralAnalysis(): void {
    if (!this.calculationResult || !this.selectedMaterial) return;

    // Упрощенный структурный анализ
    const volume = this.calculationResult.measurements.volume;
    const weight = this.calculationResult.materialEstimate.weight;
    
    // Расчет максимального напряжения (упрощенная формула)
    const maxStress = (weight * 9.81) / (volume * 1000); // МПа
    
    // Расчет коэффициента безопасности
    const safetyFactor = this.selectedMaterial.strength ? 
      this.selectedMaterial.strength / maxStress : 2.5;
    
    // Расчет прогиба (упрощенная формула)
    const deflection = (weight * 9.81 * Math.pow(this.parabolaParams.span || 10, 3)) / 
      (48 * (this.selectedMaterial.elasticity || 30) * 1000 * volume);
    
    // Расчет критической нагрузки на продольный изгиб
    const bucklingLoad = (Math.PI * Math.PI * (this.selectedMaterial.elasticity || 30) * 1000 * volume) / 
      Math.pow(this.parabolaParams.height || 5, 2);
    
    // Расчет собственной частоты колебаний
    const naturalFrequency = Math.sqrt((this.selectedMaterial.elasticity || 30) * 1000 * volume / weight) / (2 * Math.PI);

    this.structuralAnalysis = {
      maxStress,
      safetyFactor,
      deflection,
      bucklingLoad,
      naturalFrequency
    };
  }

  /**
   * Генерация рекомендаций
   */
  generateRecommendations(): void {
    if (!this.structuralAnalysis || !this.calculationResult || !this.selectedMaterial) return;

    // Определяем параметры структуры в зависимости от типа кривой
    let structureParams: any = {};
    if (this.selectedCurveType === 'parabola') {
      structureParams = {
        span: this.parabolaParams.span,
        height: this.parabolaParams.height,
        thickness: this.parabolaParams.thickness
      };
    } else if (this.selectedCurveType === 'ellipse') {
      structureParams = {
        a: this.ellipseParams.a,
        b: this.ellipseParams.b,
        thickness: this.ellipseParams.thickness
      };
    } else if (this.selectedCurveType === 'hyperbola') {
      structureParams = {
        a: this.hyperbolaParams.a,
        b: this.hyperbolaParams.b,
        thickness: this.hyperbolaParams.thickness
      };
    }

    // Передаем TranslationService в RecommendationService через инжекцию
    // Временно используем текущий подход, но обновим рекомендации после генерации
    this.recommendations = this.recommendationService.generateRecommendations(
      this.structuralAnalysis,
      this.calculationResult,
      this.selectedMaterial,
      structureParams
    );
    
    // Переводим заголовки рекомендаций
    this.recommendations = this.recommendations.map(rec => ({
      ...rec,
      title: this.translateRecommendationTitle(rec.title),
      description: this.translateRecommendationDescription(rec.description, rec),
      suggestion: rec.suggestion ? this.translateRecommendationSuggestion(rec.suggestion, rec) : undefined
    }));
  }
  
  private translateRecommendationTitle(title: string): string {
    // Если title уже является ключом перевода (начинается с 'rec.')
    if (title.startsWith('rec.')) {
      return this.translate(title);
    }
    
    // Иначе ищем в маппинге
    const titleMap: { [key: string]: string } = {
      'Превышена прочность материала!': 'rec.stressExceeded',
      'Высокий уровень напряжения': 'rec.highStress',
      'Критический запас прочности!': 'rec.criticalSafety',
      'Недостаточный запас прочности': 'rec.insufficientSafety',
      'Отличный запас прочности': 'rec.goodSafety',
      'Прогиб превышает норму': 'rec.deflectionExceeded',
      'Недостаточная толщина': 'rec.insufficientThickness',
      'Недостаточная толщина для большой высоты': 'rec.insufficientThicknessForHeight',
      'Высота превышает рекомендуемую': 'rec.heightExceeded',
      'Большое соотношение пролета к высоте': 'rec.largeSpanRatio',
      'Высокая дуга': 'rec.highArch',
      'Тонкая бетонная конструкция при большом пролете': 'rec.thinConcrete',
      'Тонкая стальная конструкция': 'rec.thinSteel'
    };
    
    const key = titleMap[title];
    if (key) {
      return this.translate(key);
    }
    return title;
  }
  
  private translateRecommendationDescription(description: string, rec: Recommendation): string {
    // Парсим описание и переводим его
    if (!description) return description;
    
    // Извлекаем числа из описания
    const numbers = description.match(/[\d.]+/g) || [];
    
    // Определяем паттерн перевода на основе содержимого
    if (description.includes('Максимальное напряжение') || description.includes('превышает прочность материала')) {
      // rec.maxStressExceeds
      const maxStress = numbers[0] || '';
      const strength = numbers[1] || '';
      return this.translate('rec.maxStressExceeds').replace('{0}', maxStress).replace('{1}', strength);
    } else if (description.includes('Напряжение') && description.includes('использует') && description.includes('%')) {
      // rec.stressUsesPercent
      const stress = numbers[0] || '';
      const percent = numbers[1] || '';
      return this.translate('rec.stressUsesPercent').replace('{0}', stress).replace('{1}', percent);
    } else if (description.includes('Коэффициент запаса') && description.includes('слишком мал')) {
      // rec.safetyFactorTooLow
      const factor = numbers[0] || '';
      return this.translate('rec.safetyFactorTooLow').replace('{0}', factor);
    } else if (description.includes('Коэффициент запаса') && description.includes('ниже рекомендуемого')) {
      // rec.safetyFactorBelowMin
      const factor = numbers[0] || '';
      const min = numbers[1] || '';
      return this.translate('rec.safetyFactorBelowMin').replace('{0}', factor).replace('{1}', min);
    } else if (description.includes('Коэффициент запаса') && description.includes('соответствует нормам')) {
      // rec.safetyFactorMeets
      const factor = numbers[0] || '';
      return this.translate('rec.safetyFactorMeets').replace('{0}', factor);
    } else if (description.includes('Прогиб') && description.includes('превышает допустимое')) {
      // rec.deflectionExceeded
      const deflection = numbers[0] || '';
      const maxDeflection = numbers[1] || '';
      const ratio = numbers[2] || '';
      return this.translate('rec.deflectionExceeds').replace('{0}', deflection).replace('{1}', maxDeflection).replace('{2}', ratio);
    } else if (description.includes('Толщина') && description.includes('меньше минимально допустимой')) {
      // rec.thicknessLessThanMin
      const thickness = numbers[0] || '';
      const min = numbers[1] || '';
      return this.translate('rec.thicknessLessThanMin').replace('{0}', thickness).replace('{1}', min);
    } else if (description.includes('При высоте') && description.includes('требуется минимальная толщина')) {
      // rec.heightRequiresThickness
      const height = numbers[0] || '';
      const thickness = numbers[1] || '';
      return this.translate('rec.heightRequiresThickness').replace('{0}', height).replace('{1}', thickness);
    } else if (description.includes('Высота конструкции') && description.includes('превышает рекомендуемый максимум')) {
      // rec.heightExceedsMax
      const height = numbers[0] || '';
      const max = numbers[1] || '';
      return this.translate('rec.heightExceedsMax').replace('{0}', height).replace('{1}', max);
    } else if (description.includes('Соотношение пролета к высоте') && description.includes('слишком большое')) {
      // rec.spanRatioTooLarge
      const ratio = numbers[0] || '';
      return this.translate('rec.spanRatioTooLarge').replace('{0}', ratio);
    } else if (description.includes('При такой высоте') && description.includes('рекомендуется увеличить толщину')) {
      // rec.highArchRecommendation
      const height = numbers[0] || '';
      return this.translate('rec.highArchRecommendation').replace('{0}', height);
    } else if (description.includes('Для бетонной арки') && description.includes('толщина') && description.includes('может быть недостаточной')) {
      // rec.concreteThicknessInsufficient
      const span = numbers[0] || '';
      const thickness = numbers[1] || '';
      return this.translate('rec.concreteThicknessInsufficient').replace('{0}', span).replace('{1}', thickness);
    } else if (description.includes('Стальные конструкции требуют')) {
      // rec.steelRequiresCheck
      return this.translate('rec.steelRequiresCheck');
    }
    
    return description;
  }
  
  private translateRecommendationSuggestion(suggestion: string, rec: Recommendation): string {
    if (!suggestion) return suggestion;
    
    // Извлекаем числа из предложения
    const numbers = suggestion.match(/[\d.]+/g) || [];
    
    // Определяем паттерн перевода
    if (suggestion.includes('Немедленно увеличьте') && suggestion.includes('30%')) {
      // rec.suggestion.increaseThickness30
      const strength = numbers[numbers.length - 1] || '';
      return this.translate('rec.suggestion.increaseThickness30').replace('{0}', strength);
    } else if (suggestion.includes('Рекомендуется увеличить толщину на') && suggestion.includes('% для безопасности')) {
      // rec.suggestion.increaseThicknessPercent
      const percent = numbers[0] || '';
      return this.translate('rec.suggestion.increaseThicknessPercent').replace('{0}', percent);
    } else if (suggestion.includes('Увеличьте толщину конструкции минимум на 50%')) {
      // rec.suggestion.increaseThickness50
      return this.translate('rec.suggestion.increaseThickness50');
    } else if (suggestion.includes('Увеличьте толщину на') && suggestion.includes('% для соответствия нормам')) {
      // rec.suggestion.increaseThicknessForNorms
      const percent = numbers[0] || '';
      return this.translate('rec.suggestion.increaseThicknessForNorms').replace('{0}', percent);
    } else if (suggestion.includes('Конструкция имеет достаточный запас прочности')) {
      // rec.suggestion.structureHasStrength
      return this.translate('rec.suggestion.structureHasStrength');
    } else if (suggestion.includes('Увеличьте толщину в') && suggestion.includes('раза') && suggestion.includes('уменьшения прогиба')) {
      // rec.suggestion.increaseThicknessTimes
      const times = numbers[0] || '';
      const percent = numbers[numbers.length - 1] || '';
      return this.translate('rec.suggestion.increaseThicknessTimes').replace('{0}', times).replace('{1}', percent);
    } else if (suggestion.includes('Увеличьте толщину минимум до') && suggestion.includes('см для обеспечения безопасности')) {
      // rec.suggestion.increaseThicknessToMin
      const thickness = numbers[0] || '';
      return this.translate('rec.suggestion.increaseThicknessToMin').replace('{0}', thickness);
    } else if (suggestion.includes('Для высоты') && suggestion.includes('м необходимо увеличить толщину до') && suggestion.includes('см и более')) {
      // rec.suggestion.increaseThicknessForHeight
      const height = numbers[0] || '';
      const thickness = numbers[1] || '';
      return this.translate('rec.suggestion.increaseThicknessForHeight').replace('{0}', height).replace('{1}', thickness);
    } else if (suggestion.includes('Рекомендуется снизить высоту') || suggestion.includes('значительно увеличить толщину')) {
      // rec.suggestion.reduceHeightOrIncreaseThickness
      const thickness = numbers[0] || '';
      return this.translate('rec.suggestion.reduceHeightOrIncreaseThickness').replace('{0}', thickness);
    } else if (suggestion.includes('Рекомендуется увеличить высоту дуги') || suggestion.includes('добавить дополнительные опоры')) {
      // rec.suggestion.increaseHeightOrAddSupports
      return this.translate('rec.suggestion.increaseHeightOrAddSupports');
    } else if (suggestion.includes('При высоте') && suggestion.includes('м рекомендуется толщина не менее')) {
      // rec.suggestion.recommendedThicknessForHeight
      const height = numbers[0] || '';
      const thickness = numbers[numbers.length - 1] || '';
      return this.translate('rec.suggestion.recommendedThicknessForHeight').replace('{0}', height).replace('{1}', thickness);
    } else if (suggestion.includes('Рекомендуется увеличить толщину до') && suggestion.includes('см или использовать армирование')) {
      // rec.suggestion.increaseThicknessOrReinforce
      const thickness = numbers[0] || '';
      return this.translate('rec.suggestion.increaseThicknessOrReinforce').replace('{0}', thickness);
    } else if (suggestion.includes('Убедитесь, что конструкция имеет достаточное поперечное армирование')) {
      // rec.suggestion.ensureTransverseReinforcement
      return this.translate('rec.suggestion.ensureTransverseReinforcement');
    }
    
    return suggestion;
  }

  /**
   * Helper: get translated curve type name
   */
  private getCurveTypeName(): string {
    return this.calculationResult?.type === 'parabola' ? this.translate('parabola') :
           this.calculationResult?.type === 'ellipse' ? this.translate('ellipse') :
           this.calculationResult?.type === 'hyperbola' ? this.translate('hyperbola') :
           this.translate('export.unknown');
  }

  /**
   * Helper: build summary rows for export
   */
  private getExportRows(): { label: string; value: string }[] {
    const rows: { label: string; value: string }[] = [];
    if (!this.calculationResult) return rows;

    // Curve type & equation
    rows.push({ label: this.translate('export.curveType'), value: this.getCurveTypeName() });
    rows.push({ label: this.translate('export.equation'), value: this.calculationResult.equation });

    // Measurements
    rows.push({ label: this.translate('area'), value: `${this.calculationResult.measurements.area.toFixed(2)} ${this.translate('unitM2')}` });
    rows.push({ label: this.translate('arcLength'), value: `${this.calculationResult.measurements.arcLength.toFixed(2)} ${this.translate('unitM')}` });
    rows.push({ label: this.translate('volume'), value: `${this.calculationResult.measurements.volume.toFixed(2)} ${this.translate('unitM3')}` });

    // Materials
    rows.push({ label: this.translate('material'), value: this.getMaterialName(this.calculationResult.materialEstimate.material.name) });
    rows.push({ label: this.translate('quantity'), value: `${this.calculationResult.materialEstimate.quantity.toFixed(2)} ${this.translate('unitM3')}` });
    rows.push({ label: this.translate('weight'), value: `${this.calculationResult.materialEstimate.weight.toFixed(0)} ${this.translate('unitKg')}` });
    rows.push({ label: this.translate('totalCost'), value: this.getPriceWithCurrency(this.calculationResult.materialEstimate.totalCost) });

    // Structural analysis
    if (this.structuralAnalysis) {
      rows.push({ label: this.translate('maxStress'), value: `${this.structuralAnalysis.maxStress.toFixed(2)} ${this.translate('unitMPa')}` });
      rows.push({ label: this.translate('safetyFactor'), value: this.structuralAnalysis.safetyFactor.toFixed(2) });
      rows.push({ label: this.translate('deflection'), value: `${this.structuralAnalysis.deflection.toFixed(2)} ${this.translate('unitMm')}` });
      rows.push({ label: this.translate('bucklingLoad'), value: `${this.structuralAnalysis.bucklingLoad.toFixed(0)} ${this.translate('unitKN')}` });
      rows.push({ label: this.translate('naturalFrequency'), value: `${this.structuralAnalysis.naturalFrequency.toFixed(2)} ${this.translate('unitHz')}` });
    }

    return rows;
  }

  /**
   * Build styled HTML for PDF export (like the screenshot)
   */
  private buildExportHTML(): string {
    const rows = this.getExportRows();
    const title = this.translate('title').replace(/🏗️\s*/, '');
    const paramHeader = this.translate('export.parameter');
    const valueHeader = this.translate('export.value');

    const tableRows = rows.map(r => `
      <tr>
        <td style="padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); color: #e0e0e0; font-size: 15px;">${r.label}</td>
        <td style="padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 15px; text-align: right; font-weight: 500;">${r.value}</td>
      </tr>
    `).join('');

    // Recommendations section
    let recsHTML = '';
    if (this.recommendations && this.recommendations.length > 0) {
      const recRows = this.recommendations.map(rec => `
        <tr>
          <td style="padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); color: #e0e0e0; font-size: 14px;">${rec.title}</td>
          <td style="padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 14px;">${rec.description}</td>
        </tr>
      `).join('');

      recsHTML = `
        <h2 style="color: #333; margin: 40px 0 15px; font-size: 22px;">${this.translate('export.recommendations')}</h2>
        <table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
          <thead>
            <tr style="background: linear-gradient(135deg, #1a1a3e 0%, #2d2d5e 100%);">
              <th style="padding: 14px 20px; color: #c8a84e; font-size: 16px; font-weight: 600; text-align: left;">${this.translate('export.title')}</th>
              <th style="padding: 14px 20px; color: #c8a84e; font-size: 16px; font-weight: 600; text-align: left;">${this.translate('export.description')}</th>
            </tr>
          </thead>
          <tbody style="background: linear-gradient(180deg, #2a3a5c 0%, #1e2d4a 100%);">
            ${recRows}
          </tbody>
        </table>
      `;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #3a6186 0%, #c8955a 100%);
      margin: 0; padding: 40px;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <h1 style="text-align: center; color: #1a1a3e; font-size: 28px; font-weight: 700; margin-bottom: 30px;">${title}</h1>
  
  <table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
    <thead>
      <tr style="background: linear-gradient(135deg, #1a1a3e 0%, #2d2d5e 100%);">
        <th style="padding: 14px 20px; color: #c8a84e; font-size: 16px; font-weight: 600; text-align: left;">${paramHeader}</th>
        <th style="padding: 14px 20px; color: #c8a84e; font-size: 16px; font-weight: 600; text-align: right;">${valueHeader}</th>
      </tr>
    </thead>
    <tbody style="background: linear-gradient(180deg, #2a3a5c 0%, #1e2d4a 100%);">
      ${tableRows}
    </tbody>
  </table>

  ${recsHTML}

  <p style="text-align: center; color: #555; margin-top: 30px; font-size: 12px;">
    ${new Date().toLocaleDateString(this.currentLanguage === 'hy' ? 'hy-AM' : this.currentLanguage === 'en' ? 'en-US' : 'ru-RU')}
  </p>
</body>
</html>`;
  }

  /**
   * Экспорт результатов в различных форматах
   */
  exportResults(format: 'pdf' | 'excel' | 'word' | 'json'): void {
    if (!this.calculationResult) return;

    switch (format) {
      case 'json':
        this.exportToJSON();
        break;
      case 'pdf':
        this.exportToPDF();
        break;
      case 'excel':
        this.exportToExcel();
        break;
      case 'word':
        this.exportToWord();
        break;
    }
  }

  private exportToJSON(): void {
    if (!this.calculationResult) return;
    const data = {
      type: this.calculationResult.type,
      equation: this.calculationResult.equation,
      parameters: this.calculationResult.parameters,
      measurements: this.calculationResult.measurements,
      materialEstimate: {
        material: this.calculationResult.materialEstimate.material.name,
        quantity: this.calculationResult.materialEstimate.quantity,
        weight: this.calculationResult.materialEstimate.weight,
        totalCost: this.calculationResult.materialEstimate.totalCost
      },
      structuralAnalysis: this.structuralAnalysis,
      recommendations: this.recommendations?.map(r => ({
        type: r.type, severity: r.severity, title: r.title,
        description: r.description, suggestion: r.suggestion
      })),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, `architectural_calculation_${this.selectedCurveType}_${Date.now()}.json`);
  }

  private exportToPDF(): void {
    const html = this.buildExportHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 600);
    }
  }

  private exportToExcel(): void {
    if (!this.calculationResult) return;
    const wb = XLSX.utils.book_new();
    const rows = this.getExportRows();

    // Main data sheet
    const mainData: (string | number)[][] = [
      [this.translate('title').replace(/🏗️\s*/, '')],
      [],
      [this.translate('export.parameter'), this.translate('export.value')]
    ];
    rows.forEach(r => mainData.push([r.label, r.value]));

    const ws = XLSX.utils.aoa_to_sheet(mainData);
    // Set column widths
    ws['!cols'] = [{ wch: 35 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, this.translate('results').replace(':', ''));

    // Recommendations sheet
    if (this.recommendations && this.recommendations.length > 0) {
      const recData: string[][] = [
        [this.translate('export.recommendations')],
        [],
        [this.translate('export.title'), this.translate('export.description'), this.translate('recommendation')]
      ];
      this.recommendations.forEach(rec => {
        recData.push([rec.title, rec.description, rec.suggestion || '']);
      });
      const wsRec = XLSX.utils.aoa_to_sheet(recData);
      wsRec['!cols'] = [{ wch: 35 }, { wch: 50 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsRec, this.translate('export.recommendations'));
    }

    const filename = `architectural_calculation_${this.selectedCurveType}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  private async exportToWord(): Promise<void> {
    if (!this.calculationResult) return;
    const rows = this.getExportRows();

    const DARK_BG = '1A1A3E';
    const GOLD_TEXT = 'C8A84E';

    // Header row for tables
    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: this.translate('export.parameter'), bold: true, color: GOLD_TEXT, font: 'Segoe UI', size: 24 })] })],
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: DARK_BG }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: this.translate('export.value'), bold: true, color: GOLD_TEXT, font: 'Segoe UI', size: 24 })], alignment: AlignmentType.RIGHT })],
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: DARK_BG }
        })
      ]
    });

    // Data rows
    const dataRows = rows.map(r =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: r.label, font: 'Segoe UI', size: 22 })] })],
            borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: r.value, font: 'Segoe UI', size: 22 })], alignment: AlignmentType.RIGHT })],
            borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }
          })
        ]
      })
    );

    const children: (Paragraph | Table)[] = [
      // Title
      new Paragraph({
        children: [new TextRun({ text: this.translate('title').replace(/🏗️\s*/, ''), bold: true, font: 'Segoe UI', size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      // Main table
      new Table({ rows: [headerRow, ...dataRows] })
    ];

    // Recommendations
    if (this.recommendations && this.recommendations.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: this.translate('export.recommendations'), bold: true, font: 'Segoe UI', size: 28 })],
          spacing: { before: 400, after: 200 }
        })
      );

      const recHeaderRow = new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: this.translate('export.title'), bold: true, color: GOLD_TEXT, font: 'Segoe UI', size: 22 })] })],
            shading: { type: ShadingType.CLEAR, fill: DARK_BG }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: this.translate('export.description'), bold: true, color: GOLD_TEXT, font: 'Segoe UI', size: 22 })] })],
            shading: { type: ShadingType.CLEAR, fill: DARK_BG }
          })
        ]
      });

      const recDataRows = this.recommendations.map(rec =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: rec.title, font: 'Segoe UI', size: 20 })] })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: rec.description, font: 'Segoe UI', size: 20 })] })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }
            })
          ]
        })
      );

      children.push(new Table({ rows: [recHeaderRow, ...recDataRows] }));
    }

    // Date
    children.push(
      new Paragraph({
        children: [new TextRun({
          text: new Date().toLocaleDateString(this.currentLanguage === 'hy' ? 'hy-AM' : this.currentLanguage === 'en' ? 'en-US' : 'ru-RU'),
          font: 'Segoe UI', size: 18, color: '888888'
        })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      })
    );

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `architectural_calculation_${this.selectedCurveType}_${Date.now()}.docx`);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Получить иконку для рекомендации
   */
  getRecommendationIcon(type: string): string {
    return this.recommendationService.getRecommendationIcon(type);
  }

  /**
   * Получить цвет для уровня серьезности
   */
  getSeverityColor(severity: string): string {
    return this.recommendationService.getSeverityColor(severity);
  }

}