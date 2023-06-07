import { Client, Account, Databases } from 'appwrite';

const projectId = "64666c9ec73c936a8d12";
const apiEndPoint = "https://cloud.appwrite.io/v1";

const client = new Client();

client.setEndpoint( apiEndPoint ).setProject( projectId );

//Account
export const account = new Account( client );

//Database
export const appDatabase = new Databases(client)