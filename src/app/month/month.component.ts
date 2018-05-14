import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../services/user-service';
import { EventService } from '../services/event-service';
import { Router } from '@angular/router';
import { User } from '../user/user';
import { Event } from '../event/event';


// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
    selector: 'app-month-component',
    templateUrl: 'month.component.html',
    styleUrls: ['month.component.css']
})
export class MonthComponent implements OnInit, OnChanges {

    currentMonthTitle: string;
    daysInMonth: number = 1;
    monthDayArray: number[];

    private eventDate: string;
    private startTime: string;
    private endTime: string;
    private title: string;
    private description: string;
    private userIds: number[];

    recipientSearchValue = '';
    recipientList: { fullName: string, userId: number }[];
    searchedRecipients: { fullName: string, userId: number }[];

    currentMonthNum: number;
    currentYearNum: number;

    dayString: string;

    searchValue = '';
    users: { fullName: string, userId: number }[];
    private searchTerms = new Subject<string>();



    constructor(private userService: UserService, private eventService: EventService, private router: Router) {
        this.monthDayArray = new Array();
        this.users = new Array();
        this.userIds = new Array();
        this.recipientList = new Array();
        this.searchedRecipients = new Array();

        this.eventService.getAllUserEvents(this.userService.loggedInUser.userId).then(list => {
            this.eventService.userEvents = list;
        });
    }

    ngOnInit() {
        // Return today's date and time
        const currentTime: Date = new Date();
        // returns the month (from 0 to 11)
        const month: number = currentTime.getMonth() + 1;
        this.currentMonthNum = month;
        // returns the day of the month (from 1 to 31)
        const day: number = currentTime.getDate();
        // returns the year (four digits)
        const year: number = currentTime.getFullYear();
        this.currentYearNum = year;
        // write output MM/dd/yyyy
        this.updateArray();
    }

    ngOnChanges() {
        this.monthDayArray = [];
        this.parseArray();

        this.eventService.getAllUserEvents(this.userService.loggedInUser.userId).then(list => {
            this.eventService.userEvents = list;
        });
    }

    search(input: string): void {
        this.users = new Array();
        if (input) {
            this.userService.getUsersByName(input).subscribe(data => {
                for (let i = 0; i < data.length; i++) {
                    if (!this.users.includes(data[i]['fullName'])
                    && (data[i]['userId'] !== this.userService.loggedInUser.userId)) {
                        this.users.push({fullName: data[i]['fullName'], userId: data[i]['userId']});
                    }
                }
            });
        }
    }


    viewCalendar(input: number): void {
        this.users = new Array();
        this.userService.setActiveUserView(input);
        this.router.navigate(['calendar/' + input]);
        this.searchValue = '';

        this.eventService.getAllUserEvents(input).then(list => {
            this.eventService.userEvents = list;
        });
    }

    returnHome(): void {
        this.userService.setActiveUserView(this.userService.loggedInUser.userId);
        this.router.navigate(['calendar/' + this.userService.loggedInUser.userId]);

        this.eventService.getAllUserEvents(this.userService.loggedInUser.userId).then(list => {
            this.eventService.userEvents = list;
        });
    }

    searchRecipients(input: string): void {
        this.searchedRecipients = new Array();
        if (input) {
            this.userService.getUsersByName(input).subscribe(data => {
                for (let i = 0; i < data.length; i++) {
                    if (!this.searchedRecipients.includes(data[i]['fullName'])
                        && (this.recipientList.filter(e => e.userId === data[i]['userId']).length === 0)
                        && (data[i]['userId'] !== this.userService.loggedInUser.userId)) {
                        this.searchedRecipients.push({fullName: data[i]['fullName'], userId: data[i]['userId']});
                    }
                }
            });
        }
    }

    addRecipient(name: string, id: number): void {
        this.searchedRecipients = new Array();
        this.recipientList.push({ fullName: name, userId: id});
        this.recipientSearchValue = '';
    }

    removeRecipient(id: number) {
        this.recipientList = this.recipientList.filter(e => e.userId !== id);
        console.log(this.recipientList);
    }

    addEventClick(): void {
        this.recipientList = new Array();
        this.searchedRecipients = new Array();

        this.eventDate = '';
        this.startTime = '';
        this.endTime = '';
        this.title = '';
        this.description = '';
    }

