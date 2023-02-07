const origin = "https://chatikservice.azurewebsites.net/";
const api = origin + "api";

export const environment = {
  production: true,
  userChats: api + "/Chats/chats/",
  randomUser: api + "/Chats/randomUser",
  firstMessages:api +  "/Chats/messages/",
  sendMessage:api +  "/Messages/send",
  editMessage :api +  "/Messages/edit",
  delete: api + "/Messages/delete/",
  createPrivateChat:api +  "/Chats/create",
  login: api + "/Accounts/login",
  addMembers:api+"/Chats/addMembers",
  signalR: origin + "chat",
  refresh:api + "Tokens/refresh"
};
