router.get('/current', requireAuth, async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;
  // ... rest of the code
}); 