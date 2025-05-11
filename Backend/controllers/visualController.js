const db = require('../db/dbConnection');

// Controller function to get all departments with student counts greater than 0
const getDepartmentWiseStudentCount = async (req, res) => {
  const { institute_id } = req.params;

  const sql = `
    SELECT d.dept_name, COUNT(s.student_id) AS student_count
    FROM department d
    LEFT JOIN program p ON d.dept_id = p.dept_id
    LEFT JOIN student s ON s.program_id = p.prog_id
    WHERE d.institute_id = ?
    GROUP BY d.dept_name
    HAVING student_count > 0
  `;

  try {
    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql, "with institute_id:", institute_id);

    const departments = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Log the results for debugging
    console.log("Departments with student counts greater than 0:", departments);

    // Send the results as a JSON response
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching department-wise student counts:", error);
    res.status(500).json({ error: error.message });
  }
};

const getDepartmentWiseFacultyCount = async (req, res) => {
  const { institute_id } = req.params;

  const sql = `
    SELECT d.dept_name, COUNT(f.faculty_id) AS faculty_count
    FROM department d
    LEFT JOIN faculty f ON f.dept_id = d.dept_id
    WHERE d.institute_id = ?
    GROUP BY d.dept_name
    HAVING faculty_count > 0
  `;

  try {
    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql, "with institute_id:", institute_id);

    const departments = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Log the results for debugging
    console.log("Departments with faculty counts greater than 0:", departments);

    // Send the results as a JSON response
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching department-wise faculty counts:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTypeWiseClubCount = async (req, res) => {
  const { institute_id } = req.params;

  const sql = `
    SELECT club_type, COUNT(club_id) AS club_count
    FROM club
    WHERE institute_id = ?
    GROUP BY club_type`;

  try {
    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql, "with institute_id:", institute_id);

    const clubs = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Send the results as a JSON response
    res.status(200).json(clubs);
  } catch (error) {
    console.error("Error fetching type-wise club counts:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTypeWiseEventCount = async (req, res) => {
  const { institute_id } = req.params;

  const sql = `
    SELECT e.event_type, COUNT(e.event_id) AS event_count
    FROM events e
    LEFT JOIN department d ON e.dept_id = d.dept_id
    WHERE d.institute_id = ?
    GROUP BY e.event_type`;

  try {
    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql, "with institute_id:", institute_id);

    const events = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Send the results as a JSON response
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching type-wise event counts:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFinanceData = async (req, res) => {
  const { institute_id } = req.params;

  const sql = `
    SELECT alloted_type, SUM(amount) AS finance_amount
    FROM finance
    WHERE institute_id = ?
    GROUP BY alloted_type`;

  try {
    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql, "with institute_id:", institute_id);

    const finance = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Map the alloted_type values to their respective labels
    const allotedTypeMap = {
      1: "Clubs",
      2: "Departments",
      3: "Events",
      4: "Infrastructure",
    };

    const updatedFinance = finance.map(item => ({
      alloted_type: allotedTypeMap[item.alloted_type] || "Unknown",
      finance_amount: item.finance_amount,
    }));

    // Send the results as a JSON response
    res.status(200).json(updatedFinance);
  } catch (error) {
    console.error("Error fetching finance data:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAchievementsData = async (req, res) => {
  const { institute_id } = req.params;

  const sql = `
    SELECT a.ach_type AS achievement_type, COUNT(a.ach_id) AS achievements_count
    FROM achievements a
    LEFT JOIN user u ON a.user_id = u.user_id
    WHERE u.institute_id = ?
    GROUP BY a.ach_type`;

  try {
    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql, "with institute_id:", institute_id);

    const achievements = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Send the results as a JSON response
    res.status(200).json(achievements);
  } catch (error) {
    console.error("Error fetching achievements data:", error);
    res.status(500).json({ error: error.message });
  }
};

const getPlacementData = async (req, res) => {
  const { institute_id } = req.params;

  const sql = `
    SELECT o.type, COUNT(o.opportunity_id) AS opportunities_count
    FROM careeropportunities o
    LEFT JOIN user u ON o.user_id = u.user_id
    WHERE u.institute_id = ?
    GROUP BY o.type`;

  try {
    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql, "with institute_id:", institute_id);

    const achievements = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Send the results as a JSON response
    res.status(200).json(achievements);
  } catch (error) {
    console.error("Error fetching achievements data:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDepartmentWiseStudentCount, getDepartmentWiseFacultyCount, getTypeWiseClubCount, getTypeWiseEventCount, getFinanceData, getAchievementsData, getPlacementData };