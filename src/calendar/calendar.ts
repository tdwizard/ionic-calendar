import {Component, Input, Output, EventEmitter} from '@angular/core';
import * as moment from 'moment';
import * as _ from "lodash";

@Component({
    selector: 'ion-calendar',
    template: `
    <ion-grid>
        <ion-row justify-content-center>
            <ion-col col-auto (click)="back()">
                <ion-icon ios="ios-arrow-back" md="md-arrow-back"></ion-icon>
            </ion-col>
            <ion-col col-auto>
                <div>{{displayYear}} - {{displayMonth + 1 | monthName:lang}}</div>
            </ion-col>
            <ion-col col-auto (click)="forward()">
                <ion-icon ios="ios-arrow-forward" md="md-arrow-forward"></ion-icon>
            </ion-col>
        </ion-row>

        <ion-row>
            <ion-col class="center calendar-header-col" *ngFor="let head of weekHead">{{head | weekdayName:lang}}</ion-col>
        </ion-row>

        <ion-row class="calendar-row" *ngFor="let week of weekArray;let i = index">
            <ion-col class="center calendar-col" (click)="day.onClick?day.onClick():daySelect(day,i,j)"
            *ngFor="let day of week;let j = index"
            [ngClass]="[day.isThisMonth?'this-month':'not-this-month',day.isToday?'today':'',day.isSelect?'select':'',day.hasEvent&&day.eventCSS?day.eventCSS:'']">
                {{day.date}}
            </ion-col>
        </ion-row>

    </ion-grid>
`
})

export class Calendar {

    @Output() onDaySelect = new EventEmitter<dateObj>();
    @Output() onMonthSelect = new EventEmitter<any>();
    @Output() currentMonthYearDate = new EventEmitter<Date>();
    @Input() events: Array<singularDate> = [];
    @Input() lang: string;

    currentYear: number = moment().year();
    currentMonth: number = moment().month();
    currentDate: number = moment().date();
    currentDay: number = moment().day();

    displayYear: number = moment().year();
    displayMonth: number = moment().month();

    dateArray: Array<dateObj> = []; // Array for all the days of the month
    weekArray = []; // Array for each row of the calendar
    lastSelect: number = 0; // Record the last clicked location

    weekHead: number[] = [0, 1, 2, 3, 4, 5, 6];

    constructor() {
        this.today();
        this.createMonth(this.displayYear, this.displayMonth);
    }

    ngOnChanges() {
        this.createMonth(this.displayYear, this.displayMonth);
    }

    ngDoCheck() {
        this.createMonth(this.displayYear, this.displayMonth);
    }

    public convertToMonthYearDate(month, year) {
        return new Date(Date.UTC(year, month, 1));
    }

    // Jump to today
    today() {
        this.displayYear = this.currentYear;
        this.displayMonth = this.currentMonth;
        this.createMonth(this.currentYear, this.currentMonth);

        // Mark today as a selection
        let todayIndex = _.findIndex(this.dateArray, {
            year: this.currentYear,
            month: this.currentMonth,
            date: this.currentDate,
            isThisMonth: true
        })
        this.lastSelect = todayIndex;
        this.dateArray[todayIndex].isSelect = true;

        this.onDaySelect.emit(this.dateArray[todayIndex]);
    }

    isInEvents(year, month, date) {
        var i = 0, len = this.events.length;
        for (; i < len; i++) {
            if (this.events[i].year == year && this.events[i].month == month && this.events[i].date == date) {
                return true;
            }
        }
        return false;
    }

    getEventRecord(year, month, date): any {
        var result = this.events.find((el) => {
            return el.year == year && el.month == month && el.date == date;
        });
        return result ? result : {};
    }

