import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { KeyCategory } from '../models/key-category.model';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  idToken: string;
  clientId: string;

  getKeyCategories(callback) {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('idToken', this.idToken);

    this.httpClient.get<Array<KeyCategory>>(this.baseUrl + 'keycategory/GetKeyCategories',
      { params: httpParams }).subscribe(result => {
        console.log(result);

        callback(result);
      }, error => { console.error(error); });
  }

  createKeyCategory() {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('idToken', this.idToken);

    this.httpClient.post(this.baseUrl + 'keycategory/CreateKeyCategory', null,
      { params: httpParams }).subscribe(
        result => console.log(result),
        error => console.error(error));
  }

  updateKeyCategory(keyCategory: KeyCategory) {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('clientId', this.clientId);
    httpParams = httpParams.append('idToken', this.idToken);

    let httpHeaders: HttpHeaders = new HttpHeaders();
    httpHeaders = httpHeaders.set('Content-Type', 'application/json; charset=utf-8');

    this.httpClient.put<KeyCategory>(this.baseUrl + 'keycategory/UpdateKeyCategory',
      JSON.stringify(keyCategory),
      { params: httpParams, headers: httpHeaders }).subscribe(
        result => console.log(result),
        error => console.error(error));
  }

  deleteKeyCategory(keyCategoryId: string) {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('keyCategoryId', keyCategoryId);
    httpParams = httpParams.append('idToken', this.idToken);

    this.httpClient.delete(this.baseUrl + 'keycategory/DeleteKeyCategory',
      { params: httpParams }).subscribe(
        result => console.log(result),
        error => console.error(error));
  }

  createKeyGroup(keyCategoryId: string, keyGroupType, keyGroupIndex: number) {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('keyCategoryId', keyCategoryId);
    httpParams = httpParams.append('keyGroupType', keyGroupType);
    httpParams = httpParams.append('keyGroupIndex', keyGroupIndex.toString());
    httpParams = httpParams.append('idToken', this.idToken);

    this.httpClient.post(this.baseUrl + 'keycategory/CreateKeyGroup', null,
      { params: httpParams }).subscribe(
        result => console.log(result),
        error => console.error(error));
  }

  deleteKeyGroup(keyCategoryId: string, keyGroupId: string) {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('keyCategoryId', keyCategoryId);
    httpParams = httpParams.append('keyGroupId', keyGroupId);
    httpParams = httpParams.append('idToken', this.idToken);

    this.httpClient.delete(this.baseUrl + 'keycategory/DeleteKeyGroup',
      { params: httpParams }).subscribe(
        result => console.log(result),
        error => console.error(error));
  }

  createKeyItem(keyCategoryId: string, keyGroupId: string, keyItemIndex: number) {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('keyCategoryId', keyCategoryId);
    httpParams = httpParams.append('keyGroupId', keyGroupId);
    httpParams = httpParams.append('keyItemIndex', keyItemIndex.toString());
    httpParams = httpParams.append('idToken', this.idToken);

    this.httpClient.post(this.baseUrl + 'keycategory/CreateKeyItem', null,
      { params: httpParams }).subscribe(
        result => console.log(result),
        error => console.error(error));
  }

  deleteKeyItem(keyCategoryId: string, keyGroupId: string, keyItemId: string) {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('keyCategoryId', keyCategoryId);
    httpParams = httpParams.append('keyGroupId', keyGroupId);
    httpParams = httpParams.append('keyItemId', keyItemId);
    httpParams = httpParams.append('idToken', this.idToken);

    this.httpClient.delete(this.baseUrl + 'keycategory/DeleteKeyItem',
      { params: httpParams }).subscribe(
        result => console.log(result),
        error => console.error(error));
  }
}
