import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    id?: string;
    name?: string;
    email?: string;
}

export function decodeToken(token: string): DecodedToken | null {
    try {
        const decoded = jwt.decode(token) as DecodedToken | null;
        return decoded;
    } catch (error) {
        console.error("Token decode error:", error);
        return null;
    }
}