    createMonth(year: number, month: number) {
        this.currentMonthYearDate.emit(this.convertToMonthYearDate(month, year));
        this.dateArray = []; // Clear last month's data
        this.weekArray = []; // Clear week data

        let firstDay;
        // The day of the week on the first day of the current month of
        // selection determines how many days to take out last month. Sunday
        // does not show last month, Monday shows the previous month, Tuesday
        // shows the last two days

        let preMonthDays; // The number of days for the previous month
        let monthDays; // The number of days for the month
        let weekDays: Array<dateObj> = [];

        firstDay = moment({year: year, month: month, date: 1}).day();
        // The number of days last month
        if (month === 0) {
            preMonthDays = moment({year: year - 1, month: 11}).daysInMonth();
        } else {
            preMonthDays = moment({year: year, month: month - 1}).daysInMonth();
        }
        // The number of days this month
        monthDays = moment({year: year, month: month}).daysInMonth();

        // PREVIOUS MONTH
        // Add the last few days of the previous month to the array

        //get event record
        // let record = this.getEventRecord()

        if (firstDay !== 7) { // Sunday doesn't need to be shown for the previous month
            let lastMonthStart = preMonthDays - firstDay + 1; // From the last few months start
            for (let i = 0; i < firstDay; i++) {
                if (month === 0) {
                    let record = this.getEventRecord(year, 11, lastMonthStart + i);
                    this.dateArray.push({
                        year: year,
                        month: 11,
                        date: lastMonthStart + i,
                        isThisMonth: false,
                        isToday: false,
                        isSelect: false,
                        hasEvent: (this.isInEvents(year, 11, lastMonthStart + i)) ? true : false,
                        onClick: record.onClick,
                        eventCSS: record.eventCSS
                    })
                } else {
                    let record = this.getEventRecord(year, month - 1, lastMonthStart + i);
                    this.dateArray.push({
                        year: year,
                        month: month - 1,
                        date: lastMonthStart + i,
                        isThisMonth: false,
                        isToday: false,
                        isSelect: false,
                        hasEvent: (this.isInEvents(year, month - 1, lastMonthStart + i)) ? true : false,
                        onClick: record.onClick,
                        eventCSS: record.eventCSS
                    })
                }

            }
        }

        // Add the numeral for this month to the array
        for (let i = 0; i < monthDays; i++) {
            let record = this.getEventRecord(year, month, i + 1);
            this.dateArray.push({
                year: year,
                month: month,
                date: i + 1,
                isThisMonth: true,
                isToday: false,
                isSelect: false,
                hasEvent: (this.isInEvents(year, month, i + 1)) ? true : false,
                onClick: record.onClick,
                eventCSS: record.eventCSS
            })
        }

        if (this.currentYear === year && this.currentMonth === month) {
            let todayIndex = _.findIndex(this.dateArray, {
                year: this.currentYear,
                month: this.currentMonth,
                date: this.currentDate,
                isThisMonth: true
            })
            this.dateArray[todayIndex].isToday = true;
        }

        // Add the number of days next month to the array, with some months showing 6 weeks and some months showing 5 weeks
        if (this.dateArray.length % 7 !== 0) {
            let nextMonthAdd = 7 - this.dateArray.length % 7
            for (let i = 0; i < nextMonthAdd; i++) {
                let record = this.getEventRecord(year, 0, i + 1);
                if (month === 11) {
                    this.dateArray.push({
                        year: year,
                        month: 0,
                        date: i + 1,
                        isThisMonth: false,
                        isToday: false,
                        isSelect: false,
                        hasEvent: (this.isInEvents(year, 0, i + 1)) ? true : false,
                        onClick: record.onClick,
                        eventCSS: record.eventCSS
                    })
                } else {
                    let record = this.getEventRecord(year, month + 1, i + 1);
                    this.dateArray.push({
                        year: year,
                        month: month + 1,
                        date: i + 1,
                        isThisMonth: false,
                        isToday: false,
                        isSelect: false,
                        hasEvent: (this.isInEvents(year, month + 1, i + 1)) ? true : false,
                        onClick: record.onClick,
                        eventCSS: record.eventCSS
                    })
                }

            }
        }

        // All date data is now added to the dateArray array

        // Insert the date data into the new array every seven days
        for (let i = 0; i < this.dateArray.length / 7; i++) {
            for (let j = 0; j < 7; j++) {
                weekDays.push(this.dateArray[i * 7 + j]);
            }
            this.weekArray.push(weekDays);
            weekDays = [];
        }
    }

    back() {
        // Decrementing the year if necessary
        if (this.displayMonth === 0) {
            this.displayYear--;
            this.displayMonth = 11;
        } else {
            this.displayMonth--;
        }
        this.onMonthSelect.emit({
            'year': this.displayYear,
            'month': this.displayMonth
        });
        this.createMonth(this.displayYear, this.displayMonth);
    }

    forward() {
        // Incrementing the year if necessary
        if (this.displayMonth === 11) {
            this.displayYear++;
            this.displayMonth = 0;
        } else {
            this.displayMonth++;
        }
        this.onMonthSelect.emit({
            'year': this.displayYear,
            'month': this.displayMonth
        });
        this.createMonth(this.displayYear, this.displayMonth);
    }

    // Select a day, click event
    daySelect(day, i, j) {
        // First clear the last click status
        // if (this.lastSelect <= this.dateArray.length) {
        //     this.dateArray[this.lastSelect].isSelect = false;
        // }
        // Store this clicked status
        // this.lastSelect = i * 7 + j;
        // this.dateArray[i * 7 + j].isSelect = true;

        this.onDaySelect.emit(day);
    }
}

interface singularDate {
    year: number,
    month: number,
    date: number,
    onClick?: any,
    eventCSS?: string
}

// Each grid item of a calendar
interface dateObj {
    year: number,
    month: number,
    date: number, // What's the date?
    isThisMonth: boolean, // Is this the currently selected month?
    isToday?: boolean,
    isSelect?: boolean,
    hasEvent?: boolean,
    onClick?: any,
    eventCSS?: string,
}
