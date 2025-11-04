import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CurvePoint } from '../interfaces/architectural.interface';

export interface ChartConfig {
  type: 'parabola' | 'ellipse' | 'hyperbola';
  points: CurvePoint[];
  span?: number;
  height?: number;
  a?: number;
  b?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  /**
   * Создание конфигурации для графика параболы
   */
  createParabolaChart(points: CurvePoint[], span: number, height: number): ChartConfiguration {
    const chartData: ChartData<'line'> = {
      datasets: [{
        label: `Парабола (L=${span}м, H=${height}м)`,
        data: points.map(point => ({ x: point.x, y: point.y })),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    };

    return {
      type: 'line' as ChartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Параболическая арка',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Расстояние (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Высота (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: '#3b82f6',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
          }
        }
      }
    };
  }

  /**
   * Создание конфигурации для графика эллипса
   */
  createEllipseChart(points: CurvePoint[], a: number, b: number): ChartConfiguration {
    const chartData: ChartData<'line'> = {
      datasets: [{
        label: `Эллипс (a=${a}м, b=${b}м)`,
        data: points.map(point => ({ x: point.x, y: point.y })),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    };

    return {
      type: 'line' as ChartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Эллиптический купол',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Ширина (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Высота (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: '#f59e0b',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
          }
        }
      }
    };
  }

  /**
   * Создание конфигурации для графика гиперболы
   */
  createHyperbolaChart(points: CurvePoint[], a: number, b: number): ChartConfiguration {
    const chartData: ChartData<'line'> = {
      datasets: [{
        label: `Гипербола (a=${a}м, b=${b}м)`,
        data: points.map(point => ({ x: point.x, y: point.y })),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    };

    return {
      type: 'line' as ChartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Гиперболическая башня',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Ширина (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Высота (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: '#ef4444',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
          }
        }
      }
    };
  }

  /**
   * Создание сравнительного графика всех кривых
   */
  createComparisonChart(parabolaPoints: CurvePoint[], ellipsePoints: CurvePoint[], hyperbolaPoints: CurvePoint[]): ChartConfiguration {
    const chartData: ChartData<'line'> = {
      datasets: [
        {
          label: 'Парабола',
          data: parabolaPoints.map(point => ({ x: point.x, y: point.y })),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 1,
          pointHoverRadius: 4
        },
        {
          label: 'Эллипс',
          data: ellipsePoints.map(point => ({ x: point.x, y: point.y })),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 1,
          pointHoverRadius: 4
        },
        {
          label: 'Гипербола',
          data: hyperbolaPoints.map(point => ({ x: point.x, y: point.y })),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 1,
          pointHoverRadius: 4
        }
      ]
    };

    return {
      type: 'line' as ChartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Сравнение архитектурных кривых',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Расстояние (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Высота (м)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };
  }

  /**
   * Создание графика зависимости площади от параметров
   */
  createAreaChart(data: { label: string, area: number, color: string }[]): ChartConfiguration {
    const chartData: ChartData<'bar'> = {
      labels: data.map(item => item.label),
      datasets: [{
        label: 'Площадь (м²)',
        data: data.map(item => item.area),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2
      }]
    };

    return {
      type: 'bar' as ChartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Сравнение площадей конструкций',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Площадь (м²)',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      }
    };
  }
}
