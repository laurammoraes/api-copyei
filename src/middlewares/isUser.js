import jwt from "jsonwebtoken";

export async function isUser(req, res, next) {
  try {
    /*  Simular Header authorization para requisições GET diretas */
    const directCookie = req.cookies.copyei_user
      ? `Bearer ${req.cookies.copyei_user}`
      : null;

    /* Obter authorization header */
    const authorization = req.headers["authorization"] || directCookie;
    if (!authorization)
      return res.status(401).json({ message: "Not Authorized" });

    /* Validar authorization header */
    const authorizationValuesArr = authorization.split(" ");
    const token = authorizationValuesArr[1];
    if (authorizationValuesArr[0] !== "Bearer" || !token)
      return res.status(401).json({ message: "Not Authorized" });

    /* Validar JWT token */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Not Authorized" });

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not Authorized" });
  }
}
