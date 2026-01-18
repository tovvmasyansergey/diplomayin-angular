import { Injectable } from '@angular/core';
import { Recommendation, StructuralAnalysis, Material, CalculationResult } from '../interfaces/architectural.interface';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  private readonly STANDARDS = {
    SAFETY_FACTOR_MIN: 1.5, // Минимальный рекомендуемый коэффициент запаса
    SAFETY_FACTOR_GOOD: 2.0,
    SAFETY_FACTOR_CRITICAL: 1.0,
    DEFLECTION_RATIO: 300, // L/300 для нормальных нагрузок
    STRESS_RATIO_MIN: 0.7, // Минимальный запас напряжения
    MIN_THICKNESS: 0.1, // 10 см минимальная толщина
    MAX_HEIGHT: 40, // Максимальная рекомендуемая высота в метрах
    MIN_THICKNESS_FOR_HEIGHT: 0.3, // Минимальная толщина при высоте > 30м
  };

  constructor() { }

  /**
   * Генерация рекомендаций на основе результатов анализа
   */
  generateRecommendations(
    analysis: StructuralAnalysis,
    result: CalculationResult,
    material: Material,
    structureParams: { span?: number; height?: number; thickness?: number; a?: number; b?: number }
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Анализ максимального напряжения
    this.analyzeStress(analysis, material, recommendations);

    // Анализ коэффициента запаса
    this.analyzeSafetyFactor(analysis, recommendations);

    // Анализ прогиба
    this.analyzeDeflection(analysis, structureParams, recommendations);

    // Анализ геометрии
    this.analyzeGeometry(structureParams, recommendations);

    // Анализ материала
    this.analyzeMaterial(material, structureParams, recommendations);

    return recommendations;
  }

  /**
   * Анализ максимального напряжения
   */
  private analyzeStress(analysis: StructuralAnalysis, material: Material, recommendations: Recommendation[]): void {
    if (!material.strength) return;

    const stressRatio = analysis.maxStress / material.strength;
    
    if (analysis.maxStress >= material.strength) {
      recommendations.push({
        type: 'error',
        severity: 'critical',
        title: 'rec.stressExceeded',
        description: `Максимальное напряжение (${analysis.maxStress.toFixed(2)} МПа) превышает прочность материала (${material.strength} МПа)`,
        parameter: 'maxStress',
        currentValue: analysis.maxStress,
        recommendedValue: material.strength * 0.7,
        suggestion: `Немедленно увеличьте толщину конструкции минимум на 30% или выберите более прочный материал (прочность > ${analysis.maxStress * 1.5} МПа)`
      });
    } else if (stressRatio > this.STANDARDS.STRESS_RATIO_MIN) {
      recommendations.push({
        type: 'warning',
        severity: 'high',
        title: 'rec.highStress',
        description: `Напряжение (${analysis.maxStress.toFixed(2)} МПа) использует ${(stressRatio * 100).toFixed(1)}% прочности материала`,
        parameter: 'maxStress',
        currentValue: analysis.maxStress,
        recommendedValue: material.strength * 0.6,
        suggestion: `Рекомендуется увеличить толщину на ${((stressRatio - this.STANDARDS.STRESS_RATIO_MIN) * 100).toFixed(0)}% для безопасности`
      });
    }
  }

  /**
   * Анализ коэффициента запаса
   */
  private analyzeSafetyFactor(analysis: StructuralAnalysis, recommendations: Recommendation[]): void {
    if (analysis.safetyFactor <= this.STANDARDS.SAFETY_FACTOR_CRITICAL) {
      recommendations.push({
        type: 'error',
        severity: 'critical',
        title: 'rec.criticalSafety',
        description: `Коэффициент запаса (${analysis.safetyFactor.toFixed(2)}) слишком мал`,
        parameter: 'safetyFactor',
        currentValue: analysis.safetyFactor,
        recommendedValue: this.STANDARDS.SAFETY_FACTOR_MIN,
        suggestion: 'Увеличьте толщину конструкции минимум на 50% или снизьте нагрузку'
      });
    } else if (analysis.safetyFactor < this.STANDARDS.SAFETY_FACTOR_MIN) {
      recommendations.push({
        type: 'warning',
        severity: 'high',
        title: 'rec.insufficientSafety',
        description: `Коэффициент запаса (${analysis.safetyFactor.toFixed(2)}) ниже рекомендуемого минимума (${this.STANDARDS.SAFETY_FACTOR_MIN})`,
        parameter: 'safetyFactor',
        currentValue: analysis.safetyFactor,
        recommendedValue: this.STANDARDS.SAFETY_FACTOR_MIN,
        suggestion: `Увеличьте толщину на ${((this.STANDARDS.SAFETY_FACTOR_MIN / analysis.safetyFactor - 1) * 100).toFixed(0)}% для соответствия нормам`
      });
    } else if (analysis.safetyFactor >= this.STANDARDS.SAFETY_FACTOR_GOOD) {
      recommendations.push({
        type: 'success',
        severity: 'low',
        title: 'rec.goodSafety',
        description: `Коэффициент запаса (${analysis.safetyFactor.toFixed(2)}) соответствует нормам`,
        parameter: 'safetyFactor',
        currentValue: analysis.safetyFactor,
        suggestion: 'Конструкция имеет достаточный запас прочности'
      });
    }
  }

  /**
   * Анализ прогиба
   */
  private analyzeDeflection(analysis: StructuralAnalysis, structureParams: any, recommendations: Recommendation[]): void {
    if (!structureParams.span) return;

    const maxDeflection = structureParams.span * 1000 / this.STANDARDS.DEFLECTION_RATIO; // мм
    
    if (analysis.deflection > maxDeflection) {
      const ratio = analysis.deflection / maxDeflection;
      recommendations.push({
        type: 'warning',
        severity: 'high',
        title: 'rec.deflectionExceeded',
        description: `Прогиб (${analysis.deflection.toFixed(1)} мм) превышает допустимое значение (${maxDeflection.toFixed(1)} мм) в ${ratio.toFixed(2)} раз`,
        parameter: 'deflection',
        currentValue: analysis.deflection,
        recommendedValue: maxDeflection,
        suggestion: `Увеличьте толщину в ${Math.sqrt(ratio).toFixed(2)} раза или увеличьте жесткость материала для уменьшения прогиба на ${((ratio - 1) * 100).toFixed(0)}%`
      });
    }
  }

  /**
   * Анализ геометрии конструкции
   */
  private analyzeGeometry(params: any, recommendations: Recommendation[]): void {
    // Проверка минимальной толщины
    if (params.thickness && params.thickness < this.STANDARDS.MIN_THICKNESS) {
      recommendations.push({
        type: 'error',
        severity: 'high',
        title: 'rec.insufficientThickness',
        description: `Толщина (${params.thickness * 100} см) меньше минимально допустимой (${this.STANDARDS.MIN_THICKNESS * 100} см)`,
        parameter: 'thickness',
        currentValue: params.thickness,
        recommendedValue: this.STANDARDS.MIN_THICKNESS,
        suggestion: `Увеличьте толщину минимум до ${this.STANDARDS.MIN_THICKNESS * 100} см для обеспечения безопасности`
      });
    }

    // Проверка высоты при большой высоте
    if (params.height && params.height > 30) {
      if (!params.thickness || params.thickness < this.STANDARDS.MIN_THICKNESS_FOR_HEIGHT) {
        recommendations.push({
          type: 'error',
          severity: 'critical',
          title: 'rec.insufficientThicknessForHeight',
          description: `При высоте ${params.height}м требуется минимальная толщина ${this.STANDARDS.MIN_THICKNESS_FOR_HEIGHT * 100}см`,
          parameter: 'thickness',
          currentValue: params.thickness || 0,
          recommendedValue: this.STANDARDS.MIN_THICKNESS_FOR_HEIGHT,
          suggestion: `Для высоты ${params.height}м необходимо увеличить толщину до ${this.STANDARDS.MIN_THICKNESS_FOR_HEIGHT * 100}см и более для устойчивости`
        });
      }
    }

    // Проверка максимальной высоты
    if (params.height && params.height > this.STANDARDS.MAX_HEIGHT) {
      const minThickness = (params.height / this.STANDARDS.MAX_HEIGHT * this.STANDARDS.MIN_THICKNESS_FOR_HEIGHT);
      recommendations.push({
        type: 'warning',
        severity: 'high',
        title: 'rec.heightExceeded',
        description: `Высота конструкции (${params.height}м) превышает рекомендуемый максимум (${this.STANDARDS.MAX_HEIGHT}м)`,
        parameter: 'height',
        currentValue: params.height,
        recommendedValue: this.STANDARDS.MAX_HEIGHT,
        suggestion: `Рекомендуется снизить высоту или значительно увеличить толщину (минимум ${(minThickness * 100).toFixed(0)}см)`
      });
    }

    // Для параболы: проверка соотношения пролета и высоты
    if (params.span && params.height) {
      const ratio = params.span / params.height;
      if (ratio > 10) {
        recommendations.push({
          type: 'warning',
          severity: 'medium',
          title: 'rec.largeSpanRatio',
          description: `Соотношение пролета к высоте (${ratio.toFixed(2)}) слишком большое`,
          parameter: 'span',
          suggestion: `Рекомендуется увеличить высоту дуги или добавить дополнительные опоры`
        });
      } else if (ratio < 2 && params.thickness && params.thickness < 0.5) {
        recommendations.push({
          type: 'info',
          severity: 'low',
          title: 'rec.highArch',
          description: `При такой высоте (${params.height}м) рекомендуется увеличить толщину для устойчивости`,
          parameter: 'thickness',
          currentValue: params.thickness,
          suggestion: `При высоте ${params.height}м рекомендуется толщина не менее ${(0.3 + params.height / 100).toFixed(2)}м`
        });
      }
    }
  }

  /**
   * Анализ выбранного материала
   */
  private analyzeMaterial(material: Material, params: any, recommendations: Recommendation[]): void {
    if (!params.thickness) return;

    // Для бетона проверяем особенно тщательно
    if (material.name === 'Бетон') {
      if (params.span && params.span > 20 && params.thickness < 0.4) {
        recommendations.push({
          type: 'warning',
          severity: 'medium',
          title: 'rec.thinConcrete',
          description: `Для бетонной арки с пролетом ${params.span}м толщина ${params.thickness * 100}см может быть недостаточной`,
          parameter: 'thickness',
          currentValue: params.thickness,
          recommendedValue: 0.4,
          suggestion: `Рекомендуется увеличить толщину до ${0.4 * 100}см или использовать армирование`
        });
      }
    }

    // Для стали с низкой толщиной
    if (material.name === 'Сталь' && params.thickness < 0.15) {
      recommendations.push({
        type: 'info',
        severity: 'low',
        title: 'rec.thinSteel',
        description: 'Стальные конструкции требуют дополнительной проверки на местное выпучивание',
        suggestion: 'Убедитесь, что конструкция имеет достаточное поперечное армирование'
      });
    }
  }

  /**
   * Получение иконки для типа рекомендации
   */
  getRecommendationIcon(type: string): string {
    switch (type) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✓';
      default:
        return '•';
    }
  }

  /**
   * Получение цвета для тяжести рекомендации
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#dc3545'; // красный
      case 'high':
        return '#fd7e14'; // оранжевый
      case 'medium':
        return '#ffc107'; // желтый
      case 'low':
        return '#28a745'; // зеленый
      default:
        return '#6c757d'; // серый
    }
  }
}

