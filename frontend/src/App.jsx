import React from "react";
import { Routes, Route } from "react-router-dom";
import './App.css'

import Navbar from './components/navbar/navbar';
import Footer from './components/footer/footer';
import ExploreThemes from './pages/exploreThemes/exploreThemes';
import Menu from './pages/MenuPage/MenuPage';
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import CartPage from "./pages/CartPage/CartPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import AdminUsersPage from "./admin/AdminUsersPage/AdminUsersPage";
import AdminThemesPage from "./admin/AdminThemesPage/AdminThemesPage";
import AdminCategoriesPage from "./admin/AdminCategoriesPage/AdminCategoriesPage";
import AdminProductsPage from "./admin/AdminProductsPage/AdminProductsPage";
import AdminOrdersPage from "./admin/AdminOrdersPage/AdminOrdersPage";
import AdminGeneralInfoPage from "./admin/AdminGeneralInfoPage/AdminGeneralInfoPage";



function App() {
    return (
        <div className="App">
            <Navbar />

            <main className="flex-grow-1">
                <Routes>

                    <Route path="/" element={<ExploreThemes />} />
                    <Route path="/themes" element={<ExploreThemes />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/detail/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />

                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/themes" element={<AdminThemesPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                    <Route path="/admin/products" element={<AdminProductsPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/settings" element={<AdminGeneralInfoPage />} />

                    {/* Catch-all for 404 */}
                    <Route path="*" element={<h2 className="text-center mt-5">404 - Not Found</h2>} />

                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;
