const mysql = require('mysql2/promise');
const db = require('../db/dbConnection');



const addResearchData = async (req, res) => {
  const {
    title,
    researchDesc,
    researchFund,
    fundedBy,
    status,
    publicationDate,
    publisher,
    researchPaperLink,
    people,
  } = req.body;


  try {
    const [result] = await db.query(
      `INSERT INTO researchwork
      (title, description, fund, funded_by, status, publication_date, publisher, link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, researchDesc, researchFund, fundedBy, status, publicationDate, publisher, researchPaperLink]
    );


    const researchId = result.insertId;


    const userIdPromises = people.map(async email => {
      const [userResult] = await db.query('SELECT user_id FROM user WHERE email_id = ?', [email]);
      return userResult.length > 0 ? userResult[0].user_id : null;
    });


    const userIds = (await Promise.all(userIdPromises)).filter(id => id !== null);


    if (userIds.length > 0) {
      const values = userIds.map(userId => `(${researchId}, ${userId})`).join(',');
      await db.query(`INSERT INTO researcher (research_id, user_id) VALUES ${values}`);
    }


    res.status(201).json({ message: 'Research data added successfully', researchId });
  } catch (error) {
    console.error('Error inserting data:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { addResearchData };





