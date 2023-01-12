require("dotenv").config();
const mysql = require("mysql2");
const inq = require("inquirer");
const { default: Choices } = require("inquirer/lib/objects/choices");
const cTable = require("console.table");

const db = mysql.createConnection({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

function viewDepartments() {
    db.query("SELECT * FROM department", (err, res, fields) => {
        console.log("");
        console.table(res);
        main();
    });
}

function viewRoles() {
    db.query(
        "SELECT (role.id, title, department.name, salary) FROM role INNER JOIN department ON role.department_id = department.id",
        (err, res, fields) => {
            console.log("");
            console.table(res);
            main();
        }
    );
}

function main() {
    inq.prompt([
        {
            type: "list",
            name: "choice",
            message: "What do you want to do?",
            choices: ["View All Departments", "View all Roles", "View all employees", "Add a department", "Quit"],
        },
    ]).then((ans) => {
        switch (ans.choice) {
            case "View All Departments":
                viewDepartments();
                break;

            case "Quit":
                process.kill(process.pid);
                break;
        }
    });
}

main();
