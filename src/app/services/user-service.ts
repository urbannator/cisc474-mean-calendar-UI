import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { User } from '../user/user';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { of } from 'rxjs/observable/of';

import { Router } from '@angular/router';

@Injectable()
export class UserService {

    private apiURL = 'http://localhost:3000/auth/';
    private headers = new Headers({
        'Content-Type': 'application/json',
    });

    activeUserView: number;
    loggedInUser: User;

    constructor(private http: Http, private router: Router) { }


    register(username: string, password: string, firstName: string, lastName: string, userId: number): Observable<any> {

        const finalURL = this.apiURL + 'users/register';
        return this.http.post(finalURL,
            { userId: userId, username: username, password: password, firstName: firstName, lastName: lastName },
            { headers: this.headers })
            .map(user => {
                this.loggedInUser = user.json().user;
                this.activeUserView = user.json().user.userId;
                this.router.navigate(['calendar/' + userId]);
            });
    }

    login(username: string, password: string): Observable<any> {
        const finalURL = this.apiURL + 'users/login';
        return this.http.post(finalURL,
            { username: username, password: password },
            { headers: this.headers })
            .map(user => {
                this.loggedInUser = user.json().user;
                this.activeUserView = user.json().user.userId;
                this.router.navigate(['calendar/' + this.loggedInUser.userId]);
            });
    }

    getUserCount(): Promise<any> {
        const finalURL = this.apiURL + 'users/';

        return this.http.get(finalURL, { headers: this.headers })
            .toPromise()
            .then(res => res.json());

    }

    getUsersByName(term: string): Observable<any[]> {
        const finalURL = this.apiURL + 'users/search/' + term;

        return this.http
            .get(finalURL)
            .map(data => {
                return data.json();
            });
    }

    getUserById(id: number): Observable<any> {
        const finalURL = this.apiURL + 'users/' + id;

        return this.http
            .get(finalURL)
            .map(data => {
                return data.json();
            });
    }

    setActiveUserView(input: number): void {
        this.activeUserView = input;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
