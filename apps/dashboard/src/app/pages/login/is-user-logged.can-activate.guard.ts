import { inject } from '@angular/core';
import { CanActivateFn, Router } from "@angular/router";
import { UserService } from '../../services/user.service';

export const isUserLogged: CanActivateFn = () => {
    const userService = inject(UserService)
    const router = inject(Router)

    if (userService.isUserLogged()) {
        return true
    }

    return router.navigateByUrl('/login')
}