import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../service/invoice.service';
import { Customer } from '../../models/customer';
import { Subscription } from 'rxjs';
import { Tax } from '../../models/tax';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { ToastrService } from 'ngx-toastr';
import { Invoice } from '../../models/invice';
import { InvoiceProduct } from '../../models/invoiceProduct';


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create.component.html'
})
export class CreateComponent implements OnInit, OnDestroy {
  title = 'Create Invoce'
  router = inject(Router);
  activateRoute = inject(ActivatedRoute);
  invoiceService = inject(InvoiceService);

  customerList: Customer[] = [];
  taxList: Tax[] = [];
  productList: Product[] = [];
  invoiceProducts!: FormArray<any>;
  invoiceProduct!: FormGroup<any>;
  summarytotal = 0;
  summarytax = 0;
  summarynettotal = 0;
  custtaxtype = "Z";
  custtaxperc = 0;
  subscription = new Subscription();
  isEdit=false;
  keyValue= '';

  

  invoiceForm: FormGroup
  constructor(private fb: FormBuilder, private toast: ToastrService,) {
    this.invoiceForm = this.fb.group({
      invoiceno: this.fb.control({ value: '', disabled: true }),
      invoicedate: this.fb.control(new Date(), Validators.required),
      customerid: this.fb.control('', Validators.required),
      customername: this.fb.control(''),
      taxcode: this.fb.control(''),
      address: this.fb.control(''),
      tax: this.fb.control(0),
      total: this.fb.control(0),
      nettotal: this.fb.control(0),
      products: this.fb.array([])
    });
  };
  

  get invProduct() {
    return this.invoiceForm.get('products') as FormArray;
  };


  ngOnInit(): void {
    this.loadCustomer();
    this.loadTax();
    this.loadProduct();
   this.keyValue =  this.activateRoute.snapshot.paramMap.get('invoiceno') as string;
   if (this.keyValue != null) {
    this.isEdit = true;
    this.title = 'Edit Invoice'
    this.populateeditdata(this.keyValue);
  }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  };

  loadCustomer() {
    let sub1 = this.invoiceService.getAllCustomers().subscribe(res => {
      console.log(res, 'reees')
      this.customerList = res
    });
    this.subscription.add(sub1)
  }

  loadTax() {
    let sub1 = this.invoiceService.getAllTax().subscribe(res => {
      console.log(res, 'reees')
      this.taxList = res
    });
    this.subscription.add(sub1)
  };

  loadProduct() {
    let sub1 = this.invoiceService.getAllProducts().subscribe(res => {
      this.productList = res
    });
    this.subscription.add(sub1)
  }

  customerchange(e: Event) {
    let customerid = (e.target as HTMLSelectElement).value
    let sub = this.invoiceService.getAllCustomerById(customerid).subscribe(res => {
      console.log(res, 'address')
      let _customer = res;
      if (_customer != null) {
        this.invoiceForm.controls['address'].setValue(_customer.address);
        this.invoiceForm.controls['customername'].setValue(_customer.name);
        this.invoiceForm.controls['taxcode'].setValue(_customer.taxcode);
        this.addnewProduct();
        this.taxchange(_customer.taxcode)
      }
    });
    this.subscription.add(sub)
  };

  populateeditdata(invoiceNo: string) {
    this.invoiceService.getInvoiceById(invoiceNo).subscribe(res => {
      let editdata = res;
      let processcount = 0;
      if (editdata != null) {
        for (let i = 0; i < editdata.products.length; i++) {
          this.addnewProduct();
        }
        this.invoiceForm.setValue({
          invoiceno: editdata.id.toString(),
          invoicedate: editdata.invoicedate ? new Date() : new Date(editdata.invoicedate),
          customerid: editdata.customerid,
          customername: editdata.customername,
          taxcode: editdata.taxcode,
          address: editdata.deliveryaddress,
          total: editdata.total,
          tax: editdata.tax,
          nettotal: editdata.nettotal,
          products: editdata.products
        })
        this.custtaxtype=editdata.taxtype;
        this.custtaxperc=editdata.taxperc;
        this.summarySum();
      }
    })
  };


  addnewProduct() {
    console.log('clicked')
    this.invoiceProducts = this.invoiceForm.get('products') as FormArray;
    let customerid= this.invoiceForm.value.customerid as string;
    if(this.isEdit){
      this.invoiceProducts.push(this.generateRow())
    }else{
      if (customerid !=null && customerid !='') {
        this.invoiceProducts.push(this.generateRow())
      } else {
        this.toast.warning('Select Customer and add Products', 'Please choose Customer')
      }
     
    }
    
  };


