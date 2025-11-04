import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculationResult, Material, ArchitecturalStructure, StructuralAnalysis, VisualizationSettings, Recommendation } from './interfaces/architectural.interface';
import { ArchitecturalCalculationsService } from './services/architectural-calculations.service';
import { MaterialCalculatorService } from './services/material-calculator.service';
import { ChartService } from './services/chart.service';
import { RecommendationService } from './services/recommendation.service';
import { Chart, ChartConfiguration } from 'chart.js';
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
  
  @ViewChild('chartCanvas', { static: false }) chartCanvas?: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  
  selectedCurveType: 'parabola' | 'ellipse' | 'hyperbola' = 'parabola';
  calculationResult: CalculationResult | null = null;
  structuralAnalysis: StructuralAnalysis | null = null;
  materials: Material[] = [];
  recommendations: Recommendation[] = [];
  
  // 2D графики
  chartConfig: ChartConfiguration | null = null;
  showChart = false;
  
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

  constructor(
    private calculationsService: ArchitecturalCalculationsService,
    private materialService: MaterialCalculatorService,
    private chartService: ChartService,
    private recommendationService: RecommendationService
  ) { }

  ngOnInit(): void {
    this.materials = this.materialService.getAllMaterials();
    this.selectedMaterial = this.materials[0]; // Бетон по умолчанию
  }

  ngAfterViewInit(): void {
    // Инициализация после загрузки view
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
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

  calculate(): void {
    if (!this.selectedMaterial) {
      alert('Выберите материал!');
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
      
      // Автоматически создаем 2D график с задержкой для инициализации DOM
      setTimeout(() => {
        this.create2DChart();
      }, 100);
      
      // Выполняем структурный анализ
      this.performStructuralAnalysis();
      
      // Генерируем рекомендации
      this.generateRecommendations();
      
    } catch (error) {
      console.error('Ошибка расчета:', error);
      alert('Ошибка при расчете. Проверьте введенные параметры.');
    }
  }

  resetCalculation(): void {
    this.calculationResult = null;
    this.structuralAnalysis = null;
    this.recommendations = [];
    this.showResults = false;
    this.showChart = false;
    this.chartConfig = null;
    
    // Уничтожаем график если есть
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  getCurveTypeDescription(): string {
    switch (this.selectedCurveType) {
      case 'parabola':
        return 'Арки, мосты, крыши стадионов, навесы';
      case 'ellipse':
        return 'Купола, своды, арочные крыши, амфитеатры';
      case 'hyperbola':
        return 'Башни, оболочки, вантовые конструкции, воронкообразные крыши';
      default:
        return '';
    }
  }

  // Новые методы для расширенной функциональности

  /**
   * Создание 2D графика
   */
  create2DChart(): void {
    if (!this.calculationResult || !this.chartCanvas) {
      console.warn('Не удалось создать график: отсутствуют необходимые данные');
      return;
    }

    // Уничтожаем старый график если есть
    if (this.chart) {
      this.chart.destroy();
    }

    // Проверяем, что есть данные графика
    if (!this.calculationResult.graphData || this.calculationResult.graphData.length === 0) {
      console.warn('Нет данных для графика');
      this.showChart = false;
      return;
    }

    // Создаем конфигурацию в зависимости от типа кривой
    switch (this.selectedCurveType) {
      case 'parabola':
        this.chartConfig = this.chartService.createParabolaChart(
          this.calculationResult.graphData,
          this.parabolaParams.span,
          this.parabolaParams.height
        );
        break;
      case 'ellipse':
        this.chartConfig = this.chartService.createEllipseChart(
          this.calculationResult.graphData,
          this.ellipseParams.a,
          this.ellipseParams.b
        );
        break;
      case 'hyperbola':
        this.chartConfig = this.chartService.createHyperbolaChart(
          this.calculationResult.graphData,
          this.hyperbolaParams.a,
          this.hyperbolaParams.b
        );
        break;
    }

    if (this.chartConfig) {
      // Создаем новый график Chart.js
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, this.chartConfig);
        this.showChart = true;
        console.log('График успешно создан');
      } else {
        console.error('Не удалось получить контекст canvas');
      }
    } else {
      console.error('Не удалось создать конфигурацию графика');
      this.showChart = false;
    }
  }

  /**
   * Переключение 2D графика
   */
  toggle2DChart(): void {
    this.showChart = !this.showChart;
    
    if (this.showChart && !this.chartConfig) {
      this.create2DChart();
    }
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

    this.recommendations = this.recommendationService.generateRecommendations(
      this.structuralAnalysis,
      this.calculationResult,
      this.selectedMaterial,
      structureParams
    );
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
    doc.text('Архитектурный калькулятор', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Тип кривой: ${this.calculationResult?.type || 'неизвестно'}`, 15, yPos);
    yPos += 10;

    // Уравнение
    doc.text(`Уравнение: ${this.calculationResult?.equation || 'N/A'}`, 15, yPos);
    yPos += 15;

    // Вставка графика
    if (this.chartCanvas && this.chart) {
      try {
        const canvas = this.chartCanvas.nativeElement;
        const chartImage = canvas.toDataURL('image/png');
        
        // Добавляем подзаголовок для графика
        doc.setFontSize(12);
        doc.text('Визуализация:', 15, yPos);
        yPos += 10;

        // Вычисляем размеры для графика
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Проверяем, нужно ли добавить новую страницу
        if (yPos + imgHeight > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.addImage(chartImage, 'PNG', 15, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
        
        // Проверяем, нужно ли новая страница
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      } catch (error) {
        console.error('Ошибка при добавлении графика в PDF:', error);
      }
    }

    // Измерения
    if (this.calculationResult?.measurements) {
      doc.setFontSize(14);
      doc.text('Измерения:', 15, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.text(`Площадь: ${this.calculationResult.measurements.area.toFixed(2)} м²`, 15, yPos);
      yPos += 8;
      doc.text(`Длина дуги: ${this.calculationResult.measurements.arcLength.toFixed(2)} м`, 15, yPos);
      yPos += 8;
      doc.text(`Объем: ${this.calculationResult.measurements.volume.toFixed(2)} м³`, 15, yPos);
      yPos += 15;
    }

    // Материалы
    if (this.calculationResult?.materialEstimate) {
      doc.setFontSize(14);
      doc.text('Оценка материалов:', 15, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.text(`Материал: ${this.calculationResult.materialEstimate.material.name}`, 15, yPos);
      yPos += 8;
      doc.text(`Количество: ${this.calculationResult.materialEstimate.quantity.toFixed(2)} м³`, 15, yPos);
      yPos += 8;
      doc.text(`Вес: ${this.calculationResult.materialEstimate.weight.toFixed(0)} кг`, 15, yPos);
      yPos += 8;
      doc.text(`Стоимость: ${this.calculationResult.materialEstimate.totalCost.toFixed(0)} руб`, 15, yPos);
      yPos += 15;
    }

    // Структурный анализ
    if (this.structuralAnalysis) {
      const tableData = [
        ['Макс. напряжение', `${this.structuralAnalysis.maxStress.toFixed(2)} МПа`],
        ['Коэф. безопасности', this.structuralAnalysis.safetyFactor.toFixed(2)],
        ['Прогиб', `${this.structuralAnalysis.deflection.toFixed(2)} мм`],
        ['Критическая нагрузка', `${this.structuralAnalysis.bucklingLoad.toFixed(0)} Н`],
        ['Собственная частота', `${this.structuralAnalysis.naturalFrequency.toFixed(2)} Гц`]
      ];

      (doc as any).autoTable({
        head: [['Параметр', 'Значение']],
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
    const mainData = [
      ['Архитектурный калькулятор'],
      ['Тип кривой', this.calculationResult?.type || 'N/A'],
      ['Уравнение', this.calculationResult?.equation || 'N/A'],
      [],
      ['Измерения'],
      ['Площадь (м²)', this.calculationResult?.measurements.area || 0],
      ['Длина дуги (м)', this.calculationResult?.measurements.arcLength || 0],
      ['Объем (м³)', this.calculationResult?.measurements.volume || 0],
      [],
      ['Материалы'],
      ['Материал', this.calculationResult?.materialEstimate.material.name || 'N/A'],
      ['Количество (м³)', this.calculationResult?.materialEstimate.quantity || 0],
      ['Вес (кг)', this.calculationResult?.materialEstimate.weight || 0],
      ['Стоимость (руб)', this.calculationResult?.materialEstimate.totalCost || 0]
    ];

    const ws = XLSX.utils.aoa_to_sheet(mainData);
    XLSX.utils.book_append_sheet(wb, ws, 'Основные данные');

    // Лист с данными для графика
    if (this.calculationResult?.graphData && this.calculationResult.graphData.length > 0) {
      const chartData = [
        ['X координата (м)', 'Y координата (м)']
      ];
      
      this.calculationResult.graphData.forEach((point: any) => {
        chartData.push([
          typeof point.x === 'number' ? point.x : point[0],
          typeof point.y === 'number' ? point.y : point[1]
        ]);
      });

      const wsChart = XLSX.utils.aoa_to_sheet(chartData);
      XLSX.utils.book_append_sheet(wb, wsChart, 'График');

      // Добавляем инструкцию для создания графика в Excel
      const chartInstructions = [
        ['Инструкция по созданию графика в Excel:'],
        [],
        ['1. Перейдите на лист "График"'],
        ['2. Выберите столбцы A и B (данные X и Y)'],
        ['3. Вставьте → Диаграмма → Точечная диаграмма (точечная с линиями)'],
        ['4. Настройте ось и название диаграммы'],
        [],
        ['Примечание: X - горизонтальная координата в метрах'],
        ['Примечание: Y - вертикальная координата в метрах']
      ];
      const wsInstructions = XLSX.utils.aoa_to_sheet(chartInstructions);
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Инструкция');
    }

    // Лист со структурным анализом
    if (this.structuralAnalysis) {
      const analysisData = [
        ['Структурный анализ'],
        ['Макс. напряжение (МПа)', this.structuralAnalysis.maxStress],
        ['Коэф. безопасности', this.structuralAnalysis.safetyFactor],
        ['Прогиб (мм)', this.structuralAnalysis.deflection],
        ['Критическая нагрузка (Н)', this.structuralAnalysis.bucklingLoad],
        ['Собственная частота (Гц)', this.structuralAnalysis.naturalFrequency]
      ];
      const wsAnalysis = XLSX.utils.aoa_to_sheet(analysisData);
      XLSX.utils.book_append_sheet(wb, wsAnalysis, 'Структурный анализ');
    }

    // Лист с рекомендациями
    if (this.recommendations && this.recommendations.length > 0) {
      const recommendationsData = [
        ['Рекомендации'],
        ['Тип', 'Заголовок', 'Описание', 'Текущее', 'Рекомендуемое', 'Предложение']
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
      XLSX.utils.book_append_sheet(wb, wsRec, 'Рекомендации');
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
        text: 'Архитектурный калькулятор',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      })
    );

    // Тип кривой
    children.push(
      new Paragraph({
        text: `Тип кривой: ${this.calculationResult.type || 'неизвестно'}`,
        heading: HeadingLevel.HEADING_1
      })
    );

    // Уравнение
    children.push(
      new Paragraph({
        text: `Уравнение: ${this.calculationResult.equation || 'N/A'}`,
        spacing: { after: 200 }
      })
    );

    // Вставка графика
    if (this.chartCanvas && this.chart) {
      try {
        const canvas = this.chartCanvas.nativeElement;
        const chartImage = canvas.toDataURL('image/png');
        const base64Image = chartImage.split(',')[1];
        
        // Конвертируем base64 в Uint8Array для браузера
        const binaryString = atob(base64Image);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        children.push(
          new Paragraph({
            text: 'Визуализация:',
            heading: HeadingLevel.HEADING_2
          })
        );

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: bytes,
                type: 'png',
                transformation: {
                  width: 500,
                  height: 300
                }
              })
            ],
            alignment: AlignmentType.CENTER
          })
        );
      } catch (error) {
        console.error('Ошибка при добавлении графика в Word:', error);
      }
    }

    // Измерения
    if (this.calculationResult.measurements) {
      children.push(
        new Paragraph({
          text: 'Измерения',
          heading: HeadingLevel.HEADING_2
        })
      );

      const measurementsTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('Параметр')],
                width: { size: 50, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph('Значение')],
                width: { size: 50, type: WidthType.PERCENTAGE }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('Площадь')]
              }),
              new TableCell({
                children: [new Paragraph(`${this.calculationResult.measurements.area.toFixed(2)} м²`)]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('Длина дуги')]
              }),
              new TableCell({
                children: [new Paragraph(`${this.calculationResult.measurements.arcLength.toFixed(2)} м`)]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('Объем')]
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
          text: 'Оценка материалов',
          heading: HeadingLevel.HEADING_2
        })
      );

      const materialTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Характеристика')] }),
              new TableCell({ children: [new Paragraph('Значение')] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Материал')] }),
              new TableCell({ children: [new Paragraph(this.calculationResult.materialEstimate.material.name)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Количество')] }),
              new TableCell({ children: [new Paragraph(`${this.calculationResult.materialEstimate.quantity.toFixed(2)} м³`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Вес')] }),
              new TableCell({ children: [new Paragraph(`${this.calculationResult.materialEstimate.weight.toFixed(0)} кг`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Стоимость')] }),
              new TableCell({ children: [new Paragraph(`${this.calculationResult.materialEstimate.totalCost.toFixed(0)} руб`)] })
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
          text: 'Структурный анализ',
          heading: HeadingLevel.HEADING_2
        })
      );

      const analysisTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Параметр')] }),
              new TableCell({ children: [new Paragraph('Значение')] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Макс. напряжение')] }),
              new TableCell({ children: [new Paragraph(`${this.structuralAnalysis.maxStress.toFixed(2)} МПа`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Коэф. безопасности')] }),
              new TableCell({ children: [new Paragraph(this.structuralAnalysis.safetyFactor.toFixed(2))] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Прогиб')] }),
              new TableCell({ children: [new Paragraph(`${this.structuralAnalysis.deflection.toFixed(2)} мм`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Критическая нагрузка')] }),
              new TableCell({ children: [new Paragraph(`${this.structuralAnalysis.bucklingLoad.toFixed(0)} Н`)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Собственная частота')] }),
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
          text: 'Рекомендации',
          heading: HeadingLevel.HEADING_2
        })
      );

      const recRows: any[] = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Тип')] }),
            new TableCell({ children: [new Paragraph('Заголовок')] }),
            new TableCell({ children: [new Paragraph('Описание')] }),
            new TableCell({ children: [new Paragraph('Текущее')] }),
            new TableCell({ children: [new Paragraph('Рекомендуемое')] })
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