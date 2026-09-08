import { Client } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6a9e9053003be1fde2dc");

export { client };

client.ping();
