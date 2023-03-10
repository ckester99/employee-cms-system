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
        mainMenu();
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
            mainMenu();
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
            mainMenu();
        }
    );
}

function addDepartment() {
    inq.prompt([
        {
            type: "input",
            name: "department",
            message: "What is the department name?",
        },
    ]).then((ans) => {
        db.query(`INSERT INTO department (name) VALUES ('${ans.department}')`);
        console.log(`${ans.department} added to departments!`);
        mainMenu();
    });
}

function addRole() {
    let departments = [];
    let department_ids = [];
    db.query(`SELECT * FROM department`, (err, res, fields) => {
        if (err) {
            console.error(err);
        }

        for (const el of res) {
            departments.push(el.name);
            department_ids.push(el.id);
        }
    });

    inq.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the role title?",
        },
        {
            type: "list",
            name: "department",
            message: "What department does the role belong to?",
            choices: departments,
            loop: false,
        },
        {
            type: "number",
            name: "salary",
            message: "What is the role salary?",
        },
    ]).then((ans) => {
        db.query(
            `INSERT INTO role (title, salary, department_id) VALUES ('${ans.title}', ${ans.salary}, ${
                department_ids[departments.indexOf(ans.department)]
            })`,
            (err, res, fields) => {
                if (err) {
                    console.error(err);
                }
            }
        );
        console.log(`${ans.title} added to roles!`);
        mainMenu();
    });
}

function addEmployee() {
    let employees = [];
    let employee_ids = [];
    db.query(`SELECT * FROM employee`, (err, res, fields) => {
        if (err) {
            console.error(err);
        }

        for (const el of res) {
            employees.push(el.first_name + " " + el.last_name);
            employee_ids.push(el.id);
        }
    });
    employees.push("No Manager");
    employee_ids.push(null);

    let departments = [];
    let department_ids = [];
    db.query(`SELECT * FROM department`, (err, res, fields) => {
        if (err) {
            console.error(err);
        }

        for (const el of res) {
            departments.push(el.name);
            department_ids.push(el.id);
        }
    });

    inq.prompt([
        {
            type: "input",
            name: "fname",
            message: "What is the employee's first name?",
        },
        {
            type: "input",
            name: "lname",
            message: "What is the employee's last name?",
        },
        {
            type: "list",
            name: "department",
            message: "What department does the employee work in?",
            choices: departments,
            loop: false,
        },
    ]).then((ans) => {
        let roles = [];
        let role_ids = [];
        const department_id = department_ids[departments.indexOf(ans.department)];

        db.query(`SELECT * FROM role WHERE department_id = ${department_id}`, (err, res, fields) => {
            if (err) {
                console.error(err);
            }
            for (const el of res) {
                roles.push(el.title);
                role_ids.push(el.id);
            }

            inq.prompt([
                {
                    type: "list",
                    name: "role",
                    message: "What is the employee's title?",
                    choices: roles,
                    loop: false,
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: employees,
                    loop: false,
                },
            ]).then((answer) => {
                const first_name = ans.fname;
                const last_name = ans.lname;
                const role_id = role_ids[roles.indexOf(answer.role)];
                const manager_id = employee_ids[employees.indexOf(answer.manager)];

                db.query(
                    `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${first_name}', '${last_name}', ${role_id}, ${manager_id})`,
                    (err, res, fields) => {
                        if (err) {
                            console.error(err);
                        }
                    }
                );
                console.log(`${first_name} ${last_name} added to employees!`);
                mainMenu();
            });
        });
    });
}

function updateEmployeeRole() {
    let employees = [];
    let employee_ids = [];
    db.query(`SELECT * FROM employee`, (err, res, fields) => {
        for (const el of res) {
            employees.push(el.first_name + " " + el.last_name);
            employee_ids.push(el.id);
        }

        inq.prompt({
            type: "list",
            name: "employee",
            message: "What employee do you want to update?",
            choices: employees,
            loop: false,
        }).then((ans) => {
            const employee_id = employee_ids[employees.indexOf(ans.employee)];
            db.query(`SELECT department_id FROM role JOIN employee ON role_id = role.id WHERE employee.id = ${employee_id}`, (err, res, fields) => {
                db.query(`SELECT title, id FROM role WHERE department_id = 1`, (err, res, fields) => {
                    let titles = [];
                    let title_ids = [];
                    for (const el of res) {
                        titles.push(el.title);
                        title_ids.push(el.id);
                    }

                    inq.prompt({
                        type: "list",
                        name: "new_id",
                        message: "What is the employee's new title?",
                        choices: titles,
                        loop: false,
                    }).then((ans) => {
                        const new_role_id = title_ids[titles.indexOf(ans.new_id)];
                        db.query(`UPDATE employee SET role_id = ${new_role_id} WHERE id = ${employee_id}`, (err, res, fields) => {
                            console.log("Employee updated sucessfully!");
                            mainMenu();
                        });
                    });
                });
            });
        });
    });
}

function mainMenu() {
    inq.prompt([
        {
            type: "list",
            name: "choice",
            message: "What do you want to do?",
            choices: [
                "View all Departments",
                "View all Roles",
                "View all Employees",
                "Add a Department",
                "Add a Role",
                "Add an Employee",
                "Update an Employee's Role",
                "Quit",
            ],
            loop: false,
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

            case "Add a Department":
                addDepartment();
                break;

            case "Add a Role":
                addRole();
                break;

            case "Add an Employee":
                addEmployee();
                break;

            case "Update an Employee's Role":
                updateEmployeeRole();
                break;

            case "Quit":
                process.kill(process.pid);
                break;

            default:
                console.error("No Option Found!");
        }
    });
}

mainMenu();
