// Test script to register a sample employee
const testEmployeeRegistration = async () => {
  try {
    const sampleEmployee = {
      name: "John Smith",
      email: "john.smith@example.com",
      password: "password123",
      phone: "+91-9876543210",
      dealershipId: "YOUR_DEALERSHIP_ID_HERE", // Replace with actual dealership ID
      employeeId: "EMP001",
      department: "Sales",
      position: "Sales Executive",
      salary: 500000,
      salesTarget: 10,
      address: {
        street: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India"
      },
      emergencyContact: {
        name: "Jane Smith",
        phone: "+91-9876543211",
        relationship: "Spouse"
      }
    };

    const response = await fetch('http://localhost:8080/api/auth/register-employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleEmployee),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Employee registered successfully:', data);
    } else {
      console.error('❌ Failed to register employee:', data.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Get dealership ID first
const getDealershipId = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/checkToken', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (data.loggedIn && data.user.role === 'carDealership') {
      console.log('🏢 Found dealership ID:', data.user.dealershipId);
      return data.user.dealershipId;
    } else {
      console.log('ℹ️ Please log in as a dealership first');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting dealership ID:', error);
    return null;
  }
};

console.log('🔄 Employee Registration Test Script');
console.log('1. First log in as a dealership at: http://localhost:3000');
console.log('2. Then run this script to register a test employee');
console.log('3. Check the employee list at: http://localhost:3000/dealership/employees/view');

// Uncomment the lines below to run the test
// getDealershipId().then(dealershipId => {
//   if (dealershipId) {
//     // Update the dealershipId in the sample employee object
//     testEmployeeRegistration();
//   }
// });