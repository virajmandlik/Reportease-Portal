const db = require('../db/dbConnection');


// Controller function to get permissions for a specific type_id
const getPermissions = async (req, res) => {
  const { type_id } = req.params;
  const sql = `
    SELECT
      permission,
      granted
    FROM
      accesscontrol
    WHERE
      type_id = ?
  `;


  try {
    const permissions = await new Promise((resolve, reject) => {
      db.query(sql, [type_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });


    // Format the result as a table
    const formattedPermissions = permissions.map(permission => ({
      permission: permission.permission,
      granted: permission.granted
    }));


    res.status(200).json(formattedPermissions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


// Controller function to update permissions for a specific type_id
const updatePermissions = async (req, res) => {
  const { type_id } = req.params;
  const { permissions } = req.body; // Array of permission objects { permission, granted }


  const sql = `
    UPDATE
      accesscontrol
    SET
      granted = ?
    WHERE
      type_id = ? AND permission = ?
  `;


  try {
    // Update permissions one by one
    for (const permission of permissions) {
      await new Promise((resolve, reject) => {
        db.query(sql, [permission.granted, type_id, permission.permission], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    }


    res.status(200).json({ message: 'Permissions updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Controller function to get permissions for all type_ids from 1 to 4
const getPermissionsForAllTypes = async (req, res) => {
  const typeIds = [1, 2, 3, 4]; // Array of type_ids to fetch permissions for
  const sql = `
    SELECT
      type_id,
      permission,
      granted
    FROM
      accesscontrol
    WHERE
      type_id = ?
  `;


  try {
    const allPermissions = [];


    // Fetch permissions for each type_id
    for (const type_id of typeIds) {
      const permissions = await new Promise((resolve, reject) => {
        db.query(sql, [type_id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });


      // Add type_id to each permission
      const formattedPermissions = permissions.map(permission => ({
        type_id,
        permission: permission.permission,
        granted: permission.granted
      }));


      allPermissions.push(...formattedPermissions);
    }


    res.status(200).json(allPermissions); // Send all permissions as a single array
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getPermissions, updatePermissions, getPermissionsForAllTypes };




