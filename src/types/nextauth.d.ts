import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

// DefaultUserを拡張してidを追加します
declare module 'next-auth' {
    interface User extends DefaultUser {
        id: string;
    }

    // DefaultSessionを拡張してuserオブジェクトにidを追加します
    interface Session extends DefaultSession {
        user: {
        id: string;
        } & DefaultSession['user'];
    }
    }

    // DefaultJWTを拡張してidを追加します
    declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string;
    }
}