export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurveParameters {
  a: number;
  b: number;
  c?: number;
  p?: number; // для параболы
}

export interface Material {
  name: string;
  density: number; // кг/м³
  costPerUnit: number; // стоимость за единицу
  unit: string;
  strength?: number; // прочность в МПа
  elasticity?: number; // модуль упругости в ГПа
  thermalConductivity?: number; // теплопроводность Вт/(м·К)
  category?: 'structural' | 'decorative' | 'insulation' | 'composite';
  description?: string;
}

export interface CalculationResult {
  type: 'parabola' | 'ellipse' | 'hyperbola';
  equation: string;
  parameters: CurveParameters;
  properties: {
    foci?: CurvePoint[];
    vertices?: CurvePoint[];
    asymptotes?: string[];
    directrix?: string;
    eccentricity?: number;
  };
  measurements: {
    area: number;
    arcLength: number;
    volume: number;
    perimeter?: number;
  };
  materialEstimate: {
    material: Material;
    quantity: number;
    totalCost: number;
    weight: number;
  };
  graphData: CurvePoint[];
}

export interface ArchitecturalStructure {
  name: string;
  type: 'parabola' | 'ellipse' | 'hyperbola';
  span: number; // пролёт
  height: number; // высота
  thickness: number; // толщина
  material: Material;
  description: string;
}

export interface StructuralAnalysis {
  maxStress: number; // максимальное напряжение в МПа
  safetyFactor: number; // коэффициент безопасности
  deflection: number; // прогиб в мм
  bucklingLoad: number; // критическая нагрузка на продольный изгиб в Н
  naturalFrequency: number; // собственная частота колебаний в Гц
}

export interface Recommendation {
  type: 'warning' | 'error' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  parameter?: string; // параметр проблемы
  currentValue?: number;
  recommendedValue?: number;
  suggestion?: string; // конкретное предложение
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'word' | 'json';
  include2D: boolean;
  includeCalculations: boolean;
  includeMaterials: boolean;
}

export interface VisualizationSettings {
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  backgroundColor: string;
  curveColor: string;
  materialColor: string;
  lighting: 'ambient' | 'directional' | 'point' | 'all';
  quality: 'low' | 'medium' | 'high';
}
