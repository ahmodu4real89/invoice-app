import { InvoiceProduct } from "./invoiceProduct";


export interface Invoice{
    id:string,
    customerid:string,
    customername:string,
    deliveryaddress:string, 
    invoicedate:Date,
    taxcode:string,
    taxtype:string,
    taxperc:number,
    total:number,
    tax:number,
    nettotal:number,
    products:InvoiceProduct[]



}