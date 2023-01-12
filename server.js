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
        if (err) {
            console.error(err);
        }
        console.log("");
        console.table(res);
        main();
    });
}

function viewRoles() {
    db.query(
        "SELECT role.id, title, department.name AS department, salary FROM role INNER JOIN department ON role.department_id = department.id",
        (err, res, fields) => {
            if (err) {
                console.error(err);
            }
            console.log("");
            console.table(res);
            main();
        }
    );
}

function viewEmployees() {
    db.query(
        `SELECT employee.id, first_name, last_name, title, department.name AS department, salary 
        FROM employee 
        JOIN role 
        ON employee.role_id = role.id 
        JOIN department ON role.department_id = department.id`,
        (err, res, fields) => {
            if (err) {
                console.error(err);
            }
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
            choices: ["View all Departments", "View all Roles", "View all Employees", "Add a Department", "Quit"],
        },
    ]).then((ans) => {
        switch (ans.choice) {
            case "View all Departments":
                viewDepartments();
                break;

            case "View all Roles":
                viewRoles();
                break;

            case "View all Employees":
                viewEmployees();
                break;

            case "Quit":
                process.kill(process.pid);
                break;

            default:
                console.error("No Option Found!");
        }
    });
}

main();
