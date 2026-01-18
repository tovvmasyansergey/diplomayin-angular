import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculationResult, Material, ArchitecturalStructure, StructuralAnalysis, VisualizationSettings, Recommendation } from './interfaces/architectural.interface';
import { ArchitecturalCalculationsService } from './services/architectural-calculations.service';
import { MaterialCalculatorService } from './services/material-calculator.service';
import { RecommendationService } from './services/recommendation.service';
import { TranslationService, Language } from './services/translation.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
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
    private calculationsService: ArchitecturalCalculationsService,
    private materialService: MaterialCalculatorService,
    private recommendationService: RecommendationService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.materials = this.materialService.getAllMaterials();
    this.selectedMaterial = this.materials[0]; // Бетон по умолчанию
    this.currentLanguage = this.translationService.getLanguage();
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
    
    // Обновляем предложения материалов
    const suggestedMaterials = this.materialService.getMaterialSuggestions(this.selectedCurveType);
    if (suggestedMaterials.length > 0) {
      this.selectedMaterial = suggestedMaterials[0];
    }
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
    // Если есть результаты, перегенерируем рекомендации с новым языком
    if (this.showResults && this.calculationResult && this.structuralAnalysis) {
      this.generateRecommendations();
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  calculate(): void {
    if (!this.selectedMaterial) {
      alert(this.translate('selectMaterialError'));
      return;
    }

    try {
      switch (this.selectedCurveType) {
        case 'parabola':
          this.calculationResult = this.calculationsService.calculateParabola(
            this.parabolaParams.span,
            this.parabolaParams.height,
            this.parabolaParams.thickness,
            this.selectedMaterial
          );
          break;
          
        case 'ellipse':
          this.calculationResult = this.calculationsService.calculateEllipse(
            this.ellipseParams.a,
            this.ellipseParams.b,
            this.ellipseParams.thickness,
            this.selectedMaterial
          );
          break;
          
        case 'hyperbola':
          this.calculationResult = this.calculationsService.calculateHyperbola(
            this.hyperbolaParams.a,
            this.hyperbolaParams.b,
            this.hyperbolaParams.thickness,
            this.selectedMaterial
          );
          break;
      }
      
      this.showResults = true;
      
      // Выполняем структурный анализ
      this.performStructuralAnalysis();
      
      // Генерируем рекомендации
      this.generateRecommendations();
      
    } catch (error) {
      console.error('Ошибка расчета:', error);
      alert(this.translate('calculationError'));
    }
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
   * Экспорт результатов в различных форматах
   */
  exportResults(format: 'pdf' | 'excel' | 'word' | 'json'): void {
    if (!this.calculationResult) return;
    
    const data = {
      type: this.calculationResult.type,
      equation: this.calculationResult.equation,
      parameters: this.calculationResult.parameters,
      measurements: this.calculationResult.measurements,
      materialEstimate: this.calculationResult.materialEstimate,
      structuralAnalysis: this.structuralAnalysis,
      timestamp: new Date().toISOString()
    };
    
    switch (format) {
      case 'json':
        this.exportToJSON(data);
        break;
      case 'pdf':
        this.exportToPDF(data);
        break;
      case 'excel':
        this.exportToExcel(data);
        break;
      case 'word':
        this.exportToWord(data);
        break;
    }
  }

  private exportToJSON(data: any): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, `architectural_calculation_${this.selectedCurveType}_${Date.now()}.json`);
  }

  private exportToPDF(data: any): void {
    const doc = new jsPDF.jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Заголовок
    doc.setFontSize(18);
    doc.text(this.translate('title'), pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    const curveTypeName = this.calculationResult?.type === 'parabola' ? this.translate('parabola') :
                          this.calculationResult?.type === 'ellipse' ? this.translate('ellipse') :
                          this.calculationResult?.type === 'hyperbola' ? this.translate('hyperbola') :
                          this.translate('export.unknown');
    doc.text(`${this.translate('export.curveType')} ${curveTypeName}`, 15, yPos);
    yPos += 10;

    // Уравнение
    doc.text(`${this.translate('export.equation')} ${this.calculationResult?.equation || 'N/A'}`, 15, yPos);
    yPos += 15;

    // Измерения
    if (this.calculationResult?.measurements) {
      doc.setFontSize(14);
      doc.text(this.translate('export.measurements'), 15, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.text(`${this.translate('area')} ${this.calculationResult.measurements.area.toFixed(2)} м²`, 15, yPos);
      yPos += 8;
      doc.text(`${this.translate('arcLength')} ${this.calculationResult.measurements.arcLength.toFixed(2)} м`, 15, yPos);
      yPos += 8;
      doc.text(`${this.translate('volume')} ${this.calculationResult.measurements.volume.toFixed(2)} м³`, 15, yPos);
      yPos += 15;
    }

    // Материалы
    if (this.calculationResult?.materialEstimate) {
      doc.setFontSize(14);
      doc.text(this.translate('export.materialEstimate'), 15, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.text(`${this.translate('export.material')} ${this.getMaterialName(this.calculationResult.materialEstimate.material.name)}`, 15, yPos);
      yPos += 8;
      doc.text(`${this.translate('export.quantity')} ${this.calculationResult.materialEstimate.quantity.toFixed(2)} м³`, 15, yPos);
      yPos += 8;
      doc.text(`${this.translate('export.weight')} ${this.calculationResult.materialEstimate.weight.toFixed(0)} кг`, 15, yPos);
      yPos += 8;
      const costText = this.getPriceWithCurrency(this.calculationResult.materialEstimate.totalCost);
      doc.text(`${this.translate('export.cost')} ${costText}`, 15, yPos);
      yPos += 15;
    }

    // Структурный анализ
    if (this.structuralAnalysis) {
      const tableData = [
        [this.translate('maxStress'), `${this.structuralAnalysis.maxStress.toFixed(2)} МПа`],
        [this.translate('safetyFactor'), this.structuralAnalysis.safetyFactor.toFixed(2)],
        [this.translate('deflection'), `${this.structuralAnalysis.deflection.toFixed(2)} мм`],
        [this.translate('bucklingLoad'), `${this.structuralAnalysis.bucklingLoad.toFixed(0)} Н`],
        [this.translate('naturalFrequency'), `${this.structuralAnalysis.naturalFrequency.toFixed(2)} Гц`]
      ];

      (doc as any).autoTable({
        head: [[this.translate('export.parameter'), this.translate('export.value')]],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] }
      });
    }

    // Сохранение
    const filename = `architectural_calculation_${this.selectedCurveType}_${Date.now()}.pdf`;
    doc.save(filename);
  }

  private exportToExcel(data: any): void {
    const wb = XLSX.utils.book_new();

    // Лист с основными данными
    const curveTypeName = this.calculationResult?.type === 'parabola' ? this.translate('parabola') :
                          this.calculationResult?.type === 'ellipse' ? this.translate('ellipse') :
                          this.calculationResult?.type === 'hyperbola' ? this.translate('hyperbola') :
                          this.translate('export.unknown');
    const mainData = [
      [this.translate('title')],
      [this.translate('export.curveType'), curveTypeName],
      [this.translate('export.equation'), this.calculationResult?.equation || 'N/A'],
      [],
      [this.translate('export.measurements')],
      [`${this.translate('area')} (м²)`, this.calculationResult?.measurements.area || 0],
      [`${this.translate('arcLength')} (м)`, this.calculationResult?.measurements.arcLength || 0],
      [`${this.translate('volume')} (м³)`, this.calculationResult?.measurements.volume || 0],
      [],
      [this.translate('materials')],
      [this.translate('export.material'), this.getMaterialName(this.calculationResult?.materialEstimate?.material?.name || '') || 'N/A'],
      [`${this.translate('export.quantity')} (м³)`, this.calculationResult?.materialEstimate.quantity || 0],
      [`${this.translate('export.weight')} (кг)`, this.calculationResult?.materialEstimate.weight || 0],
      [`${this.translate('export.cost')} (${this.translate('currency')})`, 
        this.currentLanguage === 'hy' ? this.convertToDrams(this.calculationResult?.materialEstimate.totalCost || 0) :
        this.currentLanguage === 'en' ? this.convertToDollars(this.calculationResult?.materialEstimate.totalCost || 0) :
        (this.calculationResult?.materialEstimate.totalCost || 0)]
    ];

    const ws = XLSX.utils.aoa_to_sheet(mainData);
    XLSX.utils.book_append_sheet(wb, ws, this.translate('export.measurements'));

    // Лист со структурным анализом
    if (this.structuralAnalysis) {
      const analysisData = [
        [this.translate('export.structuralAnalysis')],
        [`${this.translate('maxStress')} (МПа)`, this.structuralAnalysis.maxStress],
        [this.translate('safetyFactor'), this.structuralAnalysis.safetyFactor],
        [`${this.translate('deflection')} (мм)`, this.structuralAnalysis.deflection],
        [`${this.translate('bucklingLoad')} (Н)`, this.structuralAnalysis.bucklingLoad],
        [`${this.translate('naturalFrequency')} (Гц)`, this.structuralAnalysis.naturalFrequency]
      ];
      const wsAnalysis = XLSX.utils.aoa_to_sheet(analysisData);
      XLSX.utils.book_append_sheet(wb, wsAnalysis, this.translate('export.structuralAnalysis'));
    }

    // Лист с рекомендациями
    if (this.recommendations && this.recommendations.length > 0) {
      const recommendationsData = [
        [this.translate('export.recommendations')],
        [this.translate('export.type'), this.translate('export.title'), this.translate('export.description'), 
         this.translate('export.current'), this.translate('export.recommended'), this.translate('recommendation')]
      ];
      
      this.recommendations.forEach(rec => {
        recommendationsData.push([
          rec.type,
          rec.title,
          rec.description,
          rec.currentValue !== undefined && rec.currentValue !== null ? String(rec.currentValue) : '',
          rec.recommendedValue !== undefined && rec.recommendedValue !== null ? String(rec.recommendedValue) : '',
          rec.suggestion || ''
        ]);
      });

      const wsRec = XLSX.utils.aoa_to_sheet(recommendationsData);
      XLSX.utils.book_append_sheet(wb, wsRec, this.translate('export.recommendations'));
    }

    // Сохранение
    const filename = `architectural_calculation_${this.selectedCurveType}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  private async exportToWord(data: any): Promise<void> {
    if (!this.calculationResult) return;

    const children: any[] = [];

    // Заголовок
    children.push(
      new Paragraph({
        text: this.translate('title'),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      })
    );

    // Тип кривой
    const curveTypeName = this.calculationResult.type === 'parabola' ? this.translate('parabola') :
                          this.calculationResult.type === 'ellipse' ? this.translate('ellipse') :
                          this.calculationResult.type === 'hyperbola' ? this.translate('hyperbola') :
                          this.translate('export.unknown');
    children.push(
      new Paragraph({
        text: `${this.translate('export.curveType')} ${curveTypeName}`,
        heading: HeadingLevel.HEADING_1
      })
    );

    // Уравнение
    children.push(
      new Paragraph({
        text: `${this.translate('export.equation')} ${this.calculationResult.equation || 'N/A'}`,
        spacing: { after: 200 }
      })
    );

    // Измерения
    if (this.calculationResult.measurements) {
      children.push(
        new Paragraph({
          text: this.translate('export.measurements'),
          heading: HeadingLevel.HEADING_2
        })
      );

      const measurementsTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(this.translate('export.parameter'))],
                width: { size: 50, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph(this.translate('export.value'))],
                width: { size: 50, type: WidthType.PERCENTAGE }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(this.translate('area'))]
              }),
              new TableCell({
                children: [new Paragraph(`${this.calculationResult.measurements.area.toFixed(2)} м²`)]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(this.translate('arcLength'))]
              }),
              new TableCell({
                children: [new Paragraph(`${this.calculationResult.measurements.arcLength.toFixed(2)} м`)]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(this.translate('volume'))]
              }),
              new TableCell({
                children: [new Paragraph(`${this.calculationResult.measurements.volume.toFixed(2)} м³`)]
              })
            ]
          })
        ]
      });

      children.push(measurementsTable);
    }

    // Материалы
    if (this.calculationResult.materialEstimate) {
      children.push(
        new Paragraph({
          text: this.translate('export.materialEstimate'),
          heading: HeadingLevel.HEADING_2
        })
      );

      const materialTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('export.parameter'))] }),
              new TableCell({ children: [new Paragraph(this.translate('export.value'))] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('export.material'))] }),
              new TableCell({ children: [new Paragraph(this.getMaterialName(this.calculationResult.materialEstimate.material.name))] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('export.quantity'))] }),
              new TableCell({ children: [new Paragraph(`${this.calculationResult.materialEstimate.quantity.toFixed(2)} м³`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('export.weight'))] }),
              new TableCell({ children: [new Paragraph(`${this.calculationResult.materialEstimate.weight.toFixed(0)} кг`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('export.cost'))] }),
              new TableCell({ children: [new Paragraph(this.getPriceWithCurrency(this.calculationResult.materialEstimate.totalCost))] })
            ]
          })
        ]
      });

      children.push(materialTable);
    }

    // Структурный анализ
    if (this.structuralAnalysis) {
      children.push(
        new Paragraph({
          text: this.translate('export.structuralAnalysis'),
          heading: HeadingLevel.HEADING_2
        })
      );

      const analysisTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('export.parameter'))] }),
              new TableCell({ children: [new Paragraph(this.translate('export.value'))] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('maxStress'))] }),
              new TableCell({ children: [new Paragraph(`${this.structuralAnalysis.maxStress.toFixed(2)} МПа`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('safetyFactor'))] }),
              new TableCell({ children: [new Paragraph(this.structuralAnalysis.safetyFactor.toFixed(2))] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('deflection'))] }),
              new TableCell({ children: [new Paragraph(`${this.structuralAnalysis.deflection.toFixed(2)} мм`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('bucklingLoad'))] }),
              new TableCell({ children: [new Paragraph(`${this.structuralAnalysis.bucklingLoad.toFixed(0)} Н`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.translate('naturalFrequency'))] }),
              new TableCell({ children: [new Paragraph(`${this.structuralAnalysis.naturalFrequency.toFixed(2)} Гц`)] })
            ]
          })
        ]
      });

      children.push(analysisTable);
    }

    // Рекомендации
    if (this.recommendations && this.recommendations.length > 0) {
      children.push(
        new Paragraph({
          text: this.translate('export.recommendations'),
          heading: HeadingLevel.HEADING_2
        })
      );

      const recRows: any[] = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(this.translate('export.type'))] }),
            new TableCell({ children: [new Paragraph(this.translate('export.title'))] }),
            new TableCell({ children: [new Paragraph(this.translate('export.description'))] }),
            new TableCell({ children: [new Paragraph(this.translate('export.current'))] }),
            new TableCell({ children: [new Paragraph(this.translate('export.recommended'))] })
          ]
        })
      ];

      this.recommendations.forEach(rec => {
        recRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(rec.type)] }),
              new TableCell({ children: [new Paragraph(rec.title)] }),
              new TableCell({ children: [new Paragraph(rec.description)] }),
              new TableCell({ 
                children: [new Paragraph(rec.currentValue !== undefined && rec.currentValue !== null ? String(rec.currentValue) : '')] 
              }),
              new TableCell({ 
                children: [new Paragraph(rec.recommendedValue !== undefined && rec.recommendedValue !== null ? String(rec.recommendedValue) : '')] 
              })
            ]
          })
        );
      });

      children.push(
        new Table({
          rows: recRows
        })
      );
    }

    // Создаем документ
    const doc = new Document({
      sections: [{
        children: children
      }]
    });

    // Генерируем и сохраняем файл
    const blob = await Packer.toBlob(doc);
    const filename = `architectural_calculation_${this.selectedCurveType}_${Date.now()}.docx`;
    saveAs(blob, filename);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
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