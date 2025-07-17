import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './themes.css';

const ThemesPage = () => {
    const [themes, setThemes] = useState([]);

    useEffect(() => {
        axios.get('/api/themes')
            .then(({ data }) => setThemes(data))
            .catch(err => console.error('Error fetching themes:', err));
    }, []);

    // Loop scroll back to top
    useEffect(() => {
        const onScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 5) {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="themes-page">
            {/* Hero */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center text-center text-white">
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay loop muted
                    src="/video.mp4"
                />
                {/* Black overlay with fixed opacity */}
                <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
                <div className="relative z-20 px-4">
                    <h1
                        className="text-6xl md:text-[10rem] font-bold"
                        style={{ fontFamily: 'MyFont' }}
                    >- DEKA -</h1>
                    <p className="mt-4 text-center text-lg md:text-xl max-w-xl m-auto">
                        Explore curated themes and premium furniture pieces tailored for every mood and aesthetic.
                    </p>
                </div>
            </section>

            {/* Themes */}
            {themes.map(theme => (
                <section
                    key={theme.id}
                    className="relative min-h-screen w-full flex flex-col justify-center text-white p-8 md:p-16"
                >
                    {/* Background + color overlay */}
                    <img
                        src={`/${theme.image}`}
                        alt={theme.name}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div
                        className="absolute inset-0 z-10"
                        style={{ backgroundColor: theme.color, opacity: 0.4 }}
                    />

                    <div className="relative z-20 max-w-7xl mx-auto w-full">
                        <h2
                            className="text-5xl md:text-8xl font-bold mb-2"
                            style={{ fontFamily: 'MyFont' }}
                        >
                            {theme.name}
                        </h2>
                        <p className="text-lg md:text-xl mb-8">{theme.description}</p>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                            {theme.products.map(product => (
                                <a
                                    key={product._id}
                                    href={`/detail/${product._id}`}
                                    className="block bg-white  rounded-xl p-4 shadow-md transition transform hover:scale-105 hover:shadow-lg"
                                >
                                    <img
                                        src={`/${product.image}`}
                                        alt={product.name}
                                        className="h-48 object-contain w-3/5 rounded-lg m-auto mb-8 mt-8"
                                    />
                                    <h3 className="text-xl font-semibold text-black mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-md text-black">${product.price.toFixed(2)}</p>
                                </a>
                            ))}
                        </div>

                        {/* Arrow Button */}
                        <div className="flex justify-center mt-8">
                            <a
                                href={`/menu?theme=${theme.id}`}
                                className="backdrop-blur-[5px] bg-white bg-opacity-30 rounded-full p-3 transition hover:bg-opacity-50"
                            >
                                {/* Simple right-arrow SVG */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
};

export default ThemesPage;
