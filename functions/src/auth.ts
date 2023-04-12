import { Request, Response } from "express";
import admin from "firebase-admin";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: Function,
) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer")) {
    return res.status(401).send();
  }

  const split = authorization.split("Bearer ");
  if (split.length !== 2) {
    return res.status(401).send();
  }
  const token = split[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("decodedToken", JSON.stringify(decodedToken));
    res.locals = {
      ...res.locals,
      uid: decodedToken.uid,
      email: decodedToken.email,
      linkedCompanies: decodedToken.linkedCompanies,
    };
    return next();
  } catch (err: any) {
    console.error(`[${err.code}] ${err.message}`);
    return res.status(401).send();
  }
}

export function isAuthorized(opts: {
  hasRole: Array<"admin" | "manager" | "user">;
  allowSameUser?: boolean;
}) {
  return (req: Request, res: Response, next: Function) => {
    const { role, uid } = res.locals;
    const { id } = req.params;

    if (opts.allowSameUser && id && uid === id) {
      return next();
    }

    if (!role) {
      return res.status(403).send();
    }

    if (opts.hasRole.includes(role)) {
      return next();
    }

    return res.status(403).send();
  };
}
