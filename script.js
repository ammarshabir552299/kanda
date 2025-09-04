document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('customer-form');
    const customerList = document.getElementById('customer-list');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const customerIdInput = document.getElementById('customer-id');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const apiUrl = 'api.php';

    // Function to fetch and display customers
    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${apiUrl}?action=get`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const customers = await response.json();
            customerList.innerHTML = '';
            customers.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.address}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-id="${customer.id}">Edit</button>
                        <button class="delete-btn" data-id="${customer.id}">Delete</button>
                    </td>
                `;
                customerList.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
            alert('Failed to load customer data.');
        }
    };

    // Handle form submission (Add or Update)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const action = customerIdInput.value ? 'update' : 'add';
        const customerData = {
            id: customerIdInput.value,
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            address: addressInput.value,
            action: action
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });

            const result = await response.json();

            if (result.success) {
                form.reset();
                customerIdInput.value = '';
                submitBtn.textContent = 'Add Customer';
                cancelBtn.style.display = 'none';
                fetchCustomers();
            } else {
                console.error('API Error:', result.error);
                alert('Failed to save customer data.');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            alert('An error occurred while saving data.');
        }
    });

    // Handle Edit and Delete actions
    customerList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`${apiUrl}?action=get_single&id=${id}`);
                const customer = await response.json();
                if (customer) {
                    customerIdInput.value = customer.id;
                    nameInput.value = customer.name;
                    emailInput.value = customer.email;
                    phoneInput.value = customer.phone;
                    addressInput.value = customer.address;
                    submitBtn.textContent = 'Update Customer';
                    cancelBtn.style.display = 'inline-block';
                }
            } catch (error) {
                console.error('Error fetching single customer:', error);
                alert('Failed to load customer data for editing.');
            }

        } else if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this customer?')) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: id,
                            action: 'delete'
                        })
                    });
                    const result = await response.json();
                    if (result.success) {
                        fetchCustomers();
                    } else {
                        console.error('API Error:', result.error);
                        alert('Failed to delete customer.');
                    }
                } catch (error) {
                    console.error('Fetch Error:', error);
                    alert('An error occurred while deleting data.');
                }
            }
        }
    });

    // Cancel Edit
    cancelBtn.addEventListener('click', () => {
        form.reset();
        customerIdInput.value = '';
        submitBtn.textContent = 'Add Customer';
        cancelBtn.style.display = 'none';
    });

    // Initial fetch of customers on page load
    fetchCustomers();
});
