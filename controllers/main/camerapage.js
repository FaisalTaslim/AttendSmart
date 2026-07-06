exports.display = async (req, res) => {
  const renderData = req.query;
  
  res.render("dashboards/capture-attendance", renderData);
};