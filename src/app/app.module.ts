import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { PopoverModule } from 'ngx-bootstrap/popover';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DayComponent } from './day/day.component';
import { MonthComponent } from './month/month.component';
import { CalendarComponent } from './calendar/calendar.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

import { EventService } from './services/event-service';
import { UserService } from './services/user-service';

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    MonthComponent,
    DayComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    PopoverModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule
  ],
  providers: [EventService, UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
