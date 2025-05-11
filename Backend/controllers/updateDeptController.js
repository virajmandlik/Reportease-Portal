const db = require('../db/dbConnection');

// Controller function to update institute details
const putDeptChanges = (req, res) => {
  const { department_id } = req.params;
  const { dept_name, coordemail } = req.body;

  const queryFindUser = "SELECT user_id FROM User WHERE email_id = ?";

  db.query(queryFindUser, [coordemail], (err, userResults) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).send('Error retrieving user information');
    }

    if (userResults.length === 0) {
      return res.status(404).send("User not found!");
    }

    const userId = userResults[0].user_id;
    console.log('UserID:', userId);

    if (!userId) {
      return res.status(404).send("User does not exist.");
    }

    const queryUpdateDepartment = `
      UPDATE Department 
      SET dept_name = ?, 
          coordinator_id = ?
      WHERE dept_id = ?`;

    db.query(
      queryUpdateDepartment,
      [dept_name, userId, department_id],
      (err, updateResults) => {
        if (err) {
          console.error('Error updating department:', err);
          return res.status(500).send('Error updating department information');
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).send("Department not found!");
        }

        // Respond with success message
        res.status(200).json({
          message: "Department details updated successfully.",
          updatedFields: { dept_name, coordemail },
        });
        console.log('Updated Departmnet Details:', {
          dept_name, coordemail
        });
      }
    );
  });
};

module.exports = { putDeptChanges };
