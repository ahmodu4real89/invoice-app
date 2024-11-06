import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { InvoiceService } from '../../service/invoice.service';
import { Invoice } from '../../models/invice';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, OnDestroy{
  invoiceService= inject (InvoiceService)
  router= inject(Router);
  toast = inject(ToastrService);
  invoiceList:Invoice[] = [];
  subscription = new Subscription()
  ngOnInit(): void {
   this.loadInvoice()
  };

  loadInvoice(){
    let sub =  this.invoiceService.getAllInvoice().subscribe(res=>{
      this.invoiceList = res
    });
    this.subscription.add(sub)
  }

  

  editList(invoice:any){
    this.router.navigateByUrl('invoice/edit/'+invoice)
  };

  deleteList(invoice:any){
    if(confirm('Do you want delete this Invoice?')){
      this.invoiceService.deleteInvoice(invoice).subscribe(item=>{
         this.toast.success('Deleted successfully.')
         this.loadInvoice();
      })
    }
  };

  goTo(){
    this.router.navigateByUrl('/')
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


}
