const db = require('../db/dbConnection');

// Controller function to fetch institute details by username
const getInstituteDetails = (req, res) => {
  const { username } = req.params;

  // Step 1: Find the user by username to get the `institute_id`
  const queryFindUser = "SELECT institute_id FROM User WHERE username = ?";
  
  db.query(queryFindUser, [username], (err, userResults) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).send('Error retrieving user information');
    }

    if (userResults.length === 0) {
      return res.status(404).send("User not found!");
    }

    const instituteId = userResults[0].institute_id;

    if (!instituteId) {
      return res.status(404).send("Institute not associated with the user.");
    }

    // Step 2: Fetch institute details using the `institute_id`
    const queryGetInstitute = "SELECT * FROM Institute WHERE institute_id = ?";
    
    db.query(queryGetInstitute, [instituteId], (err, instituteResults) => {
      if (err) {
        console.error('Error fetching institute:', err);
        return res.status(500).send('Error retrieving institute information');
      }

      if (instituteResults.length === 0) {
        return res.status(404).send("Institute not found!");
      }

      // Respond with institute information
      const institute = instituteResults[0];
      res.status(200).json({
        id: institute.institute_id,
        name: institute.institute_name,
        addressl1: institute.address_lines,
        subdist: institute.subdistrict,
        district: institute.district,
        state: institute.state,
        country: institute.country,
      });
    });
  });
};

module.exports = { getInstituteDetails };
