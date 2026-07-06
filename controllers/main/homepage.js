exports.display = async (req, res) => {
  let popupType = req.query["popup-type"] ?? null;
  let popupMessage = req.query["popup-message"] ?? null;

  res.render("index", {
    popupMessage,
    popupType,
  });
};