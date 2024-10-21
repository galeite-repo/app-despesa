import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  private _authService = inject(AuthService);
  private _router = inject(Router);
  userData!: any;


  ngOnInit(): void {
    this._authService.session().then((obj) => {
      this.userData = obj.data.session?.user.user_metadata
    })
  }
  async logout() {
    await this._authService.logout();

    this._router.navigateByUrl('/login');
  }

}