    createEventClick(): void {
        this.userIds = new Array();
        this.userIds.push(this.userService.loggedInUser.userId);
        for (const entry of this.recipientList){
            this.userIds.push(entry.userId);
        }

        const startTimeSlice = this.startTime.slice(0, 2) + this.startTime.slice(3, this.startTime.length);
        const startTimeNumb = parseInt(startTimeSlice, 10);
        const endTimeSlice = this.endTime.slice(0, 2) + this.endTime.slice(3, this.endTime.length);
        const endTimeNumb = parseInt(endTimeSlice, 10);

        this.eventService.getAllEvents().then(data => {
            if (data.length != null) {
                const newId = data[0]['eventId'] + 1;

                this.eventService.createEvent(
                    newId,
                    this.userIds,
                    this.eventDate,
                    startTimeNumb,
                    endTimeNumb,
                    this.title,
                    this.description
                ).subscribe(response => {
                    this.eventService.getAllUserEvents(this.userService.loggedInUser.userId).then(list => {
                        this.eventService.userEvents = list;
                    });
                });
            }
            else {
                this.eventService.createEvent(
                    1,
                    this.userIds,
                    this.eventDate,
                    startTimeNumb,
                    endTimeNumb,
                    this.title,
                    this.description
                ).subscribe(response => {
                    this.eventService.getAllUserEvents(this.userService.loggedInUser.userId).then(list => {
                        this.eventService.userEvents = list;
                    });
                });
            }
        });

    }

    getWeekDay(num: number): string {
        switch (num) {
            case 0: {
                return 'Sunday';
            }
            case 1: {
                return 'Monday';
            }
            case 2: {
                return 'Tuesday';
            }
            case 3: {
                return 'Wednesday';
            }
            case 4: {
                return 'Thursday';
            }
            case 5: {
                return 'Friday';
            }
            case 6: {
                return 'Saturday';
            }
        }
    }

    getCurrentYearTitle() {
        return this.currentYearNum;
    }


    getCurrentMonthTitle() {
        if (this.currentMonthNum == 1) {
            this.currentMonthTitle = "January";
        }
        else if (this.currentMonthNum == 2) {
            this.currentMonthTitle = "February";
        }
        else if (this.currentMonthNum == 3) {
            this.currentMonthTitle = "March";
        }
        else if (this.currentMonthNum == 4) {
            this.currentMonthTitle = "April";
        }
        else if (this.currentMonthNum == 5) {
            this.currentMonthTitle = "May";
        }
        else if (this.currentMonthNum == 6) {
            this.currentMonthTitle = "June";
        }
        else if (this.currentMonthNum == 7) {
            this.currentMonthTitle = "July";
        }
        else if (this.currentMonthNum == 8) {
            this.currentMonthTitle = "August";
        }
        else if (this.currentMonthNum == 9) {
            this.currentMonthTitle = "September";
        }
        else if (this.currentMonthNum == 10) {
            this.currentMonthTitle = "October";
        }
        else if (this.currentMonthNum == 11) {
            this.currentMonthTitle = "November";
        }
        else if (this.currentMonthNum == 12) {
            this.currentMonthTitle = "December";
        }
        return this.currentMonthTitle;
    }

    parseArray() {
        this.daysInMonth = howManyDaysInMonth(this.currentMonthNum, this.currentYearNum);
        var numberOfDaysPercedingFirstDay = new Date(this.currentYearNum + "-" + this.currentMonthNum).getDay()
        if (numberOfDaysPercedingFirstDay === 0) {
            numberOfDaysPercedingFirstDay = 7;
        }
        if (this.currentMonthNum > 9) {
            numberOfDaysPercedingFirstDay = (numberOfDaysPercedingFirstDay + 1);
        }
        for (let i = 0; i < 42; i++) {
            if (i < numberOfDaysPercedingFirstDay) {
                this.monthDayArray.push(0);
            }
            else if ((i - numberOfDaysPercedingFirstDay) < this.daysInMonth) {
                this.monthDayArray.push(i - numberOfDaysPercedingFirstDay + 1);
            }
            else {
                this.monthDayArray.push(0);
            }
        }
    }

    searchDays(input: string): void {
        console.log(input);
    }
    getPreviousMonth(){
        if(this.currentMonthNum == 1){
            this.currentYearNum = this.currentYearNum - 1;
            this.currentMonthNum = 12;
        }
        else{
            this.currentMonthNum = this.currentMonthNum - 1;
        }
        this.daysInMonth = howManyDaysInMonth(this.currentMonthNum,this.currentYearNum);
        var numberOfDaysPercedingFirstDay = new Date(this.currentYearNum + "-" + this.currentMonthNum).getDay()
        this.updateArray();
    }

    getNextMonth(){
        if(this.currentMonthNum == 12){
            this.currentYearNum = this.currentYearNum + 1;
            this.currentMonthNum = 1;
        }
        else{
            this.currentMonthNum = this.currentMonthNum + 1;
        }
        this.daysInMonth = howManyDaysInMonth(this.currentMonthNum,this.currentYearNum);
        var numberOfDaysPercedingFirstDay = new Date(this.currentYearNum + "-" + this.currentMonthNum).getDay();
        this.updateArray();
    }

    updateArray() {
        this.monthDayArray = [];
        this.parseArray();
    }

    logOut(): void {
        this.userService.loggedInUser = null;
        this.router.navigate(['login/']);
    }
}
function howManyDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}
