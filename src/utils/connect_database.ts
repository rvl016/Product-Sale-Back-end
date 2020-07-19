import { getConnectionOptions, createConnection } from "typeorm";

export const connectToDatabase = async () => {
  const connectionOptions = await getConnectionOptions( process.env.NODE_ENV);
  return createConnection( { ...connectionOptions, name: "default" })
    .catch( err => {
    console.error( "Database connection failed!");
    console.error( err);
  });
};