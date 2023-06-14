import { projectIdENV, apiEndPointENV } from '@env';
import { Client, Account, Databases, Storage } from 'appwrite';

const projectId = projectIdENV;
const apiEndPoint = apiEndPointENV;

const client = new Client();

client.setEndpoint( apiEndPoint ).setProject( projectId );

//Account
export const account = new Account( client );

//Database
export const appDatabase = new Databases( client )

//Storage
export const storage = new Storage(client);