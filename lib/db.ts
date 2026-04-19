import DatabaseService from '@/lib/services/DatabaseService';

export async function connectToDatabase() {
  const dbService = DatabaseService.getInstance();
  await dbService.connect();
}

export async function disconnectFromDatabase() {
  const dbService = DatabaseService.getInstance();
  await dbService.disconnect();
}

export function getDatabaseStatus() {
  const dbService = DatabaseService.getInstance();
  return dbService.getConnectionStatus();
}

// Legacy function for backward compatibility
export default async function dbConnect() {
  await connectToDatabase();
  return DatabaseService.getInstance();
}