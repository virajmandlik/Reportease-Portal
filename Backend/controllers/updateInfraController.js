const db = require('../db/dbConnection');

const putInfraChanges = (req, res) => {
  const { infra_id } = req.params;
  const { department, infra_desc, budget, start_date, end_date } = req.body;

  const queryFindDept = "SELECT dept_id FROM Department WHERE dept_name = ?";

  db.query(queryFindDept, [department], (err, userResults) => {
    if (err) {
      console.error('Error finding department:', err);
      return res.status(500).send('Error retrieving dept information');
    }

    if (userResults.length === 0) {
      return res.status(404).send("Dept not found!");
    }

    const userId = userResults[0].dept_id;
    console.log('DeptID:', userId);

    if (!userId) {
      return res.status(404).send("Dept does not exist.");
    }

    const queryUpdateClub = `
      UPDATE infrastructure 
      SET dept_id = ?, 
          description = ?,
          budget = ?,
          startdate = ?,
          enddate = ?
      WHERE infra_id = ?`;

    db.query(
      queryUpdateClub,
      [userId, infra_desc, budget, start_date, end_date, infra_id],
      (err, updateResults) => {
        if (err) {
          console.error('Error updating infrastructure:', err);
          return res.status(500).send('Error updating infrastructure information');
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).send("Infrastructure not found!");
        }

        // Respond with success message
        res.status(200).json({
          message: "Infrastructure details updated successfully.",
          updatedFields: { department, infra_desc, budget, start_date, end_date },
        });
        console.log('Updated infrastructure Details:', {
          department, infra_desc, budget, start_date, end_date
        });
      }
    );
  });
};

module.exports = { putInfraChanges };
