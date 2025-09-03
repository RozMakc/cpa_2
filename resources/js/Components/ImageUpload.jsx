import { useState } from "react";

export default function ImageUpload ({ data, setData }){
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        console.log(file)
        if (file) {
            setData(file);
            
            // Создаем preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            handleFileChange({ target: { files: [files[0]] } });
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <>

            <div className="p-4 sm:p-6">
                {previewUrl ? (
                    <div className="relative">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setData(null);
                                setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <label 
                        htmlFor="product-image" 
                        className="shadow-theme-xs group hover:border-brand-700 border-brand-500 block cursor-pointer rounded-lg border-2 border-dashed  transition"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <div className="flex justify-center p-10">
                            <div className="flex max-w-[260px] flex-col items-center gap-4">
                                <div className="inline-flex h-13 w-13 items-center justify-center rounded-full border  transition border-gray-600 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.0004 16V18.5C20.0004 19.3284 19.3288 20 18.5004 20H5.49951C4.67108 20 3.99951 19.3284 3.99951 18.5V16M12.0015 4L12.0015 16M7.37454 8.6246L11.9994 4.00269L16.6245 8.6246" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-medium text-gray-800 dark:text-white/90">Добавить изображение</span>
                                </p>
                            </div>
                        </div>
                        <input 
                            id="product-image" 
                            className="hidden" 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>
        </>
    );
};