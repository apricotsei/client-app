import mysql from 'mysql2/promise';

const dbConfig = {
    // ★ Vercelの環境変数名に合わせる
    host: process.env.HOST,
    user: process.env.USERNAME, // 'USERNAME' に注意
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: parseInt(process.env.PORT || '4000', 10), // TiDB Cloudは通常4000番ポート
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// TypeScriptのグローバル空間にプロパティを拡張
declare global {
    var mysqlPool: mysql.Pool | undefined;
}

//以下10行はlocal環境で使用
// process.envオブジェクトを通じて.env.localからデータベース接続情報を取得
// const dbConfig = {
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     port: parseInt(process.env.MYSQL_PORT || '3306', 10),
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// };

let pool: mysql.Pool;

if (process.env.NODE_ENV === 'production') {
    // 本番環境では常に新しいプールを作成
    pool = mysql.createPool(dbConfig);
} else {
    // 開発環境では、グローバルオブジェクトにプールがなければ作成
    if (!global.mysqlPool) {
        global.mysqlPool = mysql.createPool(dbConfig);
    }
    pool = global.mysqlPool;
}

export const db = pool;