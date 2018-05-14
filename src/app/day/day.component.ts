import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { EventService } from '../services/event-service';

import { Event } from '../event/event';
import { UserService } from '../services/user-service';

@Component({
    selector: 'app-day-component',
    templateUrl: 'day.component.html',
    styleUrls: ['day.component.css']
})
export class DayComponent implements OnChanges, OnInit {


    @Input()
    dayNum: number;

    @Input()
    monthNum: number;

    @Input()
    yearNum: number;

    @Input()
    weekday: number;

    dayDate: string;

    @Input()
    userId: number;

    events: Array<Event>;


    @Input()
    eventList: Event[];

    dayEvents: { event: Event, names: string[] }[];

    recipientSearchValue = '';
    recipientList: { fullName: string, userId: number }[];
    searchedRecipients: { fullName: string, userId: number }[];

    private eventDate: string;
    private startTime: string;
    private endTime: string;
    private title: string;
    private description: string;
    private userIds: number[];


    constructor(private eventService: EventService, private userService: UserService, private route: ActivatedRoute) {
        this.events = new Array<Event>();
        this.dayEvents = new Array();
        this.recipientList = new Array();
        this.searchedRecipients = new Array();
        this.userIds = new Array();

        // this.route.paramMap.switchMap((params: ParamMap) =>
        //     params.get('id')).subscribe(id => this.userId = parseInt(id, 10));
    }

    ngOnInit(): void {

    }

    ngOnChanges(): void {

        this.reload();
    }

    reload(): void {
        this.dayEvents = new Array();

        let monthNumStr = this.monthNum.toString();
        let dayNumStr = this.dayNum.toString();

        if (this.monthNum < 10) {
            monthNumStr = '0' + this.monthNum.toString();
        }
        if (this.dayNum < 10) {
            dayNumStr = '0' + this.dayNum.toString();
        }

        this.dayDate = this.yearNum + '-' + monthNumStr + '-' + dayNumStr;

        for (const event of this.eventList) {
            if (event.date === this.dayDate) {
                let fullNames: string[] = new Array();
                for (const id of event.userIds) {
                    this.userService.getUserById(id).subscribe(user => {
                        fullNames.push(user.fullName);
                    });
                }

                this.dayEvents.push({ event: event, names: fullNames });
            }
        }
    }

    searchRecipients(input: string): void {
        this.eventService.searchedRecipients = new Array();
        if (input) {
            this.userService.getUsersByName(input).subscribe(data => {
                for (let i = 0; i < data.length; i++) {
                    if (!this.eventService.searchedRecipients.includes(data[i]['fullName'])
                        && (this.eventService.recipientList.filter(e => e.userId === data[i]['userId']).length === 0)
                        && (data[i]['userId'] !== this.userService.loggedInUser.userId)) {
                        this.eventService.searchedRecipients.push({ fullName: data[i]['fullName'], userId: data[i]['userId'] });
                    }
                }
            });
        }
    }

    addRecipient(name: string, id: number): void {
        this.eventService.searchedRecipients = new Array();
        this.eventService.recipientList.push({ fullName: name, userId: id });
        this.eventService.recipientSearchValue = '';
    }

    removeRecipient(id: number) {
        this.eventService.recipientList = this.eventService.recipientList.filter(e => e.userId !== id);
    }

    editEventClick(id: number): void {
        this.eventService.recipientList = new Array();
        this.eventService.searchedRecipients = new Array();
        this.eventService.currEvent = id;


        this.eventService.getEventById(id).subscribe(event => {
            this.eventService.recipientList = new Array();

            this.eventService.eventDate = event.date;
            this.eventService.description = event.description;
            this.eventService.title = event.title;

            let sTime = event.startTime;
            let sString = sTime.toString();
            let eTime = event.endTime;
            let eString = eTime.toString();

            let sString2 = sString;
            let eString2 = eString;

            if (sTime < 1000) {
                sString2 = '0' + sString;
            }
            if (eTime < 1000) {
                eString2 = '0' + eString;
            }

            let sStringSlice = sString2.slice(0, 2) + ':' + sString2.slice(2, sString2.length);
            let eStringSlice = eString2.slice(0, 2) + ':' + eString2.slice(2, eString2.length);

            this.eventService.startTime = sStringSlice;
            this.eventService.endTime = eStringSlice;

            for (const userId of event.userIds) {
                this.userService.getUserById(userId).subscribe(user => {
                    if (user.userId !== this.userService.loggedInUser.userId) {
                        this.eventService.recipientList.push({
                            fullName: user.fullName,
                            userId: user.userId
                        });
                    }
                });
            }
        });

    }

