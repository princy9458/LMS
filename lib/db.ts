import { dbConnect } from '@/lib/dbConnect';

const connectDB = dbConnect;

export default connectDB;
export { connectDB, dbConnect };
