
import React, { useState } from 'react';
import './Productform.css'; 

const ProductForm = ({ onFormSubmit }) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // New error message state//

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields//
    if (!product.name || !product.description || !product.category || !product.price || !product.quantity) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      // POST request to the backend
      const response = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const addedProduct = await response.json(); // Get the added product details//

      // Optionally use addedProduct to update state or UI//
      console.log('Added Product:', addedProduct);

      // Show success message
      setSuccessMessage('Product added successfully!');

      // Clear the form
      setProduct({ name: '', description: '', category: '', price: '', quantity: '' });
      onFormSubmit();

      // Hide success message after 3 seconds//
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error.message); // Handle error message//
      console.error('Error adding product:', error);
    }
  };

  return (
    <div>
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>Add New Product</h2>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={product.category}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Initial Quantity"
          value={product.quantity}
          onChange={handleChange}
        />
        <button type="submit">Add Product</button>
      </form>

      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Optional: Error message */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ProductForm;