    updateEventClick(): void {
        this.eventService.userIds = new Array();
        this.eventService.userIds.push(this.userService.loggedInUser.userId);
        for (const entry of this.eventService.recipientList) {
            this.eventService.userIds.push(entry.userId);
        }

        const startTimeSlice = this.eventService.startTime.slice(0, 2) + this.eventService.startTime
            .slice(3, this.eventService.startTime.length);
        const startTimeNumb = parseInt(startTimeSlice, 10);
        const endTimeSlice = this.eventService.endTime.slice(0, 2) + this.eventService.endTime.slice(3, this.eventService.endTime.length);
        const endTimeNumb = parseInt(endTimeSlice, 10);

        this.eventService.updateEvent(
            this.eventService.currEvent,
            this.eventService.userIds,
            this.eventService.eventDate,
            startTimeNumb,
            endTimeNumb,
            this.eventService.title,
            this.eventService.description
        ).subscribe(response => {
            this.eventService.getAllUserEvents(this.userService.loggedInUser.userId).then(list => {
                this.eventService.userEvents = list;
            });
        });

    }

    deleteEventClick(id: number): void {
        this.eventService.deleteEvent(id).subscribe(none => {
            this.eventService.getAllUserEvents(this.userService.loggedInUser.userId).then(list => {
                this.eventService.userEvents = list;
            });
        });
    }

    getMonth() {
        if (this.monthNum === 1) {
            return 'January';
        }
        else if (this.monthNum === 2) {
            return 'February';
        }
        else if (this.monthNum === 3) {
            return 'March';
        }
        else if (this.monthNum === 4) {
            return 'April';
        }
        else if (this.monthNum === 5) {
            return 'May';
        }
        else if (this.monthNum === 6) {
            return 'June';
        }
        else if (this.monthNum === 7) {
            return 'July';
        }
        else if (this.monthNum === 8) {
            return 'August';
        }
        else if (this.monthNum === 9) {
            return 'September';
        }
        else if (this.monthNum === 10) {
            return 'October';
        }
        else if (this.monthNum === 11) {
            return 'November';
        }
        else if (this.monthNum === 12) {
            return 'December';
        }
    }

    getWeekday(): string {
        switch (this.weekday) {
            case 1: {
                return 'Sunday';
            }
            case 2: {
                return 'Monday';
            }
            case 3: {
                return 'Tuesday';
            }
            case 4: {
                return 'Wednesday';
            }
            case 5: {
                return 'Thursday';
            }
            case 6: {
                return 'Friday';
            }
            case 7: {
                return 'Saturday';
            }
        }
    }

    addColon(input: number): string {
        let pm = false;
        let output = '';

        if (input <= 59) {
            input += 1200;
        }
        else if (input >= 1300) {
            pm = true;
            input -= 1200;
        }
        else if (input >= 1200) {
            pm = true;
        }


        const inputStr = input.toString();
        if (inputStr.length === 3) {
            if (pm) {
                output = inputStr.substr(0, 1) + ':' + inputStr.substr(1) + ' PM';
            }
            else {
                output = inputStr.substr(0, 1) + ':' + inputStr.substr(1) + ' AM';
            }
        }
        else if (inputStr.length === 4) {
            if (pm) {
                output = inputStr.substr(0, 2) + ':' + inputStr.substr(2) + ' PM';
            }
            else {
                output = inputStr.substr(0, 2) + ':' + inputStr.substr(2) + ' AM';
            }
        }
        return output;
    }

}
