router.get("/manage", requireAuth, async (req, res) => {
  try {
    const spots = await Spot.findAll({
      where: {
        ownerId: req.user.id,
      },
    });
    return res.json({ Spots: spots });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});
