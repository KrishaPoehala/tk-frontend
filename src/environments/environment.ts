// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const origin = "https://localhost:7139/";
const api = origin + "api"
export const environment = {
  production: false,
  api: origin + "api/",
  userChats: api + "/Chats/chats/",
  randomUser: api + "/Chats/randomUser",
  firstMessages: api + "/Chats/messages/",
  sendMessage:  api + "/Messages/send",
  editMessage :  api + "/Messages/edit",
  delete: api + "/Messages/delete/",
  createChat:  api + "/Chats/create",
  login: api +  "/Accounts/login",
  register: api + "/Accounts/register",
  refresh:api + "/Tokens/refresh",
  addMembers:api+"/Members/addMembers",
  signalR: origin+ "chat",
  gyazoAccessToken: "pFhYP7Ke_VKSLEfG3PFUsBcmCZffUYJdKaROd_1Ws1k",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
