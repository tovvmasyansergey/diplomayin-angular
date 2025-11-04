import { Injectable } from '@angular/core';
import { CurvePoint, CurveParameters, CalculationResult, Material, ArchitecturalStructure } from '../interfaces/architectural.interface';

@Injectable({
  providedIn: 'root'
})
export class ArchitecturalCalculationsService {

  constructor() { }

  // Расчет параболы
  calculateParabola(span: number, height: number, thickness: number, material: Material): CalculationResult {
    const a = 4 * height / (span * span);
    const equation = `y = ${a.toFixed(4)}x²`;
    
    // Расчет площади параболы
    const area = this.calculateParabolaArea(span, height);
    
    // Расчет длины дуги параболы
    const arcLength = this.calculateParabolaArcLength(span, height);
    
    // Расчет объема
    const volume = area * thickness;
    
    // Расчет материала
    const weight = volume * material.density;
    const totalCost = volume * material.costPerUnit;
    
    // Генерация точек для графика
    const graphData = this.generateParabolaPoints(span, height);
    
    return {
      type: 'parabola',
      equation,
      parameters: { a, b: a, p: span / 2 },
      properties: {
        foci: [{ x: 0, y: height / 4 }],
        vertices: [{ x: 0, y: 0 }],
        directrix: `y = -${height / 4}`
      },
      measurements: {
        area,
        arcLength,
        volume
      },
      materialEstimate: {
        material,
        quantity: volume,
        totalCost,
        weight
      },
      graphData
    };
  }

  // Расчет эллипса
  calculateEllipse(a: number, b: number, thickness: number, material: Material): CalculationResult {
    const equation = `x²/${a.toFixed(2)}² + y²/${b.toFixed(2)}² = 1`;
    
    // Расчет площади эллипса
    const area = Math.PI * a * b;
    
    // Расчет длины дуги эллипса (приближенная формула)
    const arcLength = this.calculateEllipseArcLength(a, b);
    
    // Расчет объема
    const volume = area * thickness;
    
    // Расчет материала
    const weight = volume * material.density;
    const totalCost = volume * material.costPerUnit;
    
    // Генерация точек для графика
    const graphData = this.generateEllipsePoints(a, b);
    
    // Расчет фокусов
    const c = Math.sqrt(a * a - b * b);
    const foci = [
      { x: -c, y: 0 },
      { x: c, y: 0 }
    ];
    
    return {
      type: 'ellipse',
      equation,
      parameters: { a, b },
      properties: {
        foci,
        vertices: [
          { x: -a, y: 0 },
          { x: a, y: 0 },
          { x: 0, y: -b },
          { x: 0, y: b }
        ],
        eccentricity: c / a
      },
      measurements: {
        area,
        arcLength,
        volume,
        perimeter: arcLength
      },
      materialEstimate: {
        material,
        quantity: volume,
        totalCost,
        weight
      },
      graphData
    };
  }

  // Расчет гиперболы (упрощенная версия)
  calculateHyperbola(a: number, b: number, thickness: number, material: Material): CalculationResult {
    const equation = `x²/${a.toFixed(2)}² - y²/${b.toFixed(2)}² = 1`;
    
    // Упрощенный расчет площади гиперболы
    const area = Math.PI * a * b * 0.5;
    
    // Упрощенный расчет длины дуги гиперболы
    const arcLength = Math.PI * (a + b) * 0.5;
    
    // Расчет объема
    const volume = area * thickness;
    
    // Расчет материала
    const weight = volume * material.density;
    const totalCost = volume * material.costPerUnit;
    
    // Генерация точек для графика (упрощенная)
    const graphData: CurvePoint[] = [];
    
    // Расчет фокусов и асимптот
    const c = Math.sqrt(a * a + b * b);
    const foci = [
      { x: -c, y: 0 },
      { x: c, y: 0 }
    ];
    const asymptotes = [
      `y = ${(b/a).toFixed(2)}x`,
      `y = -${(b/a).toFixed(2)}x`
    ];
    
    return {
      type: 'hyperbola',
      equation,
      parameters: { a, b },
      properties: {
        foci,
        vertices: [
          { x: -a, y: 0 },
          { x: a, y: 0 }
        ],
        asymptotes,
        eccentricity: c / a
      },
      measurements: {
        area,
        arcLength,
        volume
      },
      materialEstimate: {
        material,
        quantity: volume,
        totalCost,
        weight
      },
      graphData
    };
  }

  // Вспомогательные методы для расчетов

  private calculateParabolaArea(span: number, height: number): number {
    return (2 * span * height) / 3;
  }

  private calculateParabolaArcLength(span: number, height: number): number {
    const a = 4 * height / (span * span);
    const s = span / 2;
    return s * Math.sqrt(1 + 4 * a * a * s * s) + 
           (1 / (2 * a)) * Math.log(2 * a * s + Math.sqrt(1 + 4 * a * a * s * s));
  }

  private calculateEllipseArcLength(a: number, b: number): number {
    // Приближенная формула Рамануджана
    const h = Math.pow((a - b) / (a + b), 2);
    return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  }

  private generateParabolaPoints(span: number, height: number): CurvePoint[] {
    const points: CurvePoint[] = [];
    const a = 4 * height / (span * span);
    const step = span / 100;
    
    for (let x = -span/2; x <= span/2; x += step) {
      const y = a * x * x;
      points.push({ x, y });
    }
    
    return points;
  }

  private generateEllipsePoints(a: number, b: number): CurvePoint[] {
    const points: CurvePoint[] = [];
    const step = (2 * Math.PI) / 100;
    
    for (let t = 0; t <= 2 * Math.PI; t += step) {
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      points.push({ x, y });
    }
    
    return points;
  }

}
