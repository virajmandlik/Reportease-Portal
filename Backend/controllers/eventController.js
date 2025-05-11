const db = require('../db/dbConnection');

const createEvent = (req, res) => {
  const { institute_id } = req.params;
  console.log('the id of insti recived in create evnt backed is',institute_id)
  const { 
    eventName, 
    eventDescription, 
    eventType, 
    eventDate, 
    deptId, 
    clubId,
    eventVenue = null,
    eventBudget = 0
  } = req.body;

  // Comprehensive Validation
  if (!eventName || !eventDescription || !eventType || !eventDate) {
    return res.status(400).json({
      message: "All required fields must be provided.",
      missingFields: {
        eventName: !eventName,
        eventDescription: !eventDescription,
        eventType: !eventType,
        eventDate: !eventDate
      }
    });
  }

  // Validate that either deptId or clubId is provided
  if (!deptId && !clubId) {
    return res.status(400).json({
      message: "Either a department or a club must be specified."
    });
  }

  // Prepare query
  const query = `
    INSERT INTO events (
      event_name, 
      event_description, 
      event_type, 
      event_date, 
      dept_id, 
      club_id,
      event_venue,
      event_budget,
      institute_id,
      year
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const queryParams = [
    eventName, 
    eventDescription, 
    eventType, 
    new Date(eventDate), 
    deptId || null, 
    clubId || null,
    eventVenue,
    eventBudget,
    institute_id,
    new Date(eventDate).getFullYear()
  ];

  // Execute the query
  db.query(query, queryParams, async (err, result) => {
    if (err) {
      console.error("Error inserting event:", err);
      
      // Handle specific MySQL error codes
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          message: "Invalid department or club ID.",
          error: err.message
        });
      }

      return res.status(500).json({
        message: "Error saving event",
        error: err.message
      });
    }



    res.status(201).json({
      message: "Event created successfully",
      eventId: result.insertId
    });
  });
};

// Enhanced Validation Function
const validateEntityAssociation = (entityId, instituteId, entityType) => {
  return new Promise((resolve, reject) => {
    if (!entityId || !instituteId || !entityType) {
      reject(new Error('Invalid input parameters'));
      return;
    }

    let query;
    switch (entityType) {
      case 'department':
        query = 'SELECT 1 FROM department WHERE dept_id = ? AND institute_id = ?';
        break;
      case 'club':
        query = 'SELECT 1 FROM club WHERE club_id = ? AND institute_id = ?';
        break;
      default:
        reject(new Error('Invalid entity type'));
        return;
    }

    db.query(query, [entityId, instituteId], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results.length > 0);
    });
  });
};

// Optional: Event Deletion Function
const deleteEvent = (eventId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM events WHERE event_id = ?';
    
    db.query(query, [eventId], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

// Enhanced Event Creation with Comprehensive Validation
const createEventEnhanced = async (req, res) => {
  const { institute_id } = req.params;
  const { 
    eventName, 
    eventDescription, 
    eventType, 
    eventDate, 
    deptId, 
    clubId,
    eventVenue,
    eventBudget
  } = req.body;

  try {
    // Input Validation
    const validationErrors = [];
    
    if (!eventName) validationErrors.push('Event Name is required');
    if (!eventDescription) validationErrors.push('Event Description is required');
    if (!eventType) validationErrors.push('Event Type is required');
    if (!eventDate) validationErrors.push('Event Date is required');
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: validationErrors
      });
    }

    // Validate Entity Association
    let entityId = deptId || clubId;
    let entityType = deptId ? 'department' : 'club';

    const isValidEntity = await validateEntityAssociation(
      entityId, 
      institute_id, 
      entityType
    );

    if (!isValidEntity) {
      return res.status(400).json({
        message: `Invalid ${entityType} for the given institute`,
        details: {
          entityId,
          instituteId: institute_id
        }
      });
    }

    // Delegate to main creation method
    return createEvent(req, res);

  } catch (error) {
    console.error("Event creation error:", error);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message
    });
  }
};

module.exports = { 
  createEvent,
  createEventEnhanced,
  validateEntityAssociation
};