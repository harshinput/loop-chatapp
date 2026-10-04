export const checkAuth = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.status(200).json({ message: "User is authenticated", user: req.user });
};
