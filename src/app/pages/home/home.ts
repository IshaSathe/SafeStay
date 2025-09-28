import { Component, OnInit, NgZone  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { interval } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  images: string[] = [
    'https://img1.10bestmedia.com/Images/Photos/419369/GettyImages-1404885159_54_990x660.jpg?auto=webp&width=3840&quality=75',
    'logo1.png'
  ];
  currentIndex = 0;

   constructor() {
    interval(5000).subscribe(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      console.log('Switched to:', this.images[this.currentIndex]);
    });
  }


}
