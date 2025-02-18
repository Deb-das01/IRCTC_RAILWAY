
// This imports the database connection from dbconfig.js (which uses mysql2).
const db = require('../config/dbconfig');


//User class to represent user-related operations.

class User {
// Defines how a new user object is created.
// Takes four parameters name,email,password,role
  constructor(name, email, password, role = 'user') {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  //Inserts the user data into the database using an SQL query.
  async save() {
    try {
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [this.name, this.email, this.password, this.role]
      );
                  /* OUTPUT OF [result]:-
                            {
                        fieldCount: 0,
                        affectedRows: 1,
                        insertId: 42,  // ID of new user in the database
                        info: '',
                        serverStatus: 2,
                        warningStatus: 0
                      }
                  */
      return result;
    } catch (err) {
      throw new Error('Error saving user: ' + err.message);
    }
  }

  //Finds a user by email in the database.
  static async findByEmail(email) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      throw new Error('Error finding user: ' + err.message);
    }
  }
}

//Exports the User class so it can be used in other files.
module.exports = User;
