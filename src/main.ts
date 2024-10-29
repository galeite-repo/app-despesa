import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

const configWithLocale = {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};

bootstrapApplication(AppComponent, configWithLocale)
  .catch((err) => console.error(err));