import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
interface UserStorage {
    id: number,
    name: string,
    email: string
}
@Injectable({
    providedIn: "root",
})
export class UserService {
    private http = inject(HttpClient)
    private router = inject(Router)
    private userInfo = signal<UserStorage | null>(this.loadUserFromLocalStorage())
    private urlApi = environment.urlApi

    constructor(){
        effect(() => {
            this.syncUserInfoWithLocalStorage()
        })
    }

       syncUserInfoWithLocalStorage() {
        if (this.userInfo()) {
            localStorage.setItem('UserData', JSON.stringify(this.userInfo()))
        } else {
            localStorage.removeItem('UserData')
        }
    }

    setCurrentUser(user: UserStorage | null) {
        this.userInfo.set(user)
    }

    getUserInfo() {
        return this.userInfo.asReadonly()
    }

    isUserLogged() {
        return !!this.userInfo()
    }

    private loadUserFromLocalStorage(): UserStorage | null {
        const storedUser = localStorage.getItem('UserData')
        return storedUser ? JSON.parse(storedUser) : null
    }

    public login(email: string, password: string) {
        return this.http.post<any>(`${this.urlApi}/api/auth/login`, { email, password })
            .subscribe((response) => {
                const { access_token, user } = response.data
                localStorage.setItem('access_token', access_token)
                this.setCurrentUser(user)
                this.router.navigate(['/dashboard'])
            })
    }

    public register(name: string, email: string, password: string, phone: string) {
        return this.http.post<any>(`${this.urlApi}/api/auth/register`, { name, email, password, phone })
            .subscribe((response) => {
                const { access_token, user } = response.data
                localStorage.setItem('access_token', access_token)
                this.setCurrentUser(user)
                this.router.navigate(['/dashboard'])
            })
    }
}