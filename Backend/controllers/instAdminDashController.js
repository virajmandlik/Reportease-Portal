const db = require('../db/dbConnection');


const countStudents = (req, res) => {
  const { username } = req.params;


  if (!username) {
    return res.status(400).send("Username parameter is required.");
  }


  const userQuery = `
    SELECT COUNT(email_id) AS studentCount
    FROM user
    WHERE type_id = 4
      AND institute_id = (SELECT institute_id FROM user WHERE username = ?)
  `;


  db.query(userQuery, [username], (err, userRows) => {
    if (err) {
      console.error('Error counting students:', err);
      return res.status(500).send('Error retrieving information.');
    }


    if (!userRows || userRows.length === 0 || userRows[0].studentCount === null) {
      return res.status(404).send("No students found for the given username.");
    }


    const count = userRows[0].studentCount;
    res.status(200).json({ count });
  });
};


const countFaculty = (req, res) => {
    const { username } = req.params;
 
    if (!username) {
      return res.status(400).send("Username parameter is required.");
    }
 
    const userQuery = `
      SELECT COUNT(faculty_id) AS facultyCount FROM faculty f
      INNER JOIN user u ON u.user_id = f.user_id
      WHERE u.institute_id = (SELECT institute_id FROM user WHERE username = ?)
    `;
 
    db.query(userQuery, [username], (err, userRows) => {
      if (err) {
        console.error('Error counting faculty:', err);
        return res.status(500).send('Error retrieving information.');
      }
 
      if (!userRows || userRows.length === 0 || userRows[0].studentCount === null) {
        return res.status(404).send("No faculty found for the given username.");
      }
 
      const count = userRows[0].facultyCount;
      res.status(200).json({ count });
    });
  };


  const countDepartments = (req, res) => {
    const { username } = req.params;
 
    if (!username) {
      return res.status(400).send("Username parameter is required.");
    }
 
    const userQuery = `
      SELECT COUNT(dept_id) AS deptCount
      FROM department
      WHERE institute_id = (SELECT institute_id FROM user WHERE username = ?)
    `;
 
    db.query(userQuery, [username], (err, userRows) => {
      if (err) {
        console.error('Error counting departments:', err);
        return res.status(500).send('Error retrieving information.');
      }
 
      if (!userRows || userRows.length === 0 || userRows[0].studentCount === null) {
        return res.status(404).send("No faculty found for the given username.");
      }
 
      const count = userRows[0].deptCount;
      res.status(200).json({ count });
    });
  };


  const countPrograms = (req, res) => {
    const { username } = req.params;
 
    if (!username) {
      return res.status(400).send("Username parameter is required.");
    }
 
    const userQuery = `
      SELECT COUNT(prog_id) AS progCount
      FROM program p inner join department d
      WHERE p.dept_id = d.dept_id and d.institute_id = (SELECT institute_id FROM user WHERE username = ?)
    `;
 
    db.query(userQuery, [username], (err, userRows) => {
      if (err) {
        console.error('Error counting programs:', err);
        return res.status(500).send('Error retrieving information.');
      }
 
      if (!userRows || userRows.length === 0 || userRows[0].studentCount === null) {
        return res.status(404).send("No faculty found for the given username.");
      }
 
      const count = userRows[0].progCount;
      res.status(200).json({ count });
    });
  };


  const countClubs = (req, res) => {
    const { username } = req.params;
 
    if (!username) {
      return res.status(400).send("Username parameter is required.");
    }
 
    const userQuery = `
      SELECT COUNT(club_id) AS clubCount
      FROM club
      WHERE institute_id = (SELECT institute_id FROM user WHERE username = ?)
    `;
 
    db.query(userQuery, [username], (err, userRows) => {
      if (err) {
        console.error('Error counting clubs:', err);
        return res.status(500).send('Error retrieving information.');
      }
 
      if (!userRows || userRows.length === 0 || userRows[0].clubCount === null) {
        return res.status(404).send("No clubs found for the given username.");
      }
 
      const count = userRows[0].clubCount;
      res.status(200).json({ count });
    });
  };


  const countEvents = (req, res) => {
    const { username } = req.params;
 
    if (!username) {
      return res.status(400).send("Username parameter is required.");
    }
 
    const userQuery = `
      SELECT COUNT(e.event_id) AS eventCount
      FROM events e
      LEFT JOIN department d ON e.dept_id = d.dept_id
      WHERE d.institute_id = (SELECT institute_id FROM user WHERE username = ?)
    `;
 
    db.query(userQuery, [username], (err, userRows) => {
      if (err) {
        console.error('Error counting events:', err);
        return res.status(500).send('Error retrieving information.', err);
      }
 
      if (!userRows || userRows.length === 0 || userRows[0].eventCount === null) {
        return res.status(404).send("No events found for the given username.");
      }
 
      const count = userRows[0].eventCount;
      res.status(200).json({ count });
    });
  };


module.exports = { countStudents, countFaculty, countDepartments, countPrograms, countClubs, countEvents };






