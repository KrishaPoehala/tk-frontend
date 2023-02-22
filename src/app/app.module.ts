import { environment } from 'src/environments/environment';
import { GroupIdInterceptor } from './interceptors/group-id.interceptor';
import { PermissionsMenuComponent } from './components/permissions-menu/permissions-menu';
import { MatIconModule } from '@angular/material/icon';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AuthGuard as AuthGuard } from './auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpService } from 'src/app/services/http.service';
import { UserService } from 'src/app/services/user.service';
import { Routes, RouterModule } from '@angular/router';
import { DeleteMessageModalComponent } from './components/delete-message-modal/delete-message-modal.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { CreateGroupComponent } from './components/create-group/create-group.component';
import { AddMembersComponent } from './components/add-members/add-members.component';
import { JoinGroupModalComponent } from './components/join-group-modal/join-group-modal.component';
import { MessagesModule } from "./components/messages/messages.module";
import { ChatsModule } from "./components/chats/chats.module";
import { UpdatePermissionsComponent } from './components/update-permissions/update-permissions.component';
import { MessageSeenListComponent } from './components/message-seen-list/message-seen-list.component';
import { GoogleLoginProvider, SocialAuthService, GoogleInitOptions } from '@abacritt/angularx-social-login';
import {SocialLoginModule} from '@abacritt/angularx-social-login'
const routes:Routes=[
  {path:'', component: MainPageComponent, canActivate:[AuthGuard]},
  {path:'login', component: LoginComponent},
  {path:'register', component:RegisterComponent},
];

@NgModule({
    declarations: [
        AppComponent,
        DeleteMessageModalComponent,
        LoginComponent,
        RegisterComponent,
        MainPageComponent,
        CreateGroupComponent,
        AddMembersComponent,
        JoinGroupModalComponent,
        PermissionsMenuComponent,
        UpdatePermissionsComponent,
        MessageSeenListComponent,
        
        
    ],
    providers: [HttpService, UserService,SocialAuthService,
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        JwtHelperService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: GroupIdInterceptor, multi: true },
        {
            provide:'SocialAuthServiceConfig',
            useValue:{
                autoLogin:true,
                providers:[{
                    id:GoogleLoginProvider.PROVIDER_ID,
                    provider:new GoogleLoginProvider(environment.clientId,
                    {
                        scopes:'profile email',
                    })
                }]
            }
        }

    ],
    bootstrap: [AppComponent],
    imports: [
        RouterModule.forRoot(routes),
        BrowserModule,
        SocialLoginModule,
        AppRoutingModule,
        NgbModule,
        ChatsModule,
        MatIconModule,
        MessagesModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class AppModule { }
