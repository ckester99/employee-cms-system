INSERT INTO department (name)
VALUES  ("Engineering"),
        ("Sales"),
        ("Marketing");

INSERT INTO role (title, salary, department_id)
VALUES  ("Engineer I", 80000, 1),
        ("Engineer II", 100000, 1),
        ("Engineer III", 120000, 1),
        ("Salesperson", 80000, 2),
        ("Marketing Manager", 100000, 3),
        ("Brand Ambassador", 80000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Bob", "Johnson", 3, NULL),
        ("Timmy", "Parker", 5, NULL),
        ("Steve", "Smith", 1, 1),
        ("Bobby", "Brown", 1, 1),
        ("Garret", "Baker", 2, 1),
        ("Joel", "Jackson", 4, NULL),
        ("Sam", "Smith", 6, 2);