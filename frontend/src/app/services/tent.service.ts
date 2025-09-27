import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TentService {
  private tentsUrl = '/assets/json/tents.json';
  constructor(private http: HttpClient) {}

  getTents(resortKey: string): Observable<any> {
    return new Observable((subscriber) => {
      this.http.get(this.tentsUrl).subscribe({
        next: (data: any) => {
          subscriber.next(data[resortKey] || []);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }
}
