import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import './MenuPage.css';

const MenuPage = () => {
    const [searchParams] = useSearchParams();

    // State
    const [themes, setThemes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [themeDetail, setThemeDetail] = useState(null);
    const [categoryDetail, setCategoryDetail] = useState(null);

    const [selectedTheme, setSelectedTheme] = useState(searchParams.get('theme') || null);
    const [selectedCat, setSelectedCat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    // Fetch Themes & Categories
    useEffect(() => {
        fetch('/api/menu/themes')
            .then(res => res.json())
            .then(setThemes)
            .catch(console.error);

        axios.get('/api/menu/categories')
            .then(({ data }) => setCategories(data))
            .catch(console.error);
    }, []);

    // Fetch Products whenever filters change
    useEffect(() => {
        const params = new URLSearchParams({
            ...(selectedTheme && { themeId: selectedTheme }),
            ...(selectedCat && { categoryId: selectedCat }),
            search: searchTerm,
            page: currentPage,
            limit: perPage
        });
        fetch(`/api/menu?${params.toString()}`)
            .then(res => res.json())
            .then(({ products, pagination, theme, category }) => {
                setProducts(products);
                setPagination(pagination);
                setThemeDetail(theme);
                setCategoryDetail(category);
            })
            .catch(console.error);
    }, [selectedTheme, selectedCat, searchTerm, currentPage]);

    // Dropdown toggles
    const [openThemeDD, setOpenThemeDD] = useState(false);
    const [openCatDD, setOpenCatDD] = useState(false);


    const gradientStyle = themeDetail
        ? { background: `linear-gradient(to bottom, ${themeDetail.color}4D, transparent)` }  // 30% = 4D hex
        : {};

    return (
        <div className="menu-page">
            {/* Hero + Filter */}
            <section className="relative w-full h-screen/3 flex items-center justify-center">
                {/* Background */}
                {themeDetail?.image
                    ? <img src={`/${themeDetail.image}`} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    : <video className="absolute inset-0 w-full h-full object-cover" src="/video.mp4" autoPlay loop muted />
                }

                {/* Overlay */}
                <div className="absolute inset-0 bg-black opacity-40" />

                {/* Content */}
                <div className="contenter relative z-20 text-center px-6 w-full max-w-3xl space-y-4">
                    {themeDetail ? (
                        <>
                            <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'MyFont', marginBottom: '24px' }}>
                                {themeDetail.name}
                            </h1>
                            <p className="text-lg text-white">{themeDetail.description}</p>
                        </>
                    ) : (
                        <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'MyFont', marginBottom: '24px' }}>
                            Browse Our Menu
                        </h1>
                    )}

                    {/* Filter Form */}
                    <form
                        className="flex flex-wrap gap-4 justify-center items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4"
                        onSubmit={e => { e.preventDefault(); setCurrentPage(1); }}
                    >
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search products…"
                                className="w-full py-2 px-4 rounded-lg focus:outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white text-black py-1 px-3 rounded-md"
                            >
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>

                        {/* Theme Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenThemeDD(!openThemeDD)}
                                className="py-2 px-4 border rounded-lg flex items-center space-x-2"
                            >
                                <span>{selectedTheme
                                    ? themes.find(t => t.id === selectedTheme)?.name
                                    : 'All Themes'}
                                </span>
                                <span className="material-symbols-outlined">arrow_drop_down</span>
                            </button>
                            {openThemeDD && (
                                <ul className="dropdown-list">
                                    <li
                                        onClick={() => { setSelectedTheme(null); setOpenThemeDD(false); }}
                                    >
                                        <span className="dot-circle" style={{ backgroundColor: '#666' }} />
                                        All Themes
                                    </li>
                                    {themes.map(t => (
                                        <li
                                            key={t.id}
                                            onClick={() => {
                                                setSelectedTheme(t.id);
                                                setOpenThemeDD(false);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <span
                                                className="dot-circle"
                                                style={{ backgroundColor: t.color }}
                                            />
                                            {t.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenCatDD(!openCatDD)}
                                className="py-2 px-4 border rounded-lg flex items-center space-x-2"
                            >
                                <span>{selectedCat
                                    ? categories.find(c => c.id === selectedCat)?.name
                                    : 'All Categories'}
                                </span>
                                <span className="material-symbols-outlined">arrow_drop_down</span>
                            </button>
                            {openCatDD && (
                                <ul className="dropdown-list">
                                    <li
                                        onClick={() => { setSelectedCat(null); setOpenCatDD(false); }}
                                    >
                                        All Categories
                                    </li>
                                    {categories.map(c => (
                                        <li
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedCat(c.id);
                                                setOpenCatDD(false);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <img
                                                src={`/${c.icon}`}
                                                alt={c.name}
                                                className="w-5 h-5 mr-2"
                                            />
                                            {c.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </form>
                </div>
            </section>

            <div className="gradient-wrapper" style={gradientStyle}>
                {/* Spacer + Banner */}
                <div className="py-12 text-center banner-content">
                    <h2 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'MyFont' }}>
                        {themeDetail
                            ? `Featured ${themeDetail.name} Pieces`
                            : 'Our Latest Products'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {themeDetail
                            ? themeDetail.description
                            : 'Browse our full catalog of furniture & electronics.'}
                    </p>
                </div>

                {/* Products Grid */}
                <main className="px-4 py-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(p => (
                            <a
                                key={p.id}
                                href={`/detail/${p.id}`}
                                className="block p-4 rounded-lg backdrop-blur-md bg-white/50 transition-transform hover:scale-105"
                            >
                                <img
                                    src={`/${p.image}`}
                                    alt={p.name}
                                    className="h-48 object-contain w-3/5 rounded-lg m-auto mb-8 mt-8"
                                />
                                <h3 className="text-lg font-semibold text-black">{p.name}</h3>
                                {/* Two‑line description */}
                                {p.description && (
                                    <p className="product-desc text-sm text-black mt-1">
                                        {p.description}
                                    </p>
                                )}
                                <p className="text-md text-black mt-2 font-bold">
                                    ${p.price.toFixed(2)}
                                </p>
                            </a>
                        ))}
                    </div>


                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-3 mt-8">
                            <button
                                className="px-3 py-1 border rounded-md"
                                disabled={pagination.currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Prev
                            </button>
                            {Array.from({ length: pagination.totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`px-3 py-1 border rounded-md ${pagination.currentPage === i + 1 ? 'bg-black text-white' : ''}`}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="px-3 py-1 border rounded-md"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>
            </div>

        </div>
    );
};

export default MenuPage;
