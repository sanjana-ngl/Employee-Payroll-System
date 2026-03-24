#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define OT_RATE 200

struct Employee
{
    int empID;
    char name[50];
    float basicPay;
    int otHours;
};

void addEmployee();
void viewEmployees();
void searchEmployee();
void deleteEmployee();
void updateEmployee();
void generatePayslip();
void payrollReport();
float calculateGross(float basic, int ot);
float calculateTax(float gross);

int isDuplicateEmpID(int id);
int isValidName(char name[]);
void clearInputBuffer();

int main()
{
    int choice;

    printf("Enter choice: ");
    scanf("%d",&choice);

    switch(choice)
    {
        case 1: addEmployee(); break;
        case 2: viewEmployees(); break;
        case 3: searchEmployee(); break;
        case 4: updateEmployee(); break;
        case 5: deleteEmployee(); break;
        case 6: generatePayslip(); break;
        case 7: payrollReport(); break;
        default: printf("Invalid choice.\n"); break;
    }

    return 0;
}

void clearInputBuffer()
{
    int c;
    while((c = getchar()) != '\n' && c != EOF);
}

int isValidName(char name[])
{
    int i, hasAlpha = 0;

    for(i = 0; name[i] != '\0'; i++)
    {
        if(isdigit((unsigned char)name[i]))
            return 0;

        if(isalpha((unsigned char)name[i]))
            hasAlpha = 1;

        if(!(isalpha((unsigned char)name[i]) || name[i] == ' ' || name[i] == '.'))
            return 0;
    }

    return hasAlpha;
}

int isDuplicateEmpID(int id)
{
    struct Employee e;
    FILE *fp = fopen("employees.dat","rb");

    if(fp == NULL)
        return 0;

    while(fread(&e,sizeof(e),1,fp))
    {
        if(e.empID == id)
        {
            fclose(fp);
            return 1;
        }
    }

    fclose(fp);
    return 0;
}

void addEmployee()
{
    struct Employee e;

    FILE *fp = fopen("employees.dat","ab");

    if(fp==NULL)
    {
        printf("File error!\n");
        return;
    }

    printf("Enter Employee ID: ");
    if(scanf("%d",&e.empID) != 1)
    {
        printf("Invalid input for Employee ID!\n");
        fclose(fp);
        clearInputBuffer();
        return;
    }

    if(e.empID<=0)
    {
        printf("Invalid ID!\n");
        fclose(fp);
        return;
    }

    if(isDuplicateEmpID(e.empID))
    {
        printf("Duplicate Employee ID not allowed!\n");
        fclose(fp);
        return;
    }

    clearInputBuffer();
    printf("Enter Name: ");
    scanf("%49[^\n]",e.name);

    if(!isValidName(e.name))
    {
        printf("Invalid name! Name must not contain numbers.\n");
        fclose(fp);
        return;
    }

    printf("Enter Basic Pay: ");
    if(scanf("%f",&e.basicPay) != 1)
    {
        printf("Invalid input for salary!\n");
        fclose(fp);
        clearInputBuffer();
        return;
    }

    if(e.basicPay<0)
    {
        printf("Invalid salary!\n");
        fclose(fp);
        return;
    }

    printf("Enter OT Hours: ");
    if(scanf("%d",&e.otHours) != 1)
    {
        printf("Invalid input for OT Hours!\n");
        fclose(fp);
        clearInputBuffer();
        return;
    }

    if(e.otHours < 0)
    {
        printf("Invalid OT Hours!\n");
        fclose(fp);
        return;
    }

    fwrite(&e,sizeof(e),1,fp);

    fclose(fp);

    printf("Employee added successfully.\n");
}

void viewEmployees()
{
    struct Employee e;

    FILE *fp = fopen("employees.dat","rb");

    if(fp==NULL)
    {
        printf("No records found.\n");
        return;
    }

    printf("\nID\tName\t\tBasicPay\tOT\n");

    while(fread(&e,sizeof(e),1,fp))
    {
        printf("%d\t%s\t\t%.2f\t\t%d\n",
        e.empID,e.name,e.basicPay,e.otHours);
    }

    fclose(fp);
}

void searchEmployee()
{
    struct Employee e;
    int id,found=0;

    FILE *fp = fopen("employees.dat","rb");

    if(fp==NULL)
    {
        printf("No records found.\n");
        return;
    }

    printf("Enter Employee ID: ");
    if(scanf("%d",&id) != 1)
    {
        printf("Invalid Employee ID input!\n");
        fclose(fp);
        clearInputBuffer();
        return;
    }

    while(fread(&e,sizeof(e),1,fp))
    {
        if(e.empID==id)
        {
            printf("\nEmployee Found\n");
            printf("Name: %s\n",e.name);
            printf("Basic Pay: %.2f\n",e.basicPay);
            printf("OT Hours: %d\n",e.otHours);

            found=1;
            break;
        }
    }

    if(!found)
        printf("Employee not found.\n");

    fclose(fp);
}