  productChange(index: number) {
    this.invoiceProducts = this.invoiceForm.get('products') as FormArray;
    this.invoiceProduct = this.invoiceProducts.at(index) as FormGroup;
    let productcode = this.invoiceProduct.get('productid')?.value;
    let sub = this.invoiceService.getProductById(productcode).subscribe(res => {
      let _product = res
      if (_product != null) {
        this.invoiceProduct.get('name')?.setValue(_product.name);
        this.invoiceProduct.get('price')?.setValue(_product.price);
        this.productSum(index)
      }
    });
    this.subscription.add(sub)
  };

  productSum(index: number) {
    this.invoiceProducts = this.invoiceForm.get('products') as FormArray;
    this.invoiceProduct = this.invoiceProducts.at(index) as FormGroup;
    let qty = this.invoiceProduct.get('qty')?.value;
    let price = this.invoiceProduct.get('price')?.value;
    let total = qty * price;
    this.invoiceProduct.get('total')?.setValue(total)
    this.summarySum()
  };

  summarySum() {
    let array = this.invoiceForm.getRawValue().products;
    let sumtotal = 0;
    let sumtax = 0;
    let sumnettotal = 0;
    array.forEach((element: any) => {
      sumtotal = sumtotal + element.total;
    });

    // tax calculation
    if (this.custtaxtype == 'E') {
      if (this.custtaxperc > 0) {
        sumtax = (this.custtaxperc / 100) * sumtotal;
        sumnettotal = sumtotal + sumtax;
      }
    } else if (this.custtaxtype == 'I') {
      sumtax = sumtotal - (sumtotal * (100 / (100 + this.custtaxperc)))
      sumnettotal = sumtotal + sumtax;

    } else {
      sumtax = 0
      sumnettotal = sumtotal;
    }

    this.invoiceForm.get('total')?.setValue(sumtotal);
    this.invoiceForm.get('tax')?.setValue(sumtax);
    this.invoiceForm.get('nettotal')?.setValue(sumnettotal);
    this.summarytotal = sumtotal;
    this.summarytax = sumtax;
    this.summarynettotal = sumnettotal
  };


  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  taxchange(taxcode: string) {
    this.invoiceService.getTaxById(taxcode).subscribe(res => {
      let _tax = res;
      if (_tax != null) {
        this.custtaxtype = _tax.type;
        this.custtaxperc = _tax.perc;
        this.summarySum()
      }
    })
  };




  generateRow() {
    return this.fb.group({
      productid: this.fb.control('', Validators.required),
      name: this.fb.control(''),
      qty: this.fb.control(1),
      price: this.fb.control(0),
      total: this.fb.control({ value: 0, disabled: true })
    })
  };


  deleteProduct(index:number){
    if(confirm('Do you want to remove ? ')){
      this.invProduct.removeAt(index);
      this.summarySum();
  
    }
   
  };



  saveInvoice() {
    if(this.invoiceForm.valid){
      let _invoice:Invoice={
        id: this.invoiceForm.value.id,
        customerid: this.invoiceForm.value.customerid as string,
        customername: this.invoiceForm.value.customername as string,
        deliveryaddress: this.invoiceForm.value.address as string,
        invoicedate: this.invoiceForm.value.customerid as Date,
        taxcode: this.invoiceForm.value.taxcode as string,
        taxtype: this.custtaxtype,
        taxperc: this.custtaxperc,
        total: this.invoiceForm.value.total as number,
        tax: this.invoiceForm.value.tax as number,
        nettotal: this.invoiceForm.value.nettotal as number,
        products: this.invoiceForm.getRawValue().products as InvoiceProduct[]
      
      }
      if (this.isEdit) {
        _invoice.id=this.keyValue;
        this.invoiceService.updateInvoice(_invoice).subscribe(res=>{
          this.toast.success('Update successfully.', 'Success');
          this.goBack();
        })
      } else {
        
      this.invoiceService.createInvoice(_invoice).subscribe(res=>{
        this.toast.success('Created Successfull');
        this.goBack()
      })
      }

    }
     };
  goBack() {
    this.router.navigateByUrl('/invoice')
  }
}
