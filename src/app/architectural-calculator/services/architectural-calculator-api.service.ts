import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../../constants/api.constants';
import { CalculationResult, Material, Recommendation, StructuralAnalysis } from '../interfaces/architectural.interface';

export interface ArchitecturalCalculationRequest {
  curveType: 'parabola' | 'ellipse' | 'hyperbola';
  language: 'ru' | 'en' | 'hy';
  materialName: string;
  span?: number;
  height?: number;
  thickness?: number;
  a?: number;
  b?: number;
}

export interface ArchitecturalCalculationResponse {
  calculationResult: CalculationResult;
  structuralAnalysis: StructuralAnalysis;
  recommendations: Recommendation[];
}

@Injectable({
  providedIn: 'root'
})
export class ArchitecturalCalculatorApiService {
  private readonly basePath = `${API_CONSTANTS.BASE_PATH}api/architectural-calculator`;

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.basePath}/materials`, {
      headers: this.getHeaders()
    });
  }

  getMaterialSuggestions(curveType: 'parabola' | 'ellipse' | 'hyperbola'): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.basePath}/materials/suggestions?curveType=${curveType}`, {
      headers: this.getHeaders()
    });
  }

  calculate(request: ArchitecturalCalculationRequest): Observable<ArchitecturalCalculationResponse> {
    return this.http.post<ArchitecturalCalculationResponse>(`${this.basePath}/calculate`, request, {
      headers: this.getHeaders()
    });
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}