void updateEmployee()
{
    struct Employee e;
    int id,found=0;

    FILE *fp = fopen("employees.dat","rb+");

    if(fp==NULL)
    {
        printf("No records found.\n");
        return;
    }

    printf("Enter Employee ID to update: ");
    if(scanf("%d",&id) != 1)
    {
        printf("Invalid Employee ID input!\n");
        fclose(fp);
        clearInputBuffer();
        return;
    }

    while(fread(&e,sizeof(e),1,fp))
    {
        if(e.empID==id)
        {
            printf("Enter new Basic Pay: ");
            if(scanf("%f",&e.basicPay) != 1)
            {
                printf("Invalid input for salary!\n");
                fclose(fp);
                clearInputBuffer();
                return;
            }

            if(e.basicPay < 0)
            {
                printf("Invalid salary!\n");
                fclose(fp);
                return;
            }

            printf("Enter new OT Hours: ");
            if(scanf("%d",&e.otHours) != 1)
            {
                printf("Invalid input for OT Hours!\n");
                fclose(fp);
                clearInputBuffer();
                return;
            }

            if(e.otHours < 0)
            {
                printf("Invalid OT Hours!\n");
                fclose(fp);
                return;
            }

            fseek(fp,-sizeof(e),SEEK_CUR);
            fwrite(&e,sizeof(e),1,fp);

            printf("Employee updated.\n");
            found=1;
            break;
        }
    }

    if(!found)
        printf("Employee not found.\n");

    fclose(fp);
}

void deleteEmployee()
{
    struct Employee e;
    int id,found=0;

    FILE *fp = fopen("employees.dat","rb");
    FILE *temp = fopen("temp.dat","wb");

    if(fp==NULL)
    {
        printf("No records found.\n");
        if(temp) fclose(temp);
        return;
    }

    if(temp == NULL)
    {
        printf("File error!\n");
        fclose(fp);
        return;
    }

    printf("Enter Employee ID to delete: ");
    if(scanf("%d",&id) != 1)
    {
        printf("Invalid Employee ID input!\n");
        fclose(fp);
        fclose(temp);
        clearInputBuffer();
        return;
    }

    while(fread(&e,sizeof(e),1,fp))
    {
        if(e.empID!=id)
            fwrite(&e,sizeof(e),1,temp);
        else
            found=1;
    }

    fclose(fp);
    fclose(temp);

    remove("employees.dat");
    rename("temp.dat","employees.dat");

    if(found)
        printf("Employee deleted.\n");
    else
        printf("Employee not found.\n");
}

float calculateGross(float basic,int ot)
{
    return basic + (ot * OT_RATE);
}

float calculateTax(float gross)
{
    if(gross<=30000)
        return gross*0.05;
    else if(gross<=60000)
        return gross*0.10;
    else
        return gross*0.15;
}

void generatePayslip()
{
    struct Employee e;
    int id,found=0;

    FILE *fp = fopen("employees.dat","rb");

    if(fp==NULL)
    {
        printf("No records found.\n");
        return;
    }

    printf("Enter Employee ID: ");
    if(scanf("%d",&id) != 1)
    {
        printf("Invalid Employee ID input!\n");
        fclose(fp);
        clearInputBuffer();
        return;
    }

    while(fread(&e,sizeof(e),1,fp))
    {
        if(e.empID==id)
        {
            float gross = calculateGross(e.basicPay,e.otHours);
            float tax = calculateTax(gross);
            float net = gross-tax;

            printf("\n========== PAYSLIP ==========\n");
            printf("Employee ID : %d\n",e.empID);
            printf("Name        : %s\n",e.name);
            printf("Basic Pay   : %.2f\n",e.basicPay);
            printf("OT Hours    : %d\n",e.otHours);
            printf("Gross Pay   : %.2f\n",gross);
            printf("Tax         : %.2f\n",tax);
            printf("Net Pay     : %.2f\n",net);
            printf("================================\n");

            found=1;
            break;
        }
    }

    if(!found)
        printf("Employee not found.\n");

    fclose(fp);
}

void payrollReport()
{
    struct Employee e;

    FILE *fp = fopen("employees.dat","rb");

    if(fp==NULL)
    {
        printf("No records.\n");
        return;
    }

    printf("\n===== PAYROLL REPORT =====\n");
    printf("ID\tName\tGross\tTax\tNet\n");

    while(fread(&e,sizeof(e),1,fp))
    {
        float gross = calculateGross(e.basicPay,e.otHours);
        float tax = calculateTax(gross);
        float net = gross-tax;

        printf("%d\t%s\t%.2f\t%.2f\t%.2f\n",
        e.empID,e.name,gross,tax,net);
    }

    fclose(fp);
}