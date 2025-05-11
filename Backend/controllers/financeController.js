const db = require('../db/dbConnection');


const getDepartmentNames = async (req, res) => {
    const { institute_id } = req.params;
  const sql = `SELECT dept_name FROM department where institute_id = ?`;


  try {
    const departments = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    console.log(departments);


    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getInfrastructureNames = async (req, res) => {
    const { institute_id } = req.params;
    const sql = `SELECT i.description FROM infrastructure i inner join department d
        where i.dept_id = d.dept_id and d.institute_id = ?`;


  try {
    const infrastructure = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    console.log(infrastructure);


    res.status(200).json(infrastructure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getEventNames = async (req, res) => {
    const { institute_id } = req.params;
    const sql = `SELECT e.event_name FROM events e inner join department d
        where e.dept_id = d.dept_id and d.institute_id = ?`;


  try {
    const events = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    console.log(events);


    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getDepartmentNames, getInfrastructureNames, getEventNames };





