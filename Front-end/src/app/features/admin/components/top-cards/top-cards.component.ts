import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../admin/Services/order.service';


@Component({
  selector: 'app-top-cards',
  standalone: true,
  imports: [CommonModule],
  providers: [OrderService],
  templateUrl: './top-cards.component.html',
  styleUrl: './top-cards.component.css',
})
export class TopCardsComponent implements OnInit {
  orders: any;
  totalSales = 0;
  rejected = 0;
  accepted = 0;
  pending = 0;
  weekly: any;
  weeklyOrders: any;
  daily: any;
  dailyOrders: any;
  topcards: any;
  dailySales: any;
  totalDailySales = 0;
  constructor(private myorderService: OrderService) { }

  ngOnInit() {
    this.updateTopCards();
    this.myorderService.weeklyOrders().subscribe(
      (data: any) => {
        if (data && data[0]) {
          this.weeklyOrders = data[0].totalOrders;
          this.updateTopCards();
        }
      },
      (error: any) => console.log(error)
    );

    this.myorderService.dailyOrders().subscribe(
      (data: any) => {
        if (data && data[0]) {
          this.dailyOrders = data[0].totalOrders || 0;
        } else {
          this.dailyOrders = 0;
        }
        this.updateTopCards();
      },
      (error: any) => console.log(error)
    );

    this.myorderService.weeklySales().subscribe(
      (data: any) => {
        if (data && data[0]) {
          this.totalSales = data[0].totalSales || 0;
          this.updateTopCards();
        }
      },
      (error: any) => console.log(error)
    );

    this.myorderService.dailySales().subscribe(
      (data: any) => {
        if (data && data[0]) {
          this.totalDailySales = data[0].totalSales || 0;
        } else {
          this.totalDailySales = 0;
        }
        this.updateTopCards();
      },
      (error: any) => console.log(error)
    );
  }

  updateTopCards() {
    this.topcards = [
      {
        bgcolor: 'success',
        icon: 'bi bi-wallet',
        title: this.totalSales || 0,
        subtitle: 'Weekly Sales',
      },
      {
        bgcolor: 'danger',
        icon: 'bi bi-coin',
        title: this.totalDailySales || 0,
        subtitle: 'Daily Sales',
      },
      {
        bgcolor: 'warning',
        icon: 'bi bi-basket3',
        title: this.weeklyOrders || 0,
        subtitle: 'Weekly Orders',
      },
      {
        bgcolor: 'info',
        icon: 'bi bi-bag',
        title: this.dailyOrders || 0,
        subtitle: 'Daily Orders',
      },
    ];
  }
}
