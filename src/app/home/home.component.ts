import { Component } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-home',
  imports: [DialogModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    private firestore: FirebaseService,
    private router: Router,

  ) { }

  visible: boolean = false;
  dragAnimated = false;
  dropAnimated = false;
  menuStyle: {} = {
    width: '28rem',
    height: '40rem',
    backgroundImage: 'url(' + '/menuH.jpg' + ')',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center'
  };

  ngOnInit() {
    setTimeout(() => {
      this.dragAnimated = true;
      this.dropAnimated = true;
    }, 500);


    setTimeout(() => {
      this.visible = true;
    }, 2000);
  }

  startLobby() {
    this.firestore.createLobby().then((lobbyId: string) => {
      this.router.navigate(['lobby', lobbyId]);
    });
  }

  closeDialog() {
    this.visible = false;
  }

  showDialog() {
    this.visible = true;
  }

  onShow() {
    document.body.classList.add('animate-slide');
  }
}

