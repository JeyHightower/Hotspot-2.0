import * as dotenv from 'dotenv';
dotenv.config();
const config = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8000,
    dbFile: process.env.DB_FILE,
    jwtConfig: {
        secret: process.env.JWT_SECRET || 'super-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || 604800
    },
    isProduction: process.env.NODE_ENV === 'production'
};
export default config;
