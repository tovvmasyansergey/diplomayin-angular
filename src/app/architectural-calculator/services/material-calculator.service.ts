import { Injectable } from '@angular/core';
import { Material } from '../interfaces/architectural.interface';

@Injectable({
  providedIn: 'root'
})
export class MaterialCalculatorService {

  private materials: Material[] = [
    {
      name: 'Бетон',
      density: 2400, // кг/м³
      costPerUnit: 5000, // руб/м³
      unit: 'м³',
      strength: 25, // МПа
      elasticity: 30, // ГПа
      thermalConductivity: 1.7, // Вт/(м·К)
      category: 'structural',
      description: 'Основной строительный материал для несущих конструкций'
    },
    {
      name: 'Сталь',
      density: 7850, // кг/м³
      costPerUnit: 80000, // руб/м³
      unit: 'м³',
      strength: 400, // МПа
      elasticity: 200, // ГПа
      thermalConductivity: 50, // Вт/(м·К)
      category: 'structural',
      description: 'Высокопрочный материал для каркасов и несущих элементов'
    },
    {
      name: 'Алюминий',
      density: 2700, // кг/м³
      costPerUnit: 120000, // руб/м³
      unit: 'м³',
      strength: 200, // МПа
      elasticity: 70, // ГПа
      thermalConductivity: 205, // Вт/(м·К)
      category: 'structural',
      description: 'Легкий металл с высокой коррозионной стойкостью'
    },
    {
      name: 'Стекло',
      density: 2500, // кг/м³
      costPerUnit: 15000, // руб/м³
      unit: 'м³',
      strength: 50, // МПа
      elasticity: 70, // ГПа
      thermalConductivity: 1, // Вт/(м·К)
      category: 'decorative',
      description: 'Прозрачный материал для остекления и декоративных элементов'
    },
    {
      name: 'Дерево',
      density: 600, // кг/м³
      costPerUnit: 15000, // руб/м³
      unit: 'м³',
      strength: 40, // МПа
      elasticity: 12, // ГПа
      thermalConductivity: 0.15, // Вт/(м·К)
      category: 'structural',
      description: 'Экологичный материал с хорошими теплоизоляционными свойствами'
    },
    {
      name: 'Кирпич',
      density: 1800, // кг/м³
      costPerUnit: 8000, // руб/м³
      unit: 'м³',
      strength: 15, // МПа
      elasticity: 10, // ГПа
      thermalConductivity: 0.8, // Вт/(м·К)
      category: 'structural',
      description: 'Традиционный строительный материал с хорошей теплоизоляцией'
    },
    {
      name: 'Поликарбонат',
      density: 1200, // кг/м³
      costPerUnit: 25000, // руб/м³
      unit: 'м³',
      strength: 60, // МПа
      elasticity: 2.3, // ГПа
      thermalConductivity: 0.2, // Вт/(м·К)
      category: 'decorative',
      description: 'Легкий прозрачный пластик для навесов и покрытий'
    },
    {
      name: 'Композитные материалы',
      density: 1600, // кг/м³
      costPerUnit: 100000, // руб/м³
      unit: 'м³',
      strength: 300, // МПа
      elasticity: 50, // ГПа
      thermalConductivity: 0.5, // Вт/(м·К)
      category: 'composite',
      description: 'Современные материалы с улучшенными свойствами'
    }
  ];

  constructor() { }

  getAllMaterials(): Material[] {
    return this.materials;
  }

  getMaterialByName(name: string): Material | undefined {
    return this.materials.find(material => material.name === name);
  }

  calculateMaterialCost(volume: number, material: Material): number {
    return volume * material.costPerUnit;
  }

  calculateMaterialWeight(volume: number, material: Material): number {
    return volume * material.density;
  }

  getOptimalMaterial(structures: { volume: number, material: Material }[]): Material {
    // Простая логика выбора оптимального материала
    // В реальном приложении здесь была бы более сложная логика
    const totalCosts = this.materials.map(material => {
      const totalCost = structures.reduce((sum, structure) => {
        return sum + this.calculateMaterialCost(structure.volume, material);
      }, 0);
      return { material, totalCost };
    });

    return totalCosts.reduce((min, current) => 
      current.totalCost < min.totalCost ? current : min
    ).material;
  }

  addCustomMaterial(material: Material): void {
    this.materials.push(material);
  }

  updateMaterialCost(materialName: string, newCost: number): void {
    const material = this.getMaterialByName(materialName);
    if (material) {
      material.costPerUnit = newCost;
    }
  }

  getMaterialSuggestions(structureType: string): Material[] {
    // Предложения материалов в зависимости от типа конструкции
    switch (structureType.toLowerCase()) {
      case 'parabola':
        return this.materials.filter(m => 
          ['Бетон', 'Сталь', 'Стекло'].includes(m.name)
        );
      case 'ellipse':
        return this.materials.filter(m => 
          ['Бетон', 'Сталь', 'Поликарбонат'].includes(m.name)
        );
      case 'hyperbola':
        return this.materials.filter(m => 
          ['Сталь', 'Алюминий', 'Композитные материалы'].includes(m.name)
        );
      default:
        return this.materials;
    }
  }
}
