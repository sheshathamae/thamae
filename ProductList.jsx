
import React, { useState, useEffect } from 'react';
import './Productlist.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  // Fetch products from the backend on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/products'); 
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(product => product.id !== id));
      setMessage('Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const editProduct = (index) => {
    setCurrentProductIndex(index);
    setCurrentProduct({ ...products[index] });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedProduct = { ...currentProduct };

    try {
      const response = await fetch(`http://localhost:5000/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const data = await response.json(); // Get the updated product data
      const updatedProducts = [...products];
      updatedProducts[currentProductIndex] = data;

      setProducts(updatedProducts);
      setIsEditing(false);
      setCurrentProductIndex(null);
      setCurrentProduct({
        name: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
      });
      setMessage('Product updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const addStock = async (id) => {
    const quantityToAdd = parseInt(prompt('Enter quantity to add:'));
    if (!isNaN(quantityToAdd) && quantityToAdd > 0) {
        try {
            // Make a POST request to the backend to add stock
            const response = await fetch(`http://localhost:5000/products/${id}/stock/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: quantityToAdd }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update the local products state with the new quantity
                const updatedProducts = products.map(product => {
                    if (product.id === id) {
                        return { ...product, quantity: data.product.quantity };
                    }
                    return product;
                });

                setProducts(updatedProducts);
                setMessage('Stock added successfully!');
            } else {
                alert(data); // Show error message returned from backend
            }
        } catch (error) {
            console.error("Error adding stock:", error);
        }
    } else {
        alert('Invalid quantity entered!');
    }
};

const deductStock = async (id) => {
    const quantityToDeduct = parseInt(prompt('Enter quantity to deduct:'));
    if (!isNaN(quantityToDeduct) && quantityToDeduct > 0) {
        try {
            // Make a POST request to the backend to deduct stock
            const response = await fetch(`http://localhost:5000/products/${id}/stock/deduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: quantityToDeduct }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update the local products state with the new quantity
                const updatedProducts = products.map(product => {
                    if (product.id === id) {
                        return { ...product, quantity: data.product.quantity };
                    }
                    return product;
                });

                setProducts(updatedProducts);
                setMessage('Stock deducted successfully!');
            } else {
                alert(data); // Show error message returned from backend
            }
        } catch (error) {
            console.error("Error deducting stock:", error);
        }
    } else {
        alert('Invalid quantity entered!');
    }
};


  // Function to filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="product-list">
      <h2>Product List</h2>

      {message && <div className="success-message">{message}</div>}

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Form for editing a product */}
      {isEditing && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={currentProduct.name}
            onChange={handleInputChange}
            placeholder="Product Name"
            required
          />
          <input
            type="text"
            name="description"
            value={currentProduct.description}
            onChange={handleInputChange}
            placeholder="Description"
            required
          />
          <input
            type="text"
            name="category"
            value={currentProduct.category}
            onChange={handleInputChange}
            placeholder="Category"
            required
          />
          <input
            type="number"
            name="price"
            value={currentProduct.price}
            onChange={handleInputChange}
            placeholder="Price"
            required
          />
          <input
            type="number"
            name="quantity"
            value={currentProduct.quantity}
            onChange={handleInputChange}
            placeholder="Quantity"
            required
          />
          <button type="submit">Update Product</button>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.quantity}</td>
                <td>
                  <button onClick={() => addStock(product.id)}>Add Stock</button>
                  <button onClick={() => deductStock(product.id)}>Deduct Stock</button>
                  <button onClick={() => editProduct(products.indexOf(product))}>Edit</button>
                  <button onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No products available</td>
            </tr>
          )}
        </tbody>
      </table>
          
      {/* Transaction history could similarly be fetched and handled */}
    </div>
  );
};

export default ProductList;