import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../models/customer';
import { Tax } from '../models/tax';
import { Product } from '../models/product';
import { Invoice } from '../models/invice';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
apiUrl= 'http://localhost:3000/'
  constructor(private http :HttpClient) { }
  getAllCustomers(){
  return this.http.get<Customer[]>(`${this.apiUrl}customer`)
  };

  getAllCustomerById(customerid:string){
    return this.http.get<Customer>(`${this.apiUrl}customer/${customerid}`)
    }

    
    getAllTax(){
    return this.http.get<Tax[]>(`${this.apiUrl}tax`)
    };
  
    getTaxById(id:string){
      return this.http.get<Tax>(`${this.apiUrl}tax/${id}`)
      }

      
    getAllProducts(){
      return this.http.get<Product[]>(`${this.apiUrl}product`)
      };
    
      getProductById(productcode:string){
        return this.http.get<Product>(`${this.apiUrl}product/${productcode}`)
        };


        
    getAllInvoice(){
      return this.http.get<Invoice[]>(`${this.apiUrl}invoice`)
      };
    
      getInvoiceById(id:string){
        return this.http.get<Invoice>(`${this.apiUrl}invoice/${id}`)
        };
        createInvoice(data:Invoice){
          return this.http.post<Invoice>(`${this.apiUrl}invoice/`, data)
        };

        updateInvoice(data:Invoice){
          return this.http.put<Invoice>(`${this.apiUrl}invoice/${data.id}`, data)
        };

        
        deleteInvoice(id:string){
          return this.http.delete<Invoice>(`${this.apiUrl}invoice/${id}`)
        }
}
