export async function logoutUser(req, res) {
  /* Limpar cookie do usuário */
  res.clearCookie("copyei_user");
  res.clearCookie("copyei_drive");
  
  return res.status(200).json({ message: "OK" });
}
