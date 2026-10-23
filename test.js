 import bcrypt, { hash } from "bcryptjs";
 
    let companyData, userData;

    const form = {
        companyData: {
            companyName: {
                value: 'companyName',
                inputType: 'text',
            },
            numberOfEmployees: {
                value: 'numberOfEmployees',
                inputType: 'number',
            },
            companyAddress: {
                value: 'companyAddress',
                inputType: 'text',
            },
               
        },
        userData: {
            firstName: {
                value: 'firstName',
                inputType: 'text',
            },
            lastName: {
                value: 'lastName',
                inputType: 'text',
            },
            jobTitle: {
                value: 'jobTitle',
                inputType: 'text',
            },
            email: {
                value: 'email',
                inputType: 'email',
            },
            password: {
                value: 'password',
                inputType: 'password',
            },
        }
    };

    

    async function testRegistration() {
        const hashed = await hash(form.userData.password.value, 10);

        Object.entries(form).map(([outerKey, outerValue]) => {
            if (outerKey === 'companyData') {
                for (const [key, value] of Object.entries(outerValue)) {
                    companyData = {
                        ...companyData,
                        [key]: value.value
                    }
                }
            }
            if (outerKey === 'userData') {
                for (const [key, value] of Object.entries(outerValue)) {
                    if (key !== 'password') {
                        userData = {
                            ...userData,
                            [key]: value.value
                        }
                    } else {
                        userData = {
                            ...userData,
                            [key]: hashed
                        };
                    }
                }
            }
        });

        console.log(userData, companyData)
    }

    testRegistration();

    