**Link of the website:**
https://sanjana-ngl.github.io/Employee-Payroll-System/

# Employee Payroll System

A simple and efficient **Employee Payroll Management System** developed in **C** with support for **WebAssembly (WASM)** deployment for browser-based demonstration.

This project helps manage employee salary records, automate payroll calculations, generate payslips, and perform CRUD operations using structured programming concepts and binary file handling.

---

## Features

- Add employee records
- View all employees
- Search employee by ID
- Update employee details
- Delete employee records
- Generate employee payslips
- Payroll report generation
- Automatic gross pay and tax calculation
- Duplicate Employee ID validation
- Input validation for salary and overtime
- Binary file handling using `employees.dat`
- WebAssembly-based browser deployment
- Payslip download and print support

---

## Technologies Used

- C Programming
- File Handling
- Structures and Functions
- WebAssembly (WASM)
- HTML
- CSS
- JavaScript
- GitHub Pages

---

## Project Structure

```bash
Employee-Payroll-System/
│
├── main.c
├── employees.dat
├── index.html
├── style.css
├── script.js
├── payroll.wasm
└── README.md
```

---

## Employee Structure

```c
struct Employee
{
    int empID;
    char name[50];
    float basicPay;
    int otHours;
};
```

---

## Payroll Calculation Logic

### Gross Pay

```text
Gross Pay = Basic Pay + (Overtime Hours × Overtime Rate)
```

### Tax Slabs

| Gross Salary Range | Tax Rate |
|-------------------|-----------|
| <= 30000          | 5%        |
| <= 60000          | 10%       |
| > 60000           | 15%       |

### Net Pay

```text
Net Pay = Gross Pay - Tax
```

---

## Functionalities

| Function | Description |
|----------|-------------|
| `addEmployee()` | Add a new employee |
| `viewEmployees()` | Display all records |
| `searchEmployee()` | Search employee by ID |
| `updateEmployee()` | Update salary and OT |
| `deleteEmployee()` | Delete employee |
| `generatePayslip()` | Generate payslip |
| `payrollReport()` | Display payroll summary |
| `calculateGross()` | Calculate gross salary |
| `calculateTax()` | Calculate tax deduction |

---

## File Handling

The native C version stores records in a binary file:

```text
employees.dat
```

Functions used:
- `fopen()`
- `fwrite()`
- `fread()`
- `fseek()`
- `remove()`
- `rename()`

---

## How to Run the Project

### Compile the Program

```bash
gcc main.c -o payroll
```

### Run the Program

```bash
./payroll
```

---

## Sample Menu

```text
1. Add Employee
2. View Employees
3. Search Employee
4. Update Employee
5. Delete Employee
6. Generate Payslip
7. Payroll Report
```

---

## WebAssembly Deployment

The project was also compiled into **WebAssembly (WASM)** and connected with a frontend interface using:

- HTML
- CSS
- JavaScript

The hosted version demonstrates payroll operations directly in the browser.

---

## GitHub Repository

🔗 GitHub Repository:  
https://github.com/sanjana-ngl/Employee-Payroll-System

---

## Live Demo

🌐 GitHub Pages Deployment:  
https://sanjana-ngl.github.io/Employee-Payroll-System/

---

## Challenges Faced

- Managing binary file consistency
- Preventing duplicate employee IDs
- Implementing validation checks
- Safe update and delete operations
- Adapting C logic to WebAssembly
- Handling browser-side temporary storage
- Deploying static WASM assets on GitHub Pages

---

## Learning Outcomes

Through this project, I gained practical experience in:

- Structured programming in C
- Modular function design
- Binary file handling
- Payroll logic implementation
- Validation and error handling
- WebAssembly integration
- GitHub deployment workflow

---

## Future Improvements

- Permanent database integration
- Login authentication
- Advanced payroll analytics
- PDF payslip export
- Employee attendance management
- Cloud-based backend support

---

## License

This project is created for educational purposes.
