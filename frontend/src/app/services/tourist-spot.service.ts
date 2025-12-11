import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TouristSpotService {
  private apiUrl = `${environment.apiUrl}/touristspots`;

  constructor(private http: HttpClient) {}

  getAllTouristSpots(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getTouristSpotById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  
  getTouristSpotBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?slug=${encodeURIComponent(slug)}`);
  }
}